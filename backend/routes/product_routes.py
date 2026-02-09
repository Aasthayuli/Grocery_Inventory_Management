from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.database import db
from config.logging_config import AppLogger
from models import Product, Category, Supplier, User
from utils import (
        success_response,
        error_response,
        validate_required_fields,
        paginate_query,
        parse_date,
        generate_and_save_barcode
)
from datetime import datetime, timedelta


product_bp = Blueprint('products', __name__, url_prefix= '/api/products')


logger = AppLogger.get_logger(__name__)

@product_bp.route('',methods=['GET'])
@jwt_required()
def get_all_products():
    """
    Get all products with pagination, filtering and search

    Query parameters:
        page: Page number (default: 1)
        per_page: Items per page (default: 10)
        category_id: Filter by category
        supplier_id: Filter by supplier
        search: Search in product name/ SKU
        low_stock: Filter low stock items
        expiring: Filter expiring items

    Returns:
        200: list of products with pagination
    """
    try:
        # pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Build query
        query = Product.query

        # filter by category
        category_id = request.args.get('category_id', type=int)
        if category_id:
            query = query.filter_by(category_id = category_id)

        # filter by supplier
        supplier_id = request.args.get('supplier_id', type=int)
        if supplier_id:
            query = query.filter_by(supplier_id=supplier_id)

        # Search in name or SKU
        search = request.args.get('search','').strip()
        if search:
            query = query.filter(
                db.or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.sku.ilike(f'%{search}%')
                )
            )

        # Filter low stock
        if request.args.get('low_stock') == 'true':
            query = query.filter(Product.quantity <= 10)

        # filter expiring soon
        if request.args.get('expiring') == 'true':
            expiry_threshold = datetime.now().date() + timedelta(days=7)
            query = query.filter(
                Product.expiry_date.isnot(None),
                Product.expiry_date <= expiry_threshold
            )

        # Order by created date (newest first)
        query = query.order_by(Product.created_at.desc())

        # Paginate
        result = paginate_query(query, page, per_page)

        # Include relations in response
        products_data = [p.to_dict(include_relations=True) for p in result['items']]

        # logger.info(f'Products fetched: Page: {page}, total: {result["total"]}')

        return success_response(
            'Products retrieved successfully!',
            data={
                'products':products_data,
                'pagination': {
                    'total':result['total'],
                    'pages':result['pages'],
                    'current_page':result['current_page'],
                    'per_page':result['per_page'],
                    'has_next':result['has_next'],
                    'has_prev':result['has_prev']
                }
            }
        )
    except Exception as e:
        logger.error(f'Get products error: {str(e)}')
        return error_response('Failed to fetch products', status_code=500)

@product_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """
        Get single product by Product ID
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            logger.warning(f'Product not found: ID: {product_id}')
            return error_response('Product not Found', status_code= 404)

        logger.info(f'Product fetched: {product.name} (ID: {product_id})')

        return success_response(
            'Product retrieved successfully!',
            data=product.to_dict(include_relations=True)
        )
    except Exception as e:
        logger.error(f'get single product error: {str(e)}')
        return error_response(f'Failed to fetch product!', status_code= 500)

@product_bp.route('', methods=['POST'])
@jwt_required()
def insert_product():
    """
    Insert new product

    Response Body: {
        "name":"milk",
        "sku": "MLK-001",
        "price": 60.00,
        "quantity": 100,
        "category_id":1,
        "supplier_id":1,
        "expiry_date":"2026-01-31" (optional),
        "barcode":"123456789012" (optional, auto generated if not provided)
    }
    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields=["name", "sku", "price","quantity", "category_id", "supplier_id"]
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            error_response(f'Missing required fields: {missing}', status_code=400)

        # check if SKU already exists
        if Product.query.filter_by(sku=data['sku']).first():
            logger.warning(f'Product insertion failed - SKU exists: {data["sku"]}')
            return error_response('SKU already exists', status_code= 400)

        # verify if category exists
        category= Category.query.get(data['category_id'])
        if not category:
            return error_response(f'Category not found', status_code= 404)

        # verify if category exists
        supplier = Supplier.query.get(data['supplier_id'])
        if not supplier:
            return error_response(f'Supplier not found', status_code=404)

        # parse expiry date if provided
        expiry_date = None
        if 'expiry_date' in data and data['expiry_date']:
            expiry_date = parse_date(data['expiry_date'])
            if not expiry_date:
                return error_response('Invalid Expiry Date format. Use YYYY-MM-DD', status_code=400)

        # create product
        new_product = Product(
            name=data['name'].strip(),
            sku=data['sku'].strip(),
            price=float(data['price']),
            quantity=int(data['quantity']),
            category_id=data['category_id'],
            supplier_id=data['supplier_id'],
            expiry_date=expiry_date,
            barcode=data.get('barcode')  # optional
        )

        db.session.add(new_product)
        db.session.commit()

        # Generate barcode if not provided
        if not new_product.barcode:
            try:
                from config.cloudinary_config import upload_to_cloudinary
                storage_mode = current_app.config.get('IMAGE_STORAGE', 'local')

                if storage_mode == 'cloud':
                    barcode_info = generate_and_save_barcode(
                        product_id=new_product.id,
                        product_name=new_product.name,
                        storage_mode='cloud',
                        cloudinary_upload_fn=upload_to_cloudinary
                    )
                else:
                    barcode_info= generate_and_save_barcode(
                        product_id=new_product.id,
                        product_name=new_product.name,
                        storage_mode='local',
                    )

                new_product.barcode = barcode_info['barcode_number']
                db.session.commit()
                logger.info(f'Barcode generated for product: {new_product.name}')
            
            except Exception as barcode_error:
                logger.error(f'Barcode generation failed: {str(barcode_error)}')
                # continue without barcode non critical

        logger.info(
            f'Product Created: {new_product.name} (SKU: {new_product.sku}),'
            f'ID: {new_product.id}, Stock:{new_product.quantity}'
        )

        return success_response(f'New Product inserted successfully', data= new_product.to_dict(include_relations=True), status_code=201)
    except ValueError as e:
        db.session.rollback()
        logger.error(f'Product creation validation error: {str(e)}')
        return error_response('Invalid data format', status_code=400)
    except Exception as e:
        db.session.rollback()
        logger.error(f'Product creation error {str(e)}')
        return error_response('Product insertion failed!', status_code=500)

@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """
    Update existing product

    Request body: {
        "name":"milk",
        "sku":"MLK-001",
        "price":60.00,
        "quantity": 100,
        "category_id":1,
        "supplier_id":1,
        "created_at":(optional),
        "expiry_date": (optional)

    """
    try:
        product = Product.query.get(product_id)

        if not product:
            logger.warning(f'Product update failed - not Found ID: {product_id}')
            return error_response(f'Product not found', status_code= 404)

        data = request.get_json()

        # update fields if provided
        if 'name' in data:
            product.name = data['name'].strip()

        if 'sku' in data:
            new_sku = data['sku'].strip().upper()
             # check if new SKU already exists (except current product)
            existing =Product.query.filter(
                Product.sku == new_sku,
                product.id != product_id
            ).first()
            if existing:
                return error_response('SKU already exists', status_code= 400)
            product.sku = new_sku

        if 'price' in data:
            product.price = float(data['price'])

        if 'quantity' in data:
            product.quantity = int(data['quantity'])

        if 'category_id' in data:
            category = Category.query.get(data['category_id'])
            if not category:
                return error_response('Category not found', status_code= 404)
            product.category_id = data['category_id']

        if 'supplier_id' in data:
            supplier = Supplier.query.get(data['supplier_id'])
            if not supplier:
                return error_response('Supplier not found', status_code= 404)
            product.supplier_id = data['supplier_id']

        if 'expiry_date' in data:
            if data['expiry_date']:
                expiry_date = parse_date(data['expiry_date'])
                if not expiry_date:
                    return error_response('Invalid Expiry date format', status_code=400)
                product.expiry_date = expiry_date
            else:
                product.expiry_date = None


        product.updated_at = datetime.utcnow()
        db.session.commit()

        logger.info(f'Product Updated: {product.name} (ID: {product.id})')

        return success_response(f'Product {product.id} - {product.name} updated successfully!', data= product.to_dict(include_relations=True))
    except ValueError as e:
        logger.error(f'Product update Validation error: {str(e)}')
        return error_response('Invalid Data format', status_code=400)
    except Exception as e:
        db.session.rollback()
        logger.error(f'Product update error: str{e}')
        return error_response(f'Failed to update product', status_code= 500)

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """
    Delete Product( Admin Only)

    """
    try:

        # Get current user
        current_user_id = int(get_jwt_identity())  # Token contains User.id (encrypted inside token)
        current_user = User.query.get(current_user_id)

        # check if admin
        if current_user.role != 'admin':
            logger.warning(
                f'Unauthorized delete attempt: {current_user_id}'
                f'tried to delete product: {product_id}'
            )
            return error_response(f'Admin access required!', status_code= 403)

        product = Product.query.get(product_id)

        if not product:
            return error_response(f'Product not found', status_code= 404)

        product_name = product.name
        product_sku = product.sku
        product_barcode = product.barcode

        db.session.delete(product)
        db.session.commit()

        # delete Barcode image
        storage_mode = current_app.config.get('IMAGE_STORAGE', 'local')
        import os
        from config.cloudinary_config import delete_from_cloudinary
        if storage_mode == 'local':
            base_url = current_app.config.get('LOCAL_BARCODE_BASE_URL')
            barcode_path = f"{base_url}static/barcodes/barcode_{product_barcode}.png"
            if os.path.exists(barcode_path):
                os.remove(barcode_path)
        else:
            # cloud mode
            result = delete_from_cloudinary(product_barcode)
            if result.get("result") != "ok":
                logger.error(f"Cloudinary Image delete failed: {result}")

        logger.info(
            f'Product deleted: {product_name} (SKU: {product_sku}, ID: {product_id})'
            f'by user {current_user.username}'
        )
        return success_response(f'Product deleted successfully')

    except Exception as e:
        db.session.rollback()
        logger.error(f'Product delete error: {str(e)}')
        return error_response(f'Failed to delete Product!', status_code= 500)

@product_bp.route('/expiring', methods=['GET'])
@jwt_required()
def get_expiring_products():
    """
    Get products expiring within specified days

    Query parameters:
        days: Days threshold ( Default 7 days)
    """
    try:
        days = request.args.get('days', 7, type=int)

        expiry_threshold = datetime.now().date() + timedelta(days=days)

        # product is expiring between current date to 7 days later date!
        products = Product.query.filter(
            Product.expiry_date.isnot(None),
            Product.expiry_date <= expiry_threshold,
            Product.expiry_date >= datetime.now().date() # not already expired
        ).order_by(Product.quantity).all()

        logger.info(f'Expiring products fetched: {len(products)} items within {days} days')

        return success_response(
            f'products expiring within {days} days',
            data=[p.to_dict(include_relations=True) for p in products]
        )
    except Exception as e:
        logger.error(f'Error in getting Expiring products: {str(e)}')
        return error_response(f'Failed to fetch expiring products', status_code= 500)

@product_bp.route('/expired', methods=['GET'])
@jwt_required()
def get_all_expired():
    """
    Get expired products
    """
    try:

        expiry_threshold = datetime.now().date()

        products = Product.query.filter(
            Product.expiry_date.isnot(None),
            Product.expiry_date <= expiry_threshold
        ).order_by(Product.quantity).all()

        logger.info(f'Expired products fetched: {len(products)} items ')

        return success_response(
            f'{len(products)} products expired!',
            data=[p.to_dict(include_relations=True) for p in products]
        )
    except Exception as e:
        logger.error(f'Error in getting Expired products: {str(e)}')
        return error_response(f'Failed to fetch Expired products', status_code= 500)


@product_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock_products():
    """
    Get products with low stock

    Query parameters:
        threshold: stock threshold (default: 10)
    """
    try:
        threshold = request.args.get('threshold', 10, type=int)

        products = Product.query.filter(
            Product.quantity <= threshold
        ).order_by(Product.quantity.asc()).all()


        logger.info(f'Low stock products fetched: {len(products)} items')

        return success_response(f'Products with stocks <= {threshold}', data=[p.to_dict() for p in products])

    except Exception as e:
        logger.error(f'Error in fetching low stock products: {str(e)}')
        return error_response(f'Failed to fetch low stock products', status_code= 500)








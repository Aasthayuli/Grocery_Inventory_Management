from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.database import db
from config.logging_config import AppLogger
from models import Supplier, User
from utils import (
        success_response,
        error_response,
        validate_required_fields,
        paginate_query
)


# create Blueprint
supplier_bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')


logger = AppLogger.get_logger(__name__)


@supplier_bp.route('', methods=['GET'])
@jwt_required()               # validates token
def get_all_suppliers():
    """
    Get all suppliers with pagination

    Query parameters:
            page: Page number (default: 10)
            per_page: Items per page (default: 10)
            search: Search in supplier name
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page',10, type=int)

        # Build query
        query = Supplier.query

        # search by name
        search = request.args.get('search','').strip()
        if search:
            query = query.filter(Supplier.name.ilike(f'%{search}%'))

        # order by name
        query = query.order_by(Supplier.name.asc())

        # paginate
        result = paginate_query(query, page, per_page)

        suppliers_data = [s.to_dict() for s in result['items']]

        logger.info(f'Suppliers fetched: page={page}, total= {result["total"]}')

        return success_response(
            f'Suppliers retrieved successfully',
            data = {
                'suppliers': suppliers_data,
                'pagination': {
                    'total': result['total'],
                    'pages': result['pages'],
                    'current_page': result['current_page'],
                    'per_page':result['per_page'],
                    'has_next': result['has_next'],
                    'has_prev': result['has_prev']
                }
            }
        )
    except Exception as e:
        logger.error(f'Error in getting all suppliers: {str(e)}')
        return error_response(f'Failed to get all suppliers!', status_code= 500)

@supplier_bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    """
    Insert new Supplier (Admin only)

    Request Body: {
        "name": "Aastha",
        "contact": "9576XXXXX66",
        "email": "aastha@example.com"(optional),
        "address": "near railway Station, Saharsa" (Optional),
        "created_at": (optional)
        }

    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields = ["name","contact"]
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return  error_response(f'Require missing fields: {missing}')

        # check if supplier name already exists
        if Supplier.query.filter_by(name= data['name'].strip()).first():
            logger.warning(f'Supplier creation failed - Name already exists: {data["name"]}')
            return error_response(f'Supplier name already exists', status_code= 400)

        # Create Supplier
        new_Supplier = Supplier(
            name= data['name'].strip(),
            contact=data['contact'].strip(),
            email = data.get('email').strip().lower() if data.get('email') else None,
            address= data.get('address').strip() if data.get('address') else None,
        )

        db.session.add(new_Supplier)
        db.session.commit()

        logger.info(f'Supplier created: {new_Supplier.name}'
                    f'(ID: {new_Supplier.id}, Contact: {new_Supplier.contact})'
        )

        return success_response('Supplier added successfully', data= new_Supplier.to_dict(), status_code= 201)
    except Exception as e:
        db.session.rollback()
        logger.error(f'Supplier Creation error: {str(e)}')
        return error_response(f'Failed to create supplier', status_code= 500)


@supplier_bp.route('/<int:supplier_id>', methods=['PUT'])
@jwt_required()
def update_supplier(supplier_id):
    """
    Update Supplier Details

    Args:
        supplier_id: Supplier to be updated

    """
    try:
        supplier = Supplier.query.get(supplier_id)

        if not supplier:
            logger.warning(f'Supplier update failed - Not found ID: {supplier_id}')
            return error_response(f'Supplier not found', status_code= 404)

        data = request.get_json()

        # Update fields if provided
        if 'name' in data:
            new_name = data['name'].strip()
            # check if supplier with given name exists (except current supplier)
            existing = Supplier.query.filter(
                new_name == Supplier.name,
                supplier_id != Supplier.id
            ).first()
            if existing:
                return error_response(f'Supplier name already exists', status_code= 400)
            supplier.name = new_name


        if 'contact' in data:
            supplier.contact = data['contact'].strip()

        if 'email' in data:
            supplier.email = data['email'].strip().lower() if data['email'] else None

        if 'address' in data:
            supplier.address = data['address'].strip() if data['address'] else None

        db.session.commit()
        logger.info(f'Supplier updated: {supplier.name} (ID: {supplier_id})')

        return success_response(f'Supplier Updated successfully!', data=supplier.to_dict())

    except Exception as e:
        logger.error(f'Error in Updating Supplier: {str(e)}')
        return error_response(f'Failed to update Supplier!', status_code= 500)

@supplier_bp.route('/<int:supplier_id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(supplier_id):
    """
    Delete particular Supplier (Admin only)

    This will also delete all products from this supplier (cascade)

    Args:
        supplier_id: Supplier to be deleted
    """
    try:
        # check if admin
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        if current_user.role != 'admin':
            logger.error(f'Unauthorized access attempt by {current_user_id}'
                         f'tried to delete {supplier_id}'
            )

        # check supplier exists
        supplier = Supplier.query.get(supplier_id)

        if not supplier:
            return error_response(f'Supplier not found', status_code= 404)

        supplier_name = supplier.name
        product_count = len(supplier.products)

        # Warning if supplier has products
        if product_count > 0:
            logger.warning(f'Deleting supplier with {product_count} products: {supplier_name}')

        db.session.delete(supplier)
        db.session.commit()

        logger.warning(f'Supplier deleted: {supplier_name} (ID: {supplier_id})'
                       f'- {product_count} products deleted by {current_user.username}'
        )

        return success_response(f'Supplier {supplier.name} deleted successfully.'
                                f'{product_count} associated products also deleted.')

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error in deleting Supplier: {str(e)}')
        return error_response('Failed to delete supplier', status_code= 500)


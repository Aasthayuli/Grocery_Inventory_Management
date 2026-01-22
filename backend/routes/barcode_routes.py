"""
Barcode Routes
Generate, search, and manage product barcodes
"""

from flask import Blueprint, current_app,send_file, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from config.database import db
from config.logging_config import AppLogger
from models import Product
from utils import (
        success_response,
        error_response,
        generate_and_save_barcode,
        validate_barcode,
        get_barcode_image_path
)


# create blueprint
barcode_bp = Blueprint('barcode', __name__, url_prefix='/api/barcode')
logger = AppLogger.get_barcode_logger()


@barcode_bp.route('/generate/<int:product_id>', methods=['POST'])
@jwt_required()
def generate_barcode_for_product(product_id):
    """
    Generate barcode for a product

    Returns:
        200: Barcode generated successfully
        404: Product not found
    """
    try:

        product = Product.query.get(product_id)

        if not product:
            logger.warning(f'Barcode generation failed - Product not found: ID {product_id}')
            return error_response(f'Product not found', status_code= 404)

        # check if barcode already exists
        if product.barcode:
            logger.info(f'Product already has a barcode: {product.name} - ({product.barcode})')
            return success_response(
                f'Product already has a Barcode',
                data= {
                    'product_id': product.id,
                    'product_name': product.name,
                    'barcode': product.barcode,
                    'image_path':get_barcode_image_path(product.barcode)
                }
            )

        # generate barcode
        barcode_info = generate_and_save_barcode(product.id, product.name)

        # Update product with barcode
        product.barcode = barcode_info['barcode_number']
        db.session.commit()

        logger.info(
            f'Barcode generated: {product.name} (ID: {product_id}) - '
            f'barcode: {product.barcode}'
        )
        return success_response(
            'Barcode generated successfully',
            data = {
                'product_id': product.id,
                'product_name': product.name,
                'barcode': product.barcode,
                'image_path': barcode_info['image_path']
            }
        )
    except Exception as e:
        db.session.rollback()
        logger.error(f'Barcode generation Error: {str(e)}')
        current_app.logger.error(f'Barcode generation Error: {str(e)}')
        return error_response('Failed to generate Barcode', status_code= 500)

@barcode_bp.route('/search/<barcode_number>', methods=['GET'])
@jwt_required()
def search_by_barcode(barcode_number):
    """
    Search product via Barcode number

    Returns:
        200: product found
        400: Validation Error
        404: Product not found
    """
    try:
        # validate barcode format
        if not validate_barcode(barcode_number):
            logger.warning(f'Invalid Barcode format: {barcode_number}')
            return error_response('Invalid Barcode format', status_code= 400)

        # search product
        product = Product.query.filter_by(barcode = barcode_number).first()

        if not product:
            logger.info(f'Product not found by barcode: {barcode_number}')
            return error_response('Product not found', status_code= 404)

        logger.info(f'Product: {product.name} found by barcode: {barcode_number}')
        return success_response(
            'Product found',
            data= product.to_dict(include_relations=True)
        )
    except Exception as e:
        logger.error(f'Error in Product search via barcode: {str(e)}')
        current_app.logger.error(f'Error in Product search via barcode: {str(e)}')
        return error_response('Barcode search failed', status_code= 500)

@barcode_bp.route('/image/<int:product_id>', methods= ['GET'])
@jwt_required()
def get_barcode_image_url(product_id):
    """
    Get barcode image file URL for a product

    This API does NOT return the image file.
    It only returns the public URL of the barcode image
    based on the product's barcode number.

    Returns:
    200: Product found

    400: Validation Error
        - Product not found
        - Barcode not generated for product

    404: Product not found
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return error_response('Product not found', status_code= 404)
        
        if not product.barcode:
            return error_response('Barcode not Found', status_code= 404)
        
        BASE_URL = current_app.config.get("BARCODE_BASE_URL")

        # get image path
        barcode_url = f"{BASE_URL}/static/barcodes/barcode_{product.barcode}.png"

        return success_response(
            "Barcode fetched",
            data={"barcode_url":barcode_url}
        )
        
    except Exception as e:
        logger.error(f'Error in getting Barcode image URL: {str(e)}')
        current_app.logger.error(f'Error in getting Barcode image URL: {str(e)}')
        return error_response('Failed to retrieve barcode image URL', status_code= 500)


@barcode_bp.route('/regenerate/<int:product_id>', methods=['POST'])
@jwt_required()
def regenerate_barcode(product_id):
    """
    Regenerate barcode for a product (overwrite existing)

    Returns:
        200: barcode generated
        404: product not found
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return error_response(f'Product not found', status_code= 404)

        old_barcode = product.barcode

        # Generate new barcode
        barcode_info = generate_and_save_barcode(product.id, product.name)

        # Update product
        product.barcode = barcode_info['barcode_number']
        db.session.commit()

        logger.info(f'Barcode regenerated: {product.barcode} (ID: {product_id}) - '
                    f'Old: {old_barcode} -> New: {product.barcode}')

        return success_response(
            'Barcode regenerated successfully',
            data= {
                'product_id': product.id,
                'product_name': product.name,
                'old_barcode': old_barcode,
                'new_barcode': product.barcode
            }
        )
    except Exception as e:
        logger.error(f'Error in Barcode regeneration: {str(e)}')
        current_app.logger.error(f'Error in Barcode regeneration: {str(e)}')
        return error_response('Failed to regenerate Barcode!', status_code= 500)

@barcode_bp.route('/validate-barcode', methods=['POST'])
@jwt_required()
def validate_barcode_format():
    """
    Validate Barcode format

    Returns:
        200: Validation result
    """
    try:

        data = request.get_json()

        if 'barcode' not in data:
            return error_response('Barcode field required', status_code= 400)

        barcode = data['barcode'].strip()
        is_valid = validate_barcode(barcode)

        logger.debug(f'Barcode Validation: {barcode} - Valid: {is_valid}')

        return success_response('Barcode validated', data={'barcode':barcode, 'is_valid':is_valid, 'length':len(barcode) if barcode else 0})
    except Exception as e:
        logger.error(f'Barcode Validation Error: {str(e)}')
        current_app.logger.error(f'Barcode Validation Error: {str(e)}')
        return error_response('Barcode Validation failed', status_code= 500)


@barcode_bp.route('/bulk-generate-barcode', methods=['POST'])
@jwt_required()
def bulk_generate_barcode():
    pass











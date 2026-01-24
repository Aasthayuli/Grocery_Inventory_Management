"""
Barcode Routes
Generate, search, and manage product barcodes
"""

from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required

from config.database import db
from config.logging_config import AppLogger
from config.cloudinary_config import upload_to_cloudinary
from models import Product
from utils import (
        success_response,
        error_response,
        generate_and_save_barcode,
        validate_barcode,
)


# create blueprint
barcode_bp = Blueprint('barcode', __name__, url_prefix='/api/barcode')
logger = AppLogger.get_barcode_logger()

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

    Returns:
    200: Product found      
    404: Product not found
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return error_response('Product not found', status_code= 404)
        
        if not product.barcode:
            return error_response('Barcode not Found', status_code= 404)
        
        storage_mode = current_app.config.get('IMAGE_STORAGE', 'local')

        if storage_mode == 'cloud':
            # cloudinary url
            base_url = current_app.config.get("CLOUD_BARCODE_BASE_URL")
            barcode_url = f"{base_url}/image/upload/grocery_barcodes/barcode_{product.barcode}.png"
        else:
            # local url
            base_url = current_app.config.get("LOCAL_BARCODE_BASE_URL")
            barcode_url = f"{base_url}/static/barcodes/barcode_{product.barcode}.png"
        
        return success_response(
            "Barcode URL retrieved",
            data={"barcode_url":barcode_url}
        )
        
    except Exception as e:
        logger.error(f'Error in getting Barcode image URL: {str(e)}')
        current_app.logger.error(f'Error in getting Barcode image URL: {str(e)}')
        return error_response('Failed to retrieve barcode image URL', status_code= 500)














import barcode
from barcode.writer import ImageWriter
import os
from io import BytesIO
from config.logging_config import AppLogger

logger = AppLogger.get_logger(__name__)

def generate_barcode(product_id, product_name=''):
    """
    Generate EAN-13 barcode for a product

    Args:
        product_id: Unique product identifier
        product_name: Product name (for filename)
    Returns:
        str: Barcode number (13 digits)
    """

    try:
        barcode_no = str(product_id).zfill(12)
        print(f'Generated barcode for product: {product_name}')
        return barcode_no
    except Exception as e:
        logger.error(f'Barcode generation failed for product {product_id} - {product_name} : {str(e)}')
        raise

def save_barcode_image_cloud(barcode_no, upload_to_cloudinary):
    """
    Save Barcode to Cloudinary (PRODUCTION)

    Args: 
       barcode_no : 12-digit barcode string
       upload_to_cloudinary: Function to upload to cloudinary

    Returns:
        tuple: (cloudinary_url, actual_barcode_number)
    """
    try:
        # get EAN-13 barcode class
        EAN = barcode.get_barcode_class('ean13')
        ean = EAN(barcode_no, writer= ImageWriter())

        # get actual barcode number (13 digits)
        actual_barcode = ean.get_fullcode()

        # generate barcode in memory
        buffer = BytesIO()
        ean.write(buffer, {})
        buffer.seek(0)

        # save to temporary file for upload
        temp_path = f"temp_barcode_{actual_barcode}.png"
        with open(temp_path, 'wb') as f:
            f.write(buffer.getvalue())
        
        # upload to cloudinary
        cloudinary_result = upload_to_cloudinary(
            file_path = temp_path,
            public_id = f"barcode_{actual_barcode}",
            folder= "grocery_barcodes"
        )

        # delete temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        cloudinary_url = cloudinary_result['secure_url']
        print(f'Barcode uploaded to Cloudinary: {cloudinary_url}')

        return cloudinary_url, actual_barcode
    except Exception as e:
        logger.error(f'failed to save barcode to Cloudinary: {str(e)}')
        raise

def generate_and_save_barcode(product_id, product_name=''):
    """
    Combined Functions: Generate barcode number and save image

    Args:
        product_id: Product ID
        product_name: Product name (for logging)
        cloudinary_upload_fn: Cloudinary upload function (required if cloud)
    
    Returns:
        dict: {
            'barcode_number': str,
            'image_path':'image_url': str(cloud)
        }
    """
    try:
        # Generate barcode number
        barcode_number = generate_barcode(product_id, product_name)
        
        from config.cloudinary_config import upload_to_cloudinary
            
        cloudinary_url, actual_barcode = save_barcode_image_cloud(
                barcode_number, upload_to_cloudinary)
            
        print(f'Barcode saved to cloud: {product_name} - {actual_barcode}')

        return {
                'barcode_number': actual_barcode,
                'image_url':cloudinary_url,
                'storage':'cloud'
            }
        
    except Exception as e:
        logger.error(f'Complete barcode generation failed: {str(e)}')
        raise

def validate_barcode(barcode_number):
    """
    Validate EAN-13 barcode format
    
    Args:
        barcode_number: Barcode string to validate

    """
    try:
        # Check if string
        if not isinstance(barcode_number, str):
            return False
        
        # Check length (12 or 13 digits)
        if len(barcode_number) not in [12, 13]:
            logger.warning(f'Invalid barcode length: {len(barcode_number)}')
            return False
        
        # Check if all digits
        if not barcode_number.isdigit():
            logger.warning(f'Barcode contains non-digit characters')
            return False
        
        logger.debug(f'Barcode validation passed: {barcode_number}')
        return True
    
    except Exception as e:
        logger.error(f'Barcode validation error: {str(e)}')
        return False


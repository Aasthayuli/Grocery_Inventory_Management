import barcode
from barcode.writer import ImageWriter
import os
import tempfile
from io import BytesIO
from config.logging_config import AppLogger
from config.cloudinary_config import upload_to_cloudinary

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
        print(f'12 digit generated barcode for product: {product_name}- {barcode_no}', flush=True)
        return barcode_no
    except Exception as e:
        print(f'12 digit Barcode generation failed for product {product_id} - {product_name} : {str(e)}', flush=True)
        raise

def save_barcode_image_cloud(barcode_no):
    """
    Save Barcode to Cloudinary (PRODUCTION)

    Args: 
       barcode_no : 12-digit barcode string
       upload_to_cloudinary: Function to upload to cloudinary

    Returns:
        tuple: (cloudinary_url, actual_barcode_number)
    
    Raises:
        Exception: If barcode generation or Cloudinary upload fails
    """
    temp_path = None
    try:
        # get EAN-13 barcode class
        EAN = barcode.get_barcode_class('ean13')
        ean = EAN(barcode_no, writer=ImageWriter())

        # get actual barcode number (13 digits)
        actual_barcode = ean.get_fullcode()
        print(f'Generated EAN-13 barcode: {actual_barcode}', flush=True)

        # generate barcode in memory
        buffer = BytesIO()
        try:
            ean.write(buffer)
            buffer.seek(0)
        except Exception as e:
            print(f'Error generating barcode image in memory: {str(e)}', flush=True)
            raise Exception(f'Failed to generate barcode image: {str(e)}') from e

        try:
        # save to temporary file in system temp directory 
            with tempfile.NamedTemporaryFile(
                suffix='.png',
                prefix=f'barcode_{actual_barcode}_',
                delete=False,
                dir=tempfile.gettempdir()
            ) as temp_file:
                temp_path = temp_file.name
                temp_file.write(buffer.getvalue())
                print(f'Barcode image saved to temp: {temp_path}', flush=True)
                print("Temp file size:", os.path.getsize(temp_path), flush=True)
        except Exception as e:
            print(f'Error saving barcode to temp file: {str(e)}', flush=True)
            raise Exception(f'Failed to save barcode image to temp file: {str(e)}') from e

        # upload to cloudinary
        print(f'Uploading barcode to Cloudinary: {temp_path}', flush=True)
        cloudinary_result = upload_to_cloudinary(
            file_path=temp_path,
            public_id=f"barcode_{actual_barcode}",
            folder="grocery_barcodes"
        )

        cloudinary_url = cloudinary_result['secure_url']
        print(f'Barcode successfully uploaded to Cloudinary: {cloudinary_url}', flush=True)

        return cloudinary_url, actual_barcode
        
    except Exception as e:
        error_msg = f'Failed to save barcode to Cloudinary: {str(e)}'
        print(error_msg, flush=True)
        raise Exception(error_msg) from e
    
    finally:
        # ensure temporary file is cleaned up
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                print(f'Cleaned up temp file: {temp_path}', flush=True)
            except Exception as cleanup_error:
                print(f'Failed to clean up temp file {temp_path}: {str(cleanup_error)}', flush=True)

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
            
        cloudinary_url, actual_barcode = save_barcode_image_cloud(
                barcode_number)
            
        print(f'Barcode saved to cloud: {product_name} - {actual_barcode}', flush=True)

        return {
                'barcode_number': actual_barcode,
                'image_url':cloudinary_url,
                'storage':'cloud'
            }
        
    except Exception as e:
        print(f'Complete barcode generation failed: {str(e)}', flush=True)
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


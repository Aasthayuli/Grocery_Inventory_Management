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

def save_barcode_image_local(barcode_no, output_dir='static/barcodes'):
    """
    Save barcode as PNG images Locally (DEVELOPMENT)

    Args:
        barcode_no: 12-digit barcode string
        output_dir: Directory to save barcode images

    Returns:
        tuple: (image_path, actual_barcode_number)

    """

    try:
        # create output directory if not exists
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # returns a python class(blueprint) for EAN-13 barcode
        EAN = barcode.get_barcode_class('ean13')

        # instantiated Barcode object with 12 digit barcode and writer decides output format(JPEG/PNG) of image and drawing logic(bars, spacing, text)
        ean = EAN(barcode_no, writer=ImageWriter()) 

        # Generate image
        temp_path = os.path.join(output_dir, "temp_barcode")

        # ImageWrite() draws the image using PIL(pillow)-draws bars, write numbers and creates file and then save barcode image
        saved_path = ean.save(temp_path)

        # Get actual barcode number (13 digits) from image
        actual_barcode = ean.get_fullcode()

        # rename file using actual barcode number
        final_path = os.path.join(output_dir, f"barcode_{actual_barcode}.png")
        os.rename(saved_path, final_path)

        logger.info(f'Barcode image saved locally at: {final_path} with Barcode number: {actual_barcode}')

        return final_path, actual_barcode
    except Exception as e:
        logger.error(f'Failed to save barcode image locally: {str(e)}')
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
        ean.write(buffer)
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

def generate_and_save_barcode(product_id, product_name='', storage_mode='local', cloudinary_upload_fn=None):
    """
    Combined Functions: Generate barcode number and save image

    Args:
        product_id: Product ID
        product_name: Product name (for logging)
        storage_mode: 'local' or 'cloud'
        cloudinary_upload_fn: Cloudinary upload function (required if cloud)
    
    Returns:
        dict: {
            'barcode_number': str,
            'image_path':str (local) or 'image_url': str(cloud)
        }
    """
    try:
        # Generate barcode number
        barcode_number = generate_barcode(product_id, product_name)
        
        # Local Storage (DEVELOPEMENT)
        if storage_mode == 'local':
            image_path, actual_barcode = save_barcode_image_local(barcode_number)
            logger.info(f'Barcode saved locally: {product_name} - {actual_barcode}')
            return {
                'barcode_number':actual_barcode,
                'image_url': image_path,
                'storage_mode':'local'
            }
        
        elif storage_mode == 'cloud':

            if not cloudinary_upload_fn:
                raise ValueError("Cloudinary upload function required for cloud storage")
            
            cloudinary_url, actual_barcode = save_barcode_image_cloud(
                barcode_number, cloudinary_upload_fn)
            
            logger.info(f'Barcode saved to cloud: {product_name} - {actual_barcode}')

            return {
                'barcode_number': actual_barcode,
                'image_url':cloudinary_url,
                'storage':'cloud'
            }
        else:
            raise ValueError(f"Invalid Storage Mode: {storage_mode}. Use 'local' or 'cloud'")
    
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


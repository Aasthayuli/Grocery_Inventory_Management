"""
Barcode generator Utility
Generates EAN-13 barcodes for products
"""

import barcode
from barcode.writer import ImageWriter
import os
import logging

logger = logging.getLogger(__name__)

def generate_barcode(product_id, product_name=''):
    """
    Generate EAN-13 barcode for a product

    Args:
        product_id: Unique product identifier
        product_name: Product name (for filename)
    Returns:
        str: Barcode number (13 digits)
    
    Example:
        barcode_number = generate_barcode(5, 'Milk')
        Returns : '0000000000050'
    """

    try:
        barcode_no = str(product_id).zfill(12)
        logger.info(f'Generated barcode for product: {product_name}')
        return barcode_no
    except Exception as e:
        logger.error(f'Barcode generation failed for product {product_id} - {product_name} : {str(e)}')
        raise

def save_barcode_image(barcode_no, output_dir='static/barcodes'):
    """
    Save barcode as PNG images

    Args:
        barcode_no: 12-digit barcode string
        output_dir: Directory to save barcode images

    Returns:
        str: Path to saved image file
        str: Actual barcode number

    Example:
        path = save_barcode_image('000000000005')
        saves to: 'static/barcodes/barcode_0000000000051.png (1 is checksum added)
    """

    try:
        # create output directory if not exists
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            logger.info(f'Created barcode directory: {output_dir}')

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

        logger.info(f'Barcode image saved at: {final_path} with Barcode number: {actual_barcode}')

        return final_path, actual_barcode
    except Exception as e:
        logger.error(f'Failed to save barcode image: {str(e)}')
        raise

def generate_and_save_barcode(product_id, product_name=''):
    """
    Combined Functions: Generate barcode image and save image

    Args:
        product_id: Product ID
        product_name: Product name (for logging)
    
    Returns:
        dict: Barcode details
    
    Example:
        result = generate_and_save_barcode(5, 'Milk')
    """
    try:
        # Generate barcode number
        barcode_number = generate_barcode(product_id, product_name)
        
        # Save barcode image
        image_path, actual_barcode = save_barcode_image(barcode_number)
        
        logger.info(
            f'Complete barcode generation: Product {product_id} ({product_name}) '
            f'- Barcode: {actual_barcode}'
        )
        
        return {
            'barcode_number': actual_barcode,
            'image_path': image_path
        }
    
    except Exception as e:
        logger.error(f'Complete barcode generation failed: {str(e)}')
        raise

def validate_barcode(barcode_number):
    """
    Validate EAN-13 barcode format
    
    Args:
        barcode_number: Barcode string to validate
    
    Returns:
        bool: True if valid, False otherwise
    
    Example:
        is_valid = validate_barcode('0000000000050')
        # Returns: True (12 digits + checksum = 13)
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


def get_barcode_image_path(barcode):
    """
    Get barcode image path for a product
    
    Args:
        barcode: barcode number
    
    Returns:
        str: Path to barcode image
    
    Example:
        path = get_barcode_image_path(5)
        # Returns: 'static/barcodes/product_5.png'
    """
    
    return f'static/barcodes/barcode_{barcode}.png'
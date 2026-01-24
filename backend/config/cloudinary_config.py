"""
Cloudinary Configuration
handles cloud image storage
"""

import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

def init_cloudinary():
    """Initialize Cloudinary with credentials from .env"""
    try:
        cloudinary.config(
            cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key= os.getenv('CLOUDINARY_API_KEY'),
            api_secret = os.getenv('CLOUDINARY_API_SECRET'),
            secure=True
        )
        logger.info("Cloudinary Configured Successfully")
    except Exception as e:
        logger.error(f"Cloudinary Configuration failed: {str(e)}")
        raise

def upload_to_cloudinary(file_path, public_id, folder= "grocery_barcodes"):
    """
    Upload image to Cloudinary
    
    Args:
        file_path: Local file path
        public_id: Unique identifier (barcode number)
        folder: Folder name in Cloudinary

    Returns:
        dict: Upload result with secure_url
    """
    try:
        result = cloudinary.uploader.upload(
            file_path,
            public_id=public_id,
            folder=folder,
            resource_type="image",
            overwrite=True
        )
        print(f"Image Uploaded : {result['secure_url']}")
        return result
    except Exception as e:
        print(f"Cloudinary Upload Error: {str(e)}")
        raise

def delete_from_cloudinary(public_id, folder="grocery_barcodes"):
    """Delete image from Cloudinary"""
    try:
        full_public_id = f"{folder}/barcode_{public_id}"
        result = cloudinary.uploader.destroy(full_public_id)
        logger.info(f"Image deleted: {public_id}")
        return result

    except Exception as e:
        logger.error(f"Cloudinary delete error: {str(e)}")
        raise
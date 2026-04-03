import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from config.logging_config import AppLogger

logger = AppLogger.get_logger(__name__)

load_dotenv()

def init_cloudinary():
    """
    Initialize Cloudinary with credentials from environment variables.    
    Raises:
        ValueError: If required Cloudinary credentials are missing
    """
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if not all([cloud_name, api_key, api_secret]):
        error_msg = (
            "Missing required Cloudinary credentials in environment variables. "
            "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
        )
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True
    )
    print("Cloudinary init called", flush=True)
    print("Cloud name:", os.getenv("CLOUDINARY_CLOUD_NAME"), flush=True)
    print("API key:", os.getenv("CLOUDINARY_API_KEY"), flush=True)


def upload_to_cloudinary(file_path, public_id, folder="grocery_barcodes"):
    """
    Upload image to Cloudinary
    
    Args:
        file_path: Local file path to upload
        public_id: Unique identifier (barcode number)
        folder: Folder name in Cloudinary
    
    Returns:
        dict: Upload result with secure_url and other metadata
    
    Raises:
        FileNotFoundError: If file_path doesn't exist
        Exception: If Cloudinary upload fails
    """
    if not os.path.exists(file_path):
        error_msg = f"File not found for upload: {file_path}"
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    
    try:
        logger.debug(f"Uploading file to Cloudinary: {file_path}")
        result = cloudinary.uploader.upload(
            file_path,
            public_id=public_id,
            folder=folder,
            resource_type="image",
            overwrite=True
        )
        logger.info(f"Image uploaded successfully: {result['secure_url']}")
        return result
    except Exception as e:
        error_msg = f"Cloudinary upload error: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg) from e

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
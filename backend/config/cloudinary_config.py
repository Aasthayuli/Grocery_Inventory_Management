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
    """
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if not all([cloud_name, api_key, api_secret]):
        logger.error("Missing required cloudinary credentials in .env")
        raise ValueError("Error in cloudinary initialization")
    
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
    
    """
    if not os.path.exists(file_path):
        logger.error("File not found for uploading")
        raise FileNotFoundError("File not found for uploading")
    
    try:
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
        logger.error(f"Cloudinary upload error: {str(e)}")
        raise Exception("Cloudinary upload error") from e

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
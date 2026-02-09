
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from config.logging_config import AppLogger

logger = AppLogger.get_logger(__name__)

load_dotenv()

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
        logger.info(f"Image Uploaded : {result['secure_url']}")
        return result
    except Exception as e:
        logger.error(f"Cloudinary Upload Error: {str(e)}")
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
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from config.database import db
from config.logging_config import AppLogger
from models import Category, User
from utils import(
        success_response,
        error_response,
        validate_required_fields,
)

# create Blueprint
category_bp = Blueprint('categories', __name__, url_prefix='/api/categories')

logger = AppLogger.get_logger(__name__)

@category_bp.route('', methods=['GET'])
@jwt_required()
def get_all_categories():
    """
    get all categories
    """
    try:
        categories = Category.query.order_by(Category.name.asc()).all()

        categories_data = [cat.to_dict() for cat in categories]

        logger.info(f'categories fetched: {len(categories)} items')
        return success_response('Categories fetched successfully', data=categories_data)
    except Exception as e:
        logger.error(f'Get categories error: {str(e)}')
        return error_response('Failed to fetch categories', status_code=500)

@category_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """
    Create new category

    Request Body:
        {
            "name": "Dairy",
            "description": "Milk and milk products"
        }
    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields = ['name']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return error_response(f'Missing field required: {missing}', status_code= 400)

        # check if category name already exists
        if Category.query.filter_by(name= data['name'].strip()).first():
            return error_response(f'Category name already exists', status_code= 400)

        # create category
        new_category = Category(
            name= data['name'].strip(),
            description=data.get('description', '').strip() if data.get('description') else None
        )

        db.session.add(new_category)
        db.session.commit()

        logger.info(f'New Category added - {new_category}')
        return success_response(f'Category created successfully', data= new_category.to_dict(), status_code= 201)
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error in creating category: {str(e)}')
        return error_response(f'Failed to create category', status_code= 500)

@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """
    Update category

    Request body: same as create_category()

    Args:
        category_id:

    Returns:

    """
    pass

@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """
    Delete Category
    """
    try:

        category = Category.query.get(category_id)

        if not category:
            return error_response('Category not found', status_code= 404)

        # check if admin
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        if current_user.role != 'admin':
            logger.warning(f'Unauthorized access attempt by {current_user.username}'
                           f' tried to delete {category.name}')
            return error_response('Admin access required', status_code= 403)

        category_name = category.name
        product_count = len(category.products)

        if product_count > 0:
            logger.warning(f'Deleting category with {product_count} products: {category_name}')
            pass

        db.session.delete(category)
        db.session.commit()

        logger.info(f'Category Deleted: {category_name} (ID: {category_id}) |'
                                f'{product_count} products deleted by {current_user.username}')
        return success_response(f'Category deleted: {category_name} (ID: {category_id}) |'
                                f'{product_count} products deleted by {current_user.username}')
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error while deleting category: {str(e)}')
        return error_response(f'Failed to delete Category', status_code= 500)





























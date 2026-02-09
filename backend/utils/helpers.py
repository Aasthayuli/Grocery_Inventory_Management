from flask import jsonify
from datetime import datetime
from config.logging_config import AppLogger

logger = AppLogger.get_logger(__name__)

def success_response(message, data=None, status_code=200):
    """
    Standard Success response format
    Returns: 
        JSON response 
    """

    response = {
        'success':True,
        'message': message
    }

    if data is not None:
        response['data'] = data

    return jsonify(response), status_code

def error_response(message, errors=None, status_code=400):
    """
    Standard error response format
    Returns: 
        JSON response
    """
    response = {
        'success' : False,
        'message': message
    }

    if errors is not None:
        response['errors'] = errors

    return jsonify(response)
    
def validate_required_fields(data, required_fields):
    """
    Validate if all required fields are present in the data
    Args:
       data: dictionary to validate
       required_fields: List of required field names
    Example:
        is_valid, missing = validate_required_fields(
            {'name': 'Milk', 'price': 60},
            ['name', 'price', 'quantity']
        )
    """
    if not data:
        return False, required_fields
    
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing_fields.append(field)

    is_valid = len(missing_fields) == 0

    if not is_valid:
        pass

    return is_valid, missing_fields


def parse_date(date_string):
    """
    Parse date string to date object
    Args:
        date_Strign: Date in format 'YYYY-MM-DD'

    Returns: 
        date object or None if invalid

    """
    try:
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except (ValueError, TypeError) as e:
        logger.error(f"Error in parsing date: {str(e)}")
        return None
    

def paginate_query(query, page=1, per_page=10):
    """
    Helper for pagination
    Args:
        query: SQLAlchemy query objetc
        page: Page number (default: 1)
        per_page: Items per page (default: 10)
    Returns:
        dict: Paginated results with metadata
    """
    try:
        pagination = query.paginate(
            page = page,
            per_page = per_page,
            error_out = False
        )

        return {
            'items': pagination.items,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    except Exception as e:
        logger.error(f'Pagination error: {str(e)}')
        return {
            'items': [],
            'total':0,
            'pages':0,
            'current_page':1,
            'per_page': per_page,
            'has_next': False,
            'has_prev': False
        }
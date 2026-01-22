"""
Helper Functions
Common utility functions across the application
"""

from flask import jsonify
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

def success_response(message, data=None, status_code=200):
    """
    Standard Success response format
    Args:
        message : succes message to send
        data : Response data (Optional)
        status_code : HTTP status code for successful operation (default: 200)
    Returns: 
        JSON response with consistent format
    """

    response = {
        'success':True,
        'message': message
    }

    if data is not None:
        response['data'] = data

    logger.debug(f'Success response: {message}')
    return jsonify(response), status_code

def error_response(message, errors=None, status_code=400):
    """
    Standard error response format
    Args:
        message: Error message to send
        error: Detailed Error (optional)
        status_code: HTTP status code for unsuccessful operation (by default: 400)
    Returns: 
        JSON response with consistent format
    """
    response = {
        'success' : False,
        'message': message
    }

    if errors is not None:
        response['errors'] = errors

    logger.warning(f'Error response: {message}')
    return jsonify(response)
    
def validate_required_fields(data, required_fields):
    """
    Validate if all required fields are present in the data
    Args:
       data: dictionary to validate
       required_fields: List of required field names
    Returns:
        tuple: (is_valid, missing)
    Usage:
        is_valid, missing = validate_required_fields(
            {'name': 'Milk', 'price': 60},
            ['name', 'price', 'quantity']
        )
        # returns: (False, ['quantity'])
    """
    if not data:
        return False, required_fields
    
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing_fields.append(field)

    is_valid = len(missing_fields) == 0

    if not is_valid:
        logger.warning(f'validation failed: Missing fields: {missing_fields}')

    return is_valid, missing_fields

def calculate_days_difference(target_date, from_date=None):
    """
    Calculates difference between two dates
    Args:
        target_date: Future date (date or datetime object)
        from_date: Starting date (default: today)
    Returns: 
        int: Number of days (positive = future, negative = past)
    Example:
        days =  calculate_days_difference(product.expiry_date)
        # returns: 15 (expiring in 15 days)
    """

    if from_date is None:
        from_date = datetime.now().date()

    # convert datetime to date if needed
    if isinstance(target_date, datetime):
        target_date = target_date.date()
    if isinstance(from_date, datetime):
        from_date = from_date.date()

    delta = (target_date - from_date).days

    return delta

def format_currency(amount):
    """
    Format amount in Indian Currency (in Rupees)

    Args:
        amount: Numeric Amount
    
    Returns:
        str: Formatted currency string

    Example: 
        format_currency(1234.56) # "₹1,234.56"
    """
    return f'₹{amount:,.2f}'

def parse_date(date_string):
    """
    Parse date string to date object
    Args:
        date_Strign: Date in format 'YYYY-MM-DD'

    Returns: 
        date object or None if invalid
    Example:
        date_obj = parse_date('2026-01-12')
    """
    try:
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except (ValueError, TypeError) as e:
        logger.error(f'Date parsing failed: {date_string} - {str(e)}')
        return None
    
def sanitize_input(text, max_length=None):
    """
    Basic input sanitization
    Args:
        text: Input text to sanitize
        max_length: maximum allowed length (optional)
    Returns: 
        -str: returns sanitized string
    """
    if not text:
        return ''
    
    text = str(text).strip()

    # limit length if specified
    if max_length and len(text) > max_length:
        text = text[:max_length]
        logger.warning(f'Input truncated to {max_length} characters')

    return text

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
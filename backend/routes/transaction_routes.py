"""
Transaction Routes
Stock IN/OUT operations with audit trail logging
"""

from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.database import db
from config.logging_config import AppLogger
from models import User, Product, Transaction
from utils import(
            success_response,
            error_response,
            validate_required_fields,
            paginate_query
)
from datetime import datetime, timedelta

# create Blueprint
transaction_bp = Blueprint('transaction', __name__, url_prefix='/api/transactions')
logger = AppLogger.get_transaction_logger()

@transaction_bp.route('', methods=['GET'])
@jwt_required()
def get_all_transactions():
    """
    Get all transactions with pagination and filtering

    Query Parameters:
        page: Page number (by default: 1)
        per_page: items per page (by default: 10)
        type: Filter by type (IN/OUT)
        product_id: Filter by product
        user_id: Filter by user
        from_date: Filter from date (YYYY-MM-DD)
        to_date: Filter to date (YYYY-MM-DD)

    Returns:
        200: List of transactions
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # build query
        query = Transaction.query

        # filter by type
        transaction_type = request.args.get('type', '').upper()
        if transaction_type in ['IN', 'OUT']:
            query = query.filter_by(type= transaction_type)

        # filter by product
        product_id = request.args.get('product_id',type=int)
        if product_id:
            query = query.filter_by(product_id = product_id)

        # filter by user
        user_id = request.args.get('user_id',type=int)
        if user_id:
            query = query.filter_by(user_id = user_id)

        # filter by date range
        from_date = request.args.get('from_date')
        if from_date:
            query = query.filter_by(Transaction.date >= from_date)

        to_date = request.args.get('to_date')
        if to_date:
            query = query.filter_by(Transaction.date <= to_date)

        # order by date
        query= query.order_by(Transaction.date.desc())

        # paginate
        result = paginate_query(query, page, per_page)

        # Include relations
        transactions_data = [t.to_dict() for t in result['items']]

        logger.info(f'Transactions fetched: Page={page}, total= {result["total"]}')

        return success_response(f'Transactions retrieved successfully',
                                data={
                                    'transactions': transactions_data,
                                    'pagination':{
                                        'page': result['pages'],
                                        'per_page':result['per_page'],
                                        'current_page':result['current_page'],
                                        'has_next': result['has_next'],
                                        'has_prev': result['has_prev']
                                    }
                                }
        )
    except Exception as e:
        logger.error(f'Error in getting transactions: {str(e)}')
        current_app.logger.error(f'Error in getting transactions: {str(e)}')
        return error_response(f'Failed to fetch transactions', status_code=500)


@transaction_bp.route('/stock-in', methods=['POST'])
@jwt_required()
def stock_in():
    """
    Stock IN transaction

    Request Body: {
        "product_id":1,
        "quantity": 100,
        "notes":"Purchased from supplier" (optional)
    }
    Returns:
        201: Stock IN successful
        400: Validation error
        404: Product not found
    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields= ['product_id', 'quantity']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return error_response(f'Missing required fields: {missing}', status_code= 400)

        # get current user
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        # get product
        product = Product.query.get(data['product_id'])
        if not product:
            return error_response('Product not found', status_code= 404)

        # get quantity
        quantity = int(data['quantity'])
        # validate quantity
        if quantity <= 0:
            return error_response('Quantity must be positive', status_code= 400)

        notes = data.get('notes', '').strip() or None

        # create transaction using static method
        transaction = Transaction.create_stock_in(product, quantity, current_user, notes)

        db.session.add(transaction)
        db.session.commit()

        logger.info(
            f'STOCK IN | Product: {product.name} (ID: {product.id}) | '
            f'Qty: ++{quantity} | New Stock: {product.quantity} | '
            f'User: {current_user.username} | Notes: {notes if notes else "N/A"}'
        )
        return success_response(
            f'Stock IN successful',
            data={
                'transaction': transaction.to_dict(include_relations=True),
                'product': product.to_dict()
            },
            status_code= 201
        )
    except ValueError as e:
        logger.error(f'Stock IN validation error: {str(e)}')
        return error_response(str(e), status_code= 400)
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error in StockIN: {str(e)}')
        current_app.logger.error(f'Error in StockIN: {str(e)}')
        return error_response('Stock In failed', status_code= 500)

@transaction_bp.route('/stock-out', methods=['POST'])
@jwt_required()
def stock_out():
    """
    Stock OUT Transaction (Sale/Remove stock)

    Request Body: {
        "product_id": 1,
        "quantity": 10,
        "notes", "sold to customer XYZ" (optional)
        }
    Returns:
        201: Stock OUT successful
        400: Validation error or insufficient stock
        404: Product not found
    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields = ['product_id', 'quantity']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return error_response(f'Missing required fields: {missing}', status_code= 400)

        # get current user
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        # Get product
        product = Product.query.get(data['product_id'])
        if not product:
            return error_response('Product not found', status_code= 404)

        quantity = int(data['quantity'])
        notes = data.get('notes', '').strip() or None


        # validate quantity
        if quantity <= 0:
            return error_response('Quantity must be positive', status_code= 400)

        # create transaction using static method
        transaction = Transaction.create_stock_out(product, quantity,current_user, notes)

        db.session.add(transaction)
        db.session.commit()

        # log to transaction logger
        logger.info(
            f'STOCK OUT | Product: {product.name} (ID: {product.id}) | '
            f'Qty: --{quantity} | New Stock: {product.quantity} | '
            f'User: {current_user.username} | Notes: {notes if notes else "N/A"}'
        )

        # Low stock warning if
        if product.quantity <= 10:
            logger.warning(
                f'LOW STOCK: {product.name} - Only {product.quantity} units remaining'
            )

        return success_response(
            'Stock OUT successful',
            data= {
                'transaction': transaction.to_dict(include_relations=True),
                'product': product.to_dict(),
                'low_stock_warning': product.quantity <= 10
            },
            status_code= 201
        )
    except ValueError as e:
        logger.error(f'Stock OUT validation error: {str(e)}')
        return error_response(str(e), status_code= 400)
    except Exception as e:
        db.session.rollback()
        logger.error(f'Stock OUT error: {str(e)}')
        current_app.logger.error(f'Stock OUT error: {str(e)}')
        return error_response('Stock out Failed', status_code= 500)

@transaction_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_transaction_stats():
    """
    Get Transaction statistics

    Query Parameters:
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)

    Returns:
        200: Transaction Statistics
    """
    try:
        # Date range (Default last 30 days)
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')

        if not from_date:
            from_date = datetime.now() - timedelta(days=30)
        if not to_date:
            to_date = datetime.now()

        # Query Transaction in date range
        transactions = Transaction.query.filter(
            Transaction.date >= from_date,
            Transaction.date <= to_date
        ).all()

        # Calculate Stats
        stock_in_count = sum(1 for t in transactions if t.type == 'IN')
        stock_out_count = sum(1 for t in transactions if t.type == 'OUT')
        stock_in_quantity = sum(t.quantity for t in transactions if t.type == 'IN')
        stock_out_quantity = sum(t.quantity for t in transactions if t.type == 'OUT')
        
        stats = {
            'date_range': {
                'from': str(from_date),
                'to': str(to_date)
            },
            'total_transactions': len(transactions),
            'stock_in':{
                'count': stock_in_count,
                'quantity': stock_in_quantity
            },
            'stock_out': {
                'count': stock_out_count,
                'quantity': stock_out_quantity
            }
        }

        logger.info(f'Transaction Stats fetched between {from_date} to {to_date}')
        return success_response('Transaction Statistics', data= stats)

    except Exception as e:
        logger.error(f'Error in Transaction stats: {str(e)}')
        current_app.logger.error(f'Error in Transaction stats: {str(e)}')
        return error_response('Failed to fetch transaction stats', status_code= 500)









"""
Routes Package Initialization
All API blueprints for the application
"""

from .auth_routes import auth_bp
from .product_routes import product_bp
from .supplier_routes import supplier_bp
from .transaction_routes import transaction_bp
from .barcode_routes import barcode_bp
from .category_routes import category_bp

__all__ = [
    'auth_bp',
    'product_bp',
    'supplier_bp',
    'transaction_bp',
    'barcode_bp',
    'category_bp'
]
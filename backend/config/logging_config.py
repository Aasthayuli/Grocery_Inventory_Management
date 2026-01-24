"""
Logging Configuration for Grocery Inventory System
Implements logging with file rotation and multiple log files (skips file logging in production)
"""

import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime


class AppLogger:
    """Centralized logging system"""

    @staticmethod
    def setup(app):
        """Initialize logging system with file and console handlers"""

        # Clear default handlers
        app.logger.handlers.clear()

        # Set logging level
        if os.getenv('FLASK_ENV') == 'development':
            app.logger.setLevel(logging.DEBUG)
        else:
            app.logger.setLevel(logging.INFO)

        # Console handler (always enabled)
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        console.setFormatter(logging.Formatter('%(levelname)s - %(message)s'))
        app.logger.addHandler(console)

        # File logging only in development
        if os.getenv('FLASK_ENV') == 'development':
            log_dir = 'logs'
            if not os.path.exists(log_dir):
                os.makedirs(log_dir)

            # Main application log
            app_handler = RotatingFileHandler(
                f'{log_dir}/app.log',
                maxBytes=1024 * 1024,
                backupCount=3
            )
            app_handler.setFormatter(logging.Formatter(
                '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
            ))
            app.logger.addHandler(app_handler)

            # Error log
            error_handler = RotatingFileHandler(
                f'{log_dir}/error.log',
                maxBytes=1024 * 1024,
                backupCount=3
            )
            error_handler.setLevel(logging.ERROR)
            error_handler.setFormatter(logging.Formatter(
                '[%(asctime)s] %(levelname)s in %(module)s (Line %(lineno)d): %(message)s'
            ))
            app.logger.addHandler(error_handler)

        # Startup message
        app.logger.info('='*60)
        app.logger.info('============Grocery Inventory Management System Started=============')
        app.logger.info(f'Environment: {os.getenv("FLASK_ENV", "production")}')
        app.logger.info(f'Database: {os.getenv("DB_NAME")}')
        app.logger.info(f'Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
        app.logger.info('='*60)

    @staticmethod
    def _get_logger(name, filename):
        """Helper to create dedicated logger"""
        logger = logging.getLogger(name)

        if not logger.handlers:
            logger.setLevel(logging.INFO)

            # Console logging always enabled
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter('[%(asctime)s] %(message)s'))
            logger.addHandler(console_handler)

            # File logging only in development
            if os.getenv('FLASK_ENV') == 'development':
                log_dir = 'logs'
                if not os.path.exists(log_dir):
                    os.makedirs(log_dir)
                handler = RotatingFileHandler(
                    os.path.join(log_dir, filename),
                    maxBytes=1024*1024,
                    backupCount=3
                )
                handler.setFormatter(logging.Formatter('[%(asctime)s] %(message)s'))
                logger.addHandler(handler)

        return logger

    @staticmethod
    def get_auth_logger():
        return AppLogger._get_logger('auth', 'auth.log')

    @staticmethod
    def get_transaction_logger():
        return AppLogger._get_logger('transaction', 'transaction.log')

    @staticmethod
    def get_product_logger():
        return AppLogger._get_logger('products', 'products.log')

    @staticmethod
    def get_supplier_logger():
        return AppLogger._get_logger('supplier', 'supplier.log')

    @staticmethod
    def get_barcode_logger():
        return AppLogger._get_logger('barcode', 'barcode.log')

    @staticmethod
    def get_category_logger():
        return AppLogger._get_logger('category', 'category.log')

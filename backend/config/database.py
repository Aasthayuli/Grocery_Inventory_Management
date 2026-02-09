from flask_sqlalchemy import SQLAlchemy
from config.logging_config import AppLogger
# create database instance
# It will be used in all models

logger = AppLogger.get_logger(__name__)

db = SQLAlchemy()

def init_db(app):
    """
    Initializes database with flask app
    Creates all tables if they don't exist
    """
    
    logger.info("-"*30)
    logger.info("Initializing Database Connection . . .")
    logger.info("-"*30)
    try:
        db.init_app(app) # initializes database with current app
        with app.app_context(): 
        # import all models here so they are registered with SQLAlchemy
            from models import user, category, supplier, product, transaction
            logger.info("Models imported Successfully !")

            db.create_all()
            logger.info("Database tables created successfully!")

            table_names = db.metadata.tables.keys()
            logger.info(f'Active tables: {", ".join(table_names)}')

    except Exception as e:
        logger.critical(f'Database initialization failed : {str(e)}')

        raise # re-raisinf exception so that the db doesn't start with broken db
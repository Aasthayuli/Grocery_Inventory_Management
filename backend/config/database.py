from flask_sqlalchemy import SQLAlchemy

# create database instance
# It will be used in all models

db = SQLAlchemy()

def init_db(app):
    """
    Initializes database with flask app
    Creates all tables if they don't exist
    """
    
    app.logger.info("-"*30)
    app.logger.info("Initializing Database Connection . . .")
    app.logger.info("-"*30)
    try:
        db.init_app(app) # initializes database with current app
        with app.app_context(): 
        # import all models here so they are registered with SQLAlchemy
            from models import user, category, supplier, product, transaction
            app.logger.info("Models imported Successfully !")

        # create all tables
            db.create_all()
            app.logger.info("Database tables created successfully!")

            table_names = db.metadata.tables.keys()
            app.logger.info(f'Active tables: {", ".join(table_names)}')

    except Exception as e:
        app.logger.critical(f'Database initialization failed : {str(e)}')

        raise # re-raisinf exception so that the db doesn't start with broken db
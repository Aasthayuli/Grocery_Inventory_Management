from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from flask_jwt_extended import JWTManager
from config.logging_config import AppLogger
from config.database import db, init_db

from dotenv import load_dotenv
import os


load_dotenv()

def create_app():
    """
    Application Factory Pattern
    Creates and configures the Flask app
    """

    # Initialize Flask app
    app = Flask(__name__)

    AppLogger.set_up()
    logger = AppLogger.get_logger("app")
    
    logger.info("Starting Flask Application Initialization . . .")

    # Configuration from .env file
    try:
        app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:"
        f"{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:"
        f"{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        )
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
        app.config['IMAGE_STORAGE'] = os.getenv('IMAGE_STORAGE', 'local')
        app.config['LOCAL_BARCODE_BASE_URL'] = os.getenv('LOCAL_BARCODE_BASE_URL')

        logger.info("Flask Application configuration loaded!")
        logger.info(f'Using Database: {os.getenv("DB_NAME")}')
        logger.info(f'Database running on: {os.getenv("DB_HOST")}:{os.getenv("DB_PORT")}')

    except Exception as e:
        logger.error(f'Failed to load configuration . . .')
        raise


    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv('FRONTEND_URL','')
    ]
    allowed_origins= [origin for origin in allowed_origins]

    # Enable CORS(allowed frontend to access backend)
    CORS(app, resources={
        r"/api/*":{
            "origins":allowed_origins,
            "methods":["GET","POST","PUT", "DELETE", "OPTIONS"],
            "allow_headers":["Content-Type", "Authorization"]
        }
    })
    logger.info("CORS enabled for frontend origins")

    # Initialize JWT
    jwt = JWTManager(app)  
    logger.info("JWT authentication initialized.")

    #Initialize database
    init_db(app)  

    # Initialize Cloudinary if cloud Storage
    if app.config['IMAGE_STORAGE'] == 'cloud':
        app.config['CLOUD_BARCODE_BASE_URL'] = os.getenv('CLOUD_BARCODE_BASE_URL')
        logger.info("Cloud Storage Mode enabled")
    else:
        logger.info("Local Storage Mode enabled")
        

    # Register blueprints(routes)
    from routes import auth_bp, product_bp, supplier_bp, transaction_bp, barcode_bp, category_bp
    
    app.register_blueprint(auth_bp)
    logger.info('Authentication routes registered!')

    app.register_blueprint(product_bp)
    logger.info('Product routes registered!')

    app.register_blueprint(supplier_bp)
    logger.info('Supplier routes registered!')

    app.register_blueprint(transaction_bp)
    logger.info('Transaction routes registered!')
    
    app.register_blueprint(barcode_bp)
    logger.info('Barcode routes registered!')

    app.register_blueprint(category_bp)
    logger.info('Category routes registered!')

    # Test route
    @app.route("/")
    def home():
        logger.debug("Root endpoint accessed!")
        return {
            'message': 'Inventory Management API',
            'status': 'running',
            'version' : '1.0',
            'Storage Mode':app.config['IMAGE_STORAGE']
        }
    
    @app.route("/api/health")
    def health_check():
        logger.debug("health endpoint accessed.")
        try:
            db.session.execute(text("SELECT 1"))
            logger.info("Health check passed !")
            return {
                'status' : 'healthy',
                'database' : 'connected'
            }
        except Exception as e:    
           logger.error(f'Health check failed : {str(e)}') 
           return{
               'status' : 'unhealthy',
               'database' : 'disconnected',
               'error' : str(e)
           }
        
    logger.info("-"*30)
    logger.info("Application initialized successfully!")
    logger.info("-"*30)
    return app


# create app instance
app = create_app()

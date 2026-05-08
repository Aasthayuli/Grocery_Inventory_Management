from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from flask_jwt_extended import JWTManager
from config.logging_config import AppLogger
from config.database import db, init_db
from config.cloudinary_config import init_cloudinary

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
        app.config['CLOUD_BARCODE_BASE_URL']= os.getenv('CLOUD_BARCODE_BASE_URL')
        
        # Initialize Cloudinary
        try:
            init_cloudinary()
            logger.info("Cloudinary initialized successfully")
        except ValueError as cloudinary_error:
            logger.error(f"Cloudinary initialization failed: {str(cloudinary_error)}")

    except Exception as e:
        logger.error(f'Failed to load configuration . . .')
        raise


    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv('FRONTEND_URL','')
    ]

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
        return {
            'message': 'Inventory Management API',
            'status': 'running'
        }
    
    @app.route("/api/health")
    def health_check():
        try:
            db.session.execute(text("SELECT 1"))
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

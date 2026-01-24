from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from flask_jwt_extended import JWTManager
from config.database import db, init_db
from config.logging_config import AppLogger
from config.cloudinary_config import init_cloudinary
from dotenv import load_dotenv
import os


# load environment variables from .env file
load_dotenv()

def create_app():
    """
    Application Factory Pattern
    Creates and configures the Flask app
    """

    # Initialize Flask app
    app = Flask(__name__)
    
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        AppLogger.setup(app)
    app.logger.info("Starting Flask Application Initialization . . .")

    # Configuration from .env file
    # example: mysql+pymysql://root:password123@localhost:5000/inventory_db?CA_PATH-> Mysql connection string
    try:
        # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        # CA_PATH = os.path.join(BASE_DIR, "config", "ca.pem")

        app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:"
        f"{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:"
        f"{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        #  f"?ssl_ca={CA_PATH}"
        "?ssl-mode=REQUIRED"  # for deployment
        )
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False #To avoid unnecessary overhead because we are not using SQLAlchemy event-based signals.
        app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
        app.config['IMAGE_STORAGE'] = os.getenv('IMAGE_STORAGE', 'local')
        app.config['LOCAL_BARCODE_BASE_URL'] = os.getenv('LOCAL_BARCODE_BASE_URL')

        app.logger.info("Flask Application configuration loaded!")
        app.logger.info(f'Using Database: {os.getenv("DB_NAME")}')
        app.logger.info(f'Database running on: {os.getenv("DB_HOST")}:{os.getenv("DB_PORT")}')

    except Exception as e:
        app.logger.error(f'Failed to load configuration . . .')
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
    app.logger.info("CORS enabled for frontend origins")

    # Initialize JWT
    jwt = JWTManager(app)  
    app.logger.info("JWT authentication initialized.")

    #Initialize database
    init_db(app)  

    # Initialize Cloudinary if cloud Storage
    if app.config['IMAGE_STORAGE'] == 'cloud':
        init_cloudinary()
        app.config['CLOUD_BARCODE_BASE_URL'] = os.getenv('CLOUD_BARCODE_BASE_URL')
        app.logger.info("Cloud Storage Mode enabled")
    else:
        app.logger.info("Local Storage Mode enabled")

    # Register blueprints(routes)
    from routes import auth_bp, product_bp, supplier_bp, transaction_bp, barcode_bp, category_bp
    
    app.register_blueprint(auth_bp)
    app.logger.info('Authentication routes registered!')

    app.register_blueprint(product_bp)
    app.logger.info('Product routes registered!')

    app.register_blueprint(supplier_bp)
    app.logger.info('Supplier routes registered!')

    app.register_blueprint(transaction_bp)
    app.logger.info('Transaction routes registered!')
    
    app.register_blueprint(barcode_bp)
    app.logger.info('Barcode routes registered!')

    app.register_blueprint(category_bp)
    app.logger.info('Category routes registered!')

    # Test route
    @app.route("/")
    def home():
        app.logger.debug("Root endpoint accessed!")
        return {
            'message': 'Inventory Management API',
            'status': 'running',
            'version' : '1.0',
            'Storage Mode':app.config['IMAGE_STORAGE']
        }
    
    @app.route("/api/health")
    def health_check():
        app.logger.debug("health endpoint accessed.")
        try:
            db.session.execute(text("SELECT 1"))
            app.logger.info("Health check passed !")
            return {
                'status' : 'healthy',
                'database' : 'connected'
            }
        except Exception as e:    
           app.logger.error(f'Health check failed : {str(e)}') 
           return{
               'status' : 'unhealthy',
               'database' : 'disconnected',
               'error' : str(e)
           }
        
    app.logger.info("-"*30)
    app.logger.info("Application initialized successfully!")
    app.logger.info("-"*30)
    return app


# create app instance
app = create_app()

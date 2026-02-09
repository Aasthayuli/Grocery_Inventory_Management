from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from config.database import db
from config.logging_config import AppLogger
from models import User
from utils import success_response, error_response, validate_required_fields

# create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


logger = AppLogger.get_logger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register new user

    Request Body:
    {
        "username": "admin",
        "email": "admin@example.com",
        "password": "admin123",
        "role": "admin" (optional, default: "staff")
    }

    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields = ['username', 'email', 'password']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            logger.warning(f'Registration failed - Missing fields: {missing}')
            return error_response(f'Authentication Failed! Missing required fields: {missing}',status_code=400)

        username = data['username'].strip()
        email = data['email'].strip().lower()
        password= data['password'].strip()
        role= data.get('role', 'staff')

        # validate role
        if role not in ['admin', 'staff']:
            logger.warning(f'Registration failed- Invalid role: {role}')
            return error_response('Role must be either "admin" or "staff"', status_code= 400)

        # check if user already exists
        if User.query.filter_by(username=username).first():
            logger.warning(f'Registration failed! Username exists: {username}')
            return error_response(f'Username already exists!', status_code= 400)

        # check if email already exists
        if User.query.filter_by(email=email).first():
            logger.warning(f'Registration failed! Email exists: {email}')
            return error_response('Email already registered!', status_code= 400)

        # validate password length
        if len(password) < 6:
            logger.warning(f'Registration failed- Password too short: {username}')
            return error_response('Password must be at least 6 characters', status_code= 400)

        # Create new User
        new_user = User(username=username, email=email, hashed_password=password, role=role)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        logger.info(f'User registered: {username} (Email: {email}, Role: {role})')
        

        return success_response('User registered successfully!', data=new_user.to_dict(), status_code= 201)

    except Exception as e:
        db.session.rollback()
        logger.error(f'Registration error: {str(e)}')
        return error_response('Registration failed!', status_code= 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User Login

    Request Body :
    {
        "username": "admin",
        "password": "admin123"
    }
    """
    try:
        data = request.get_json()

        # validate required fields
        required_fields = ['username', 'password']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            logger.error(f'Login failed - Missing fields: {missing}')
            return error_response(f'Missing required fields: {missing}', status_code= 400)

        username = data['username'].strip()
        password = data['password']

        # log login attempt
        logger.info(f'Login attempt: {username} from IP: {request.remote_addr}')


        # find user
        user = User.query.filter_by(username=username).first()

        if not user:
            logger.warning(f'Login failed: {username} - User not found')
            return error_response('Invalid username or password', status_code=401)

        # verify password
        if not user.check_password(password):
            logger.warning(f'Login failed- {username} - Invalid password')
            return error_response('Invalid username or password', status_code= 401)

        # create JWT Tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        logger.info(f'Login successful: {username} (ID: {user.id}, Role: {user.role})')
        

        return success_response('Login successful', data= {'user':user.to_dict(), 'access_token':access_token, 'refresh_token':refresh_token})

    except Exception as e:
        logger.error(f'Login error: {str(e)}')
        return error_response('Login failed', status_code= 500)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token

    Headers:
        Authorization: Bearer <refresh token>

    Returns:
        200: New access token
    """
    try:
        current_user_id = int(get_jwt_identity())
        new_access_token = create_access_token(identity=str(current_user_id))

        logger.info(f'Token refreshed for user ID: {current_user_id}')

        return success_response(
            'Token refreshed',
            data={'access_token': new_access_token}
        )
    except Exception as e:
        logger.error(f'Token refresh error: {str(e)}')
        return error_response('Token refresh failed', status_code=500)

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get current user profile

    Headers:
        Authorization: Bearer <access_token>

    """
    try:

        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            logger.warning(f'Profile fetch failed - User not found: ID {current_user_id}')
            return error_response('User not found', status_code= 404)

        logger.info(f'Profile accessed: {user.username}')

        return success_response(f'Profile retrieved', data= user.to_dict())
    except Exception as e:
        logger.error(f'Error in getting profile: {str(e)}')
        return error_response(f'Failed to fetch profile: {str(e)}')

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    User Logout

    Headers:
        Authorization: Bearer <access_token>

    """
    try:
        current_user_id = int(get_jwt_identity())
        user =  User.query.get(current_user_id)

        if user:
            logger.info(f'Logout: {user.username} (ID: {user.id})')

        return success_response('Logout Successful')

    except Exception as e:
        logger.error(f'Logout error: {str(e)}')
        return error_response('Logout failed!', status_code=500)


    
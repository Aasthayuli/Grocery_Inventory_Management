"""
User Model
Handles User authentication and authorization
"""

import logging
from config.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

logger = logging.getLogger(__name__)


class User(db.Model):
    """
    User table for authentication
    Store login credentials and user information
    Relationship: One user can have many transactions(one to many relationship with Transactions Table)
    """

    __tablename__ = 'users'
    

    # primary key
    id = db.Column(db.Integer, primary_key =True, autoincrement=True)

    # user info
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default= 'staff', nullable=False)  # Role: 'admin' or 'staff'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Timestamps
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade= 'all, delete-orphan')

    def set_password(self, password):
        """
        Hash password before storing
        Security : never store plain password
        """
        logger.debug(f'Hashing password for user: {self.username}')
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        """
        verify password during login
        returns true if password matched, otherwise false
        """

        result = check_password_hash(self.hashed_password, password)
        
        if result:
            logger.info(f'Password verification successful for user: {self.username}')
        else:
            logger.warning(f'Password verification failed for user: {self.username}')
        
        return result

    def to_dict(self):
        """
        convert User Object to dictionary for JSON response
        IMPORTANT: never send password hash to frontend
        """

        return {
            'id' : self.id,
            'username' : self.username,
            'email' : self.email,
            'role' : self.role,
            'created_at' : self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        """
        String representation for debugging
        """

        return f'<User: {self.username} ({self.role})>'
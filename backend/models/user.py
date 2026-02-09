from config.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class User(db.Model):
    """
    User table for authentication
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
        """
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        """
        verify password during login
        """

        result = check_password_hash(self.hashed_password, password)
        
        return result

    def to_dict(self):
        """
        convert User Object to dictionary for JSON response
        """

        return {
            'id' : self.id,
            'username' : self.username,
            'email' : self.email,
            'role' : self.role,
            'created_at' : self.created_at.isoformat() if self.created_at else None
        }
    
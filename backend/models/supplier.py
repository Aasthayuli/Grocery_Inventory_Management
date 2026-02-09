
from config.database import db
from datetime import datetime

class Supplier(db.Model):
    """
    Supplier table for tracking vendors
    Relationship: one supplier can supply many products (one to many relationship with Products table)
    """

    __tablename__ = 'suppliers'
    

    # primary key
    id = db.Column(db.Integer, primary_key = True, autoincrement=True)

    # supplier info
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    contact = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(120), nullable=True, index=True)
    address = db.Column(db.Text(), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    products = db.relationship('Product', backref='supplier', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """
        convert supplier object to dictionary to send as JSON response
        """
        return {
            'id' : self.id,
            'name': self.name,
            'contact' : self.contact,
            'email' : self.email if self.email else None,
            'address' : self.address if self.address else None,
            'created_at' : self.created_at if self.created_at else None,
            'product_count' : len(self.products)   # total products from this supplier
        }

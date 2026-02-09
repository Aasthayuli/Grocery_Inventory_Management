from config.database import db
from datetime import datetime


class Product(db.Model):
    """
    Product table - core of inventory system
    track stocks, pricing, expiry dates, and supplier information
    """

    __tablename__ = 'products'
    

    # primary key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # product info
    name = db.Column(db.String(200), nullable=False, index=True)
    sku = db.Column(db.String(50), unique=True, nullable=False, index=True) # stock keeping unit
    barcode = db.Column(db.String(100), unique=True, nullable=True, index=True)
    price = db.Column(db.Numeric(10,2), nullable=False)  # upto 99,999,999.99
    quantity = db.Column(db.Integer, default=0, nullable=False)
    expiry_date = db.Column(db.Date, nullable=True)  # for perishable item
    
    # foreign keys
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable= False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    transactions = db.relationship('Transaction', backref='product', lazy = True, cascade='all, delete-orphan')

    def is_expired(self):
        """
        Checks if product has expired

        """
        if not self.expiry_date:
            return False   # No expiry date means non perishable
        
        is_exp = self.expiry_date < datetime.now().date()

        return is_exp
    
    def days_left_to_expire(self):
        """
        Calculate days remaining until expiry
        Returns: 
            - Number of days (positive = future, negative = past)
            - None if no expiry date
        """

        if not self.expiry_date:
            return None
        
        today = datetime.now().date()
        delta = (self.expiry_date - today).days

        # Log warning for product expiring within 1 week ... 
        if 0 < delta <= 7:
            pass

        return delta
    
    def is_low_stock(self, threshold=10):
        """
        Check if product quantity is low
        
        Args:
            - threshold : Minimum quantity required(default = 10)
        """

        is_low = self.quantity <= threshold
        if is_low:
            pass

        return is_low
    
    def to_dict(self, include_relations=False):
        """
        Convert Product object to dictionary
        Args:
            include_relations: If true, includes category and supplier details
        """
        base_dict = {
            'id':self.id,
            'name': self.name,
            'sku': self.sku,
            'barcode':self.barcode,
            'price': float(self.price) if self.price else 0.0,
            'quantity':self.quantity,
            'expiry_date':self.expiry_date.isoformat() if self.expiry_date else None,
            'days_left_to_expire': self.days_left_to_expire(),
            'is_expired': self.is_expired(),
            'is_low_stock': self.is_low_stock(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at':self.updated_at.isoformat() if self.updated_at else None
        }

        # Include related objects if requested
        if include_relations:
            base_dict['category'] = {
                'id':self.category.id,
                'name': self.category.name
            } if self.category else None

            base_dict['supplier'] = {
                'id':self.supplier.id,
                'name': self.supplier.name,
                'contact': self.supplier.contact
            } if self.supplier else None
        else:
            base_dict['category_id']= self.category_id
            base_dict['supplier_id']= self.supplier_id
            
        return base_dict
    
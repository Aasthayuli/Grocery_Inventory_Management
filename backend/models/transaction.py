"""
Transaction Model
Tracks all movement (IN/OUT) for inventory audit trail
Essential for reconcilation and reporting
"""
import logging
from config.database import db
from datetime import datetime


logger = logging.getLogger(__name__)

class Transaction(db.Model):
    """
    Transaction table - Records all inventory movement
    - provides complete audit trail for stock changes
    
    """
    __tablename__ = 'transactions'
    

    # primary key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # foreign keys
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Transaction details
    type = db.Column(db.String(10), nullable = False) # IN or OUT
    quantity = db.Column(db.Integer, nullable=False) # POSITIVE NUMBER (direction indicated by type)
    notes = db.Column(db.Text(), nullable=True)
    date = db.Column(db.DateTime, default= datetime.utcnow, nullable=False)

    def to_dict(self, include_relations=False):
        """
        Convert Transaction Object into dictionary to be send as JSON Object
        Args:
            - include_relations: if True, includes product and user details
        """

        base_dict = {
            'id':self.id,
            'type':self.type,
            'quantity':self.quantity,
            'notes':self.notes,
            'date':self.date.isoformat() if self.date else None
        }

        # Include relateed objects if requested
        if include_relations:
            base_dict['product']={
                'id' : self.product.id,
                'name':self.product.name,
                'sku':self.product.sku
            } if self.product else None
            base_dict['user'] = {
                'id': self.user.id,
                'username':self.user.username,
                'role':self.user.role
            } if self.user else None
        else:
            base_dict['product_id'] = self.product_id
            base_dict['user_id'] =  self.user_id

        return base_dict
    
    @staticmethod
    def create_stock_in(product, quantity, user, notes=None):
        """
        Helper method to create STOCK IN transaction
        Args:
            product: Product Object
            quantity: Quantity to add (positive integer)
            user: User Object (who performed the action)
            notes: Optional(like supplier invoice, reason, etc.)
        Returns: 
            Transaction Object
        """
        if quantity <= 0:
            logger.error(f'Invalid STOCK IN quantity: {quantity} for product: {product.name}')
            raise ValueError("Added Quantity must be positive for STOCK IN")

        transaction = Transaction(
            product_id = product.id,
            user_id = user.id,
            type = 'IN',
            quantity = quantity,
            notes=notes
        )

        # update product quantity
        old_quantity = product.quantity
        product.quantity += quantity

        logger.info(
            f'STOCK IN | Product: {product.name} (ID: {product.id}) | '
            f'Qty: +{quantity} | Stock: {old_quantity} -> {product.quantity} | '
            f'User: {user.username}'
        )

        return transaction

    @staticmethod
    def create_stock_out(product, quantity, user, notes=None):
        """
        Helper method to create STOCK OUT transaction
        Args:
            product: Product object
            quantity: Quantity to remove (positive integer)
            user: User object (who performed the action)
            notes: Optional notes (customer name, sale info, etc.)
        Returns:
            Transaction object
        Raises:
            ValueError: If insufficient stock
        """
        if quantity <= 0:
            logger.error(f'Invalid STOCK OUT quantity: {quantity} for product {product.name}')
            raise ValueError("Quantity must be positive for STOCK OUT")
        
        if product.quantity < quantity:
            logger.error(
                f'Insufficient stock for {product.name}: '
                f'Requested: {quantity}, Available: {product.quantity}'
            )
            raise ValueError(f"Insufficient stock. Available: {product.quantity}, Requested: {quantity}")
        
        transaction = Transaction(
            product_id=product.id,
            user_id=user.id,
            type='OUT',
            quantity=quantity,
            notes=notes
        )
        
        # Update product quantity
        old_quantity = product.quantity
        product.quantity -= quantity
        
        logger.info(
            f'STOCK OUT | Product: {product.name} (ID: {product.id}) | '
            f'Qty: -{quantity} | Stock: {old_quantity} -> {product.quantity} | '
            f'User: {user.username}'
        )
        
        # Check for low stock
        if product.quantity <= 10:
            logger.warning(
                f'LOW STOCK ALERT | Product: {product.name} | '
                f'Remaining: {product.quantity} units'
            )
        
        return transaction
    
    
    def __repr__(self):
        """
        String representation for debugging
        """
        return f'<Transaction {self.type} {self.quantity} units (Product ID: {self.product_id})>'
from config.database import db

class Category(db.Model):
    """
    Category table for product classification
    Relationship: one category can have many products(one to many realtionship with Products Table)
    """

    __tablename__ = 'categories'
    

    # primary key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True )

    # category info
    name = db.Column(db.String(100), unique=True, nullable=False, index=True )
    description = db.Column(db.Text(), nullable=True)
    products = db.relationship('Product', backref='category', lazy=True, cascade= 'all, delete-orphan')

    def to_dict(self):
        """
        convert cateory to dictionary
        includes product count for dashboard statistics
        """

        return {
            'id' : self.id,
            'name' : self.name,
            'description' : self.description if self.description else None,
            'product_count' : len(self.products)  # total products in this category
        }

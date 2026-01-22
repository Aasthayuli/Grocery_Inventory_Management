"""
Test Script for Database Models
Run this file to test if models are working correctly
Usage: python test_models.py
"""

from app import create_app
from config.database import db
from models import User, Category
from datetime import datetime


def test_user_model():
    """Test User model functionality"""
    print("\n" + "="*50)
    print("TESTING USER MODEL")
    print("="*50)
    
    try:
        # Create user
        user = User(
            username='admin_test',
            email='admin@grocery.com',
            role='admin'
        )
        user.set_password('admin123')
        
        # Add to database
        db.session.add(user)
        db.session.commit()
        
        print("  User created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   ID: {user.id}")
        
        # Test password verification
        print("\n--- Testing Password ---")
        correct = user.check_password('admin123')
        wrong = user.check_password('wrongpassword')
        print(f"  Correct password check: {correct}")  # Should be True
        print(f"  Wrong password check: {wrong}")      # Should be False
        
        # Test to_dict()
        print("\n--- Testing to_dict() ---")
        user_dict = user.to_dict()
        print(f"  User as dictionary: {user_dict}")
        print(f"  Password hash NOT in dict: {'password_hash' not in user_dict}")
        
        # Query test
        print("\n--- Testing Query ---")
        found_user = User.query.filter_by(username='admin_test').first()
        print(f"  User found in database: {found_user is not None}")
        
        return True
        
    except Exception as e:
        print(f"  Error: {e}")
        db.session.rollback()
        return False


def test_category_model():
    """Test Category model functionality"""
    print("\n" + "="*50)
    print("TESTING CATEGORY MODEL")
    print("="*50)
    
    try:
        # Create categories
        categories = [
            Category(name='Dairy', description='Milk and milk products'),
            Category(name='Beverages', description='Drinks and juices'),
            Category(name='Snacks', description='Chips and snacks'),
            Category(name='Frozen Foods', description='Frozen items')
        ]
        
        for cat in categories:
            db.session.add(cat)
        
        db.session.commit()
        
        print(f"  {len(categories)} categories created!")
        
        # Test to_dict()
        print("\n--- Testing to_dict() ---")
        for cat in categories:
            print(f"   {cat.name}: {cat.to_dict()}")
        
        # Query test
        print("\n--- Testing Query ---")
        all_cats = Category.query.all()
        print(f"  Total categories in DB: {len(all_cats)}")
        
        dairy = Category.query.filter_by(name='Dairy').first()
        print(f"  Found 'Dairy' category: {dairy is not None}")
        
        return True
        
    except Exception as e:
        print(f"  Error: {e}")
        db.session.rollback()
        return False


def test_relationships():
    """Test relationships between models"""
    print("\n" + "="*50)
    print("TESTING RELATIONSHIPS")
    print("="*50)
    
    try:
        # Get a user
        user = User.query.first()
        if user:
            print(f"  User found: {user.username}")
            print(f"  User's transactions: {len(user.transactions)}")  # Should be 0 for now
        
        # Get a category
        category = Category.query.first()
        if category:
            print(f"  Category found: {category.name}")
            print(f"  Category's products: {len(category.products)}")  # Should be 0 for now
        
        return True
        
    except Exception as e:
        print(f"  Error: {e}")
        return False


def cleanup_test_data():
    """Delete test data (optional)"""
    print("\n" + "="*50)
    print("CLEANUP (Optional)")
    print("="*50)
    
    choice = input("Do you want to delete test data? (y/n): ")
    if choice.lower() == 'y':
        try:
            # Delete all test users
            User.query.filter_by(username='admin_test').delete()
            
            # Delete all categories
            Category.query.delete()
            
            db.session.commit()
            print("  Test data deleted!")
        except Exception as e:
            print(f"  Error during cleanup: {e}")
            db.session.rollback()
    else:
        print("⏭️  Test data kept in database")


def main():
    """Main test runner"""
    print("\n" + "🧪"*25)
    print(" GROCERY INVENTORY - MODEL TESTING")
    print("🧪"*25)
    
    # Create app and setup database
    app = create_app()
    
    with app.app_context():
        # Run tests
        results = []
        
        results.append(("User Model", test_user_model()))
        results.append(("Category Model", test_category_model()))
        results.append(("Relationships", test_relationships()))
        
        # Summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        
        for test_name, passed in results:
            status = "  PASS" if passed else "  FAIL"
            print(f"{test_name}: {status}")
        
        # Cleanup option
        cleanup_test_data()
        
        print("\n  Testing completed!\n")


if __name__ == "__main__":
    main()
from werkzeug.security import generate_password_hash
from app import create_app
from models import User
from config.database import db
from getpass import getpass

app = create_app()

with app.app_context():
    name = input("Enter Admin name: ")
    email = input("Enter Admin mail: ")
    password = getpass("Enter Admin password: ")

    existing = User.query.filter_by(email=email).first()
    if existing:
        print("Admin already exists !")
    else:
        admin = User(username=name, email=email, hashed_password=generate_password_hash(password), role="admin")

        db.session.add(admin)
        db.session.commit()
        print("Admin created successfully !")
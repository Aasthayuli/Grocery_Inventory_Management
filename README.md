# 🛒 Grocery Inventory Management System

A full-stack Grocery Inventory Management System built using **Flask (Backend)** and **React + Vite (Frontend)**.  
The application supports authentication, inventory handling, barcode generation, and cloud-based image storage.

---

## 🚀 Live URLs

### Frontend (Netlify)

https://grocery-inventory-management-1289.netlify.app

### Backend (Render)

https://grocery-inventory-management-cw3w.onrender.com

### Watch Video

[Working Demo](https://drive.google.com/file/d/14-XF73ND3rVsi6zF3YFcZdlY39X27K0b/view?usp=sharing)

---

## 📸 Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Product Management

![Products](screenshots/products.png)

### Barcode Generation

![Barcode](screenshots/barcodes.png)

---

## 🧰 Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Axios
- JWT Authentication
- Netlify Deployment

### Backend

- Flask
- Flask-JWT-Extended
- SQLAlchemy
- MySQL (Aiven)
- Cloudinary
- Render Deployment

---

## ✨ Features

- User Authentication (JWT)
- Product Management
- Category Management
- Barcode Generation
- Cloud Image Storage
- Inventory Tracking
- Secure API
- Health Check API

---

## ⚙️ Environment Variables

### Backend (.env)

```env
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=your_port
DB_NAME=defaultdb

SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret

IMAGE_STORAGE=cloud
CLOUD_BARCODE_BASE_URL=your_cloudinary_url

FRONTEND_URL=https://grocery-inventory-management-1289.netlify.app
```

### Frontend (.env)

```env
# Backend API Base URL
VITE_API_URL=https://grocery-inventory-management-cw3w.onrender.com

# JWT Token Storage Key
VITE_TOKEN_KEY=grocery_auth_token
VITE_REFRESH_TOKEN_KEY=grocery_refresh_token
```

---

## 🔐 Database Configuration

Used connection format:

- mysql+pymysql://USER:PASSWORD@HOST:PORT/DB_NAME?ssl_ca=path/to/ca.pem
- ⚠️ Note: Aiven MySQL requires SSL connection.  
  The `ca.pem` certificate is mandatory for local development and should NOT be pushed to GitHub.

## Security

- JWT Authentication
- SSL secured DB
- Environment variable based config
- CORS enabled
- Cloudinary image handling

## 👩‍💻 Author

Aasthayui

Final Year B.Tech Student

Aspiring Full Stack Developer

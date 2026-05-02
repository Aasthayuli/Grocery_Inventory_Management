from app import app
import os

if __name__ == "__main__":
    # Get configuration from environment
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    host = os.getenv('FLASK_RUN_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_RUN_PORT', 5000))

    # Startup message
    print("\n" + "=" * 60)
    print("GROCERY INVENTORY MANAGEMENT SYSTEM")
    print("=" * 60)

    # Run server
    app.run(
        debug=debug_mode,
        host=host,
        port=port
    )
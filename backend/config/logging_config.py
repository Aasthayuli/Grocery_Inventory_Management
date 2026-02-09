import logging
import os

class AppLogger:

    @staticmethod
    def set_up():
        log_dir = "logs"

        if(not os.path.exists(log_dir)):
            os.makedirs(log_dir)

        log_file = os.path.join(log_dir, "app.log")
        level = logging.DEBUG if os.getenv('FLASK_ENV') == 'DEVELOPMENT' else logging.INFO

        logging.basicConfig(
                filename=log_file,
                level=level,
                format='%(asctime)s - %(levelname)s - %(name)s - %(message)s',
                filemode='w' 
            )
        
    @staticmethod
    def get_logger(name=__name__):
        return logging.getLogger(name)

        

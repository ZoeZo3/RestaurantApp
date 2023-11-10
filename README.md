# RestaurantApp

# Launch the app

flask --app main run

# Environment file

Please create a ".env" file at the root of the project with the following variables:
DB_NAME = 'users.db'
SQLALCHEMY_DATABASE_URI = 'sqlite:///${DB_NAME}'
SECRET_KEY = 'secretkey'
MAIL_SERVER ='smtp.gmail.com'
MAIL_PORT = 465
MAIL_USE_TLS = False
MAIL_USE_SSL = True
MAIL_USERNAME = 'your email adress' --> to send an email from the contact page
MAIL_PASSWORD = 'your password' --> to send an email from the contact page
IMPORT_FOLDER = 'static/menu'

# Thoughts

pip install Flask
pip install python-dotenv

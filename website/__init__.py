from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_marshmallow import Marshmallow
from dotenv import load_dotenv
import os

db = SQLAlchemy()
ma = Marshmallow()
mail = Mail()
load_dotenv()
owner = os.getenv('MAIL_PASSWORD')

def create_app():
    app = Flask(__name__, static_folder='static')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['MAIL_SERVER']=os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL')
    app.config['IMPORT_FOLDER'] = os.getenv('IMPORT_FOLDER')
    app.static_folder = 'static'
    db.init_app(app)
    ma.init_app(app)
    mail.init_app(app)

    from .visitors import visitors
    from .auth import auth
    from .owner import owner

    app.register_blueprint(visitors, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(owner, url_prefix='/owner')

    from . import models

    with app.app_context():
        db.create_all()
        print("Database created")

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return models.User.query.get(int(id)) 

    return app







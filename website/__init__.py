from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_mail import Mail
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()
DB_NAME = "users.db"
mail = Mail()
owner = "zoe.neirac@gmail.com"

def create_app():
    app = Flask(__name__, static_folder='static')
    app.config["SECRET_KEY"] = "secretkey"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME }"
    app.config['MAIL_SERVER']='smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = 'zoe.neirac@gmail.com'
    app.config['MAIL_PASSWORD'] = 'xczyywyvjvzqkwdf'
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
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







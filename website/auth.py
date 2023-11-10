from flask import Blueprint, render_template, request, flash, redirect, url_for
from .models import User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint("auth" , __name__)

@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user, remember=True)
                return redirect(url_for("owner.home"))
            flash("Le mot de passe n'est pas valide.", category="error")
        else:
            flash("L'adresse email n'est pas valide.", category="error")

    return render_template("owner/login.html", user=current_user)

@auth.route("/sign-up", methods=["GET", "POST"])
def signUp():
    if request.method == "POST":
        email = request.form.get("email")
        firstName = request.form.get("firstName")
        password1 = request.form.get("password1")
        password2 = request.form.get("password2")

        if len(email) < 4:
            flash("L'adresse email n'est pas valide.", category="error")
        elif len(firstName) < 2:
            flash("Votre nom doit faire au moins 2 lettres.", category="error")
        elif password1 != password2:
            flash("Les mots de passe ne sont pas identiques.", category="error")
        elif len(password1) < 7:
            flash("Le mot de passe doit faire au moins 7 caractères.", category="error")
        else:
            # check if user already exists
            user = User.query.filter_by(email=email).first()
            if user:
                flash("Vous avez déjà un compte associé à cette adresse mail.", category="error")
            else:
                # add user to the database
                new_user = User(email=email, first_name=firstName, password=generate_password_hash(password1, method="sha256"))
                db.session.add(new_user)
                db.session.commit( )
                login_user(new_user, remember=True)
                flash("Votre compte a bien été créé.", category="success")
                return redirect(url_for("owner.home"))

    return render_template("owner/sign_up.html", user=current_user)

@auth.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
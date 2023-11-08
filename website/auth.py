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
                flash("Logged in", category="success")
                login_user(user, remember=True)
                return redirect(url_for("owner.home"))
            flash("Invalid password", category="error")
        else:
            flash("Invalid email address", category="error")

    return render_template("owner/login.html", user=current_user)

@auth.route("/sign-up", methods=["GET", "POST"])
def signUp():
    if request.method == "POST":
        email = request.form.get("email")
        firstName = request.form.get("firstName")
        password1 = request.form.get("password1")
        password2 = request.form.get("password2")

        if len(email) < 4:
            flash("Email is invalid", category="error")
        elif len(firstName) < 2:
            flash("First name must be at least 2 caracters", category="error")
        elif password1 != password2:
            flash("Passwords don't match", category="error")
        elif len(password1) < 7:
            flash("Password must be at least 7 caracters", category="error")
        else:
            # check if user already exists
            user = User.query.filter_by(email=email).first()
            if user:
                flash("You already have an account with this email address.", category="error")
            else:
                # add user to the database
                new_user = User(email=email, first_name=firstName, password=generate_password_hash(password1, method="sha256"))
                db.session.add(new_user)
                db.session.commit( )
                login_user(new_user, remember=True)
                flash("Account successfuly created", category="success")
                return redirect(url_for("owner.home"))

    return render_template("owner/sign_up.html", user=current_user)

@auth.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
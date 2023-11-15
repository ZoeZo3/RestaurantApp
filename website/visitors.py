from flask import Blueprint, render_template, request, flash
from flask_login import current_user
from . import db, mail, owner
import json
from flask_mail import Message


visitors = Blueprint("visitors", __name__)

@visitors.route("/", methods=["POST", "GET"])
def home():
    '''if request.method == "POST":
        note = request.form.get("note")
        if len(note) > 0:
            #insert note into DB
            new_note = Note(data=note, user_id=current_user.id)
            db.session.add(new_note)
            db.session.commit()

        else:
            flash("Please enter a note.", category="error")'''

    return render_template("visitor/home.html", user=current_user)

@visitors.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        sender = request.form.get("email")
        name = request.form.get("name")
        subject = request.form.get("subject")
        body = request.form.get("message")
        if sender == "" or name == "" or subject == "" or body == "":
            flash("Merci de remplir tous les champs.", category="error")
        else:
            msg = Message(subject, sender = "contact@restaurant.fr", recipients = [owner])
            msg.body = body + "\nNom: " + name + "\nEmail: " + sender
            mail.send(msg)
            flash("Votre message a bien été envoyé !", category="success")
    return render_template("visitor/contact.html", user=current_user)
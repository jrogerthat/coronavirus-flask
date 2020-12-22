from application import app,db,auth
from flask import Flask, render_template, request, json, Response,redirect,flash,url_for

@app.route('/')
def index():
    try:
        user = auth.create_user_with_email_and_password("Parasmani300@gmail.com","1234567")
    except:
        print("could not sign in")
    return render_template('index.html')

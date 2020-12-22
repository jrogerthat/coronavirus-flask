#!/usr/bin/env python3
# -*- encoding: utf-8 -*-
from flask import (
    Blueprint,
    render_template,
    request,
    url_for,
    session,
    redirect
)
from app import db
from app.user.models import User
#from firebase_config import fdb, fauth

mod = Blueprint('login', __name__, url_prefix='/login')

@mod.route('/', methods=['GET', 'POST'])
def index():
    # email = input("Please Enter Your Email : ")
    # password = input("Please Enter Your Password : ")
    # try:
    #     user = fauth.sign_in_with_email_and_password(email, password)
    #     user = fauth.refresh(user['refreshToken'])
    #     user_id = user['idToken']
    #     print(fauth.get_account_info(user['idToken']))
    #     return redirect(url_for('dashboard.index'))
    # except:
    #     print("no user")

    return render_template('/login/index.html')

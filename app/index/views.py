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

import time
#pytfrom firebase_config import fdb, fauth
import os

mod = Blueprint('index', __name__)

def format_server_time():
  server_time = time.localtime()
  return time.strftime("%I:%M:%S %p", server_time)

def newuser():
    return redirect(url_for('dashboard.index'))

@mod.route('/')
def index():
    return render_template('/home/index.html', apiKey= os.getenv("FIREBASE_API_KEY"))

@mod.route('/login')
def login():
    return render_template('/login/index.html')

@mod.route('/newuser')
def newuser():
    return render_template('newuser/index.html')





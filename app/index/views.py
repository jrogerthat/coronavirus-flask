#!/usr/bin/env python3
# -*- encoding: utf-8 -*-
from flask import (
    Blueprint,
    render_template,
    url_for,
    redirect
)

import time
import os


mod = Blueprint('index', __name__)


def format_server_time():
    server_time = time.localtime()
    return time.strftime("%I:%M:%S %p", server_time)


def newuser():
    return redirect(url_for('dashboard.index'))


@mod.route('/')
def index():
    return render_template(
        '/home/index.html',
        apiKey=os.getenv("FIREBASE_API_KEY")
        )

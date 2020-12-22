from functools import wraps
from flask import session, abort
from app import db 

class ImageData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    data = db.column(db.String(6000000))

@app.route('/<test>/<name>')
    def index(test, name):
        imagedata = ImageData(name = name, data=data)
        db.session.add(imagedata)
        db.session.commit

        return f'New image data added'


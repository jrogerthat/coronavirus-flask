#!/usr/bin/env python3
# -*- encoding: utf-8 -*-
from dotenv import load_dotenv
load_dotenv()

if __name__ == '__main__':
    from app import app
    app.run(debug=True)

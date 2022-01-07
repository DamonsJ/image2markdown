from flask import Flask, request
from datetime import datetime
import re
import io, base64
from PIL import Image

app = Flask(__name__)

@app.route("/convert", methods=["GET","POST"])
def convert2MarkDown():
    rect_json = request.form["rect"]
    image_data = request.form["image"]
    
    img = Image.open(io.BytesIO(base64.decodebytes(bytes(image_data, "utf-8"))))
    img.save('test.png')
    
    print(" rect_json ", rect_json)

    return '123'

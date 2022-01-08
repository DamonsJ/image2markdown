from flask import Flask, request, Response
from datetime import datetime
import re
import io, base64, os
from PIL import Image
import json
import time

app = Flask(__name__)

def getFileLocation():
    folder = "./data/"
    t = time.time()
    cur_folder = int(round(t * 1000))
    folder = folder + str(cur_folder)
    if not os.path.exists(folder):
        os.makedirs(folder)
    return folder

@app.route('/')  
def hello_world():  
    return "Hello World"  

@app.route("/convert", methods=["POST"])
def convert2MarkDown():
    print("convert enter : ")
    print(request.form)
    rect_json = request.form["rect"]

    try:
        # save image
        image_data = request.files['image']
        image_name = request.files['image'].filename
        folder = getFileLocation()
        print(" folder ", folder)
        image_name = os.path.join(folder, image_name)
        image_data.save(image_name)
        # save rect
        rect_name = os.path.join(folder, "rects.json")
        with open(rect_name,"w") as f:
            json.dump(rect_json, f, indent = 4)
        
    except:
        print(" error happened ")
        image_data = None
    
    print(" image_name ", image_name)
    print(" rect_json ", rect_json)

    result = {"info" : "hello"}
    return Response(json.dumps(result),mimetype='application/json')

if __name__ == '__main__':  
    app.run() 

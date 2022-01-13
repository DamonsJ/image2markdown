from flask import Flask, request, Response, make_response,jsonify
from datetime import datetime
import re
import io, base64, os
from PIL import Image
import json
import time

from flask_cors import CORS, cross_origin
app = Flask(__name__)
CORS(app)

def getFileLocation():
    folder = "./data/"
    t = time.time()
    cur_folder = int(round(t * 1000))
    folder = folder + str(cur_folder)
    if not os.path.exists(folder):
        os.makedirs(folder)
    return folder

def cropImageToFile(img, rect_json_str, folder):
    rect_object = json.loads(rect_json_str)
    all_rects = {}

    for key, rect in rect_object.items():
        rect_list = rect["rects"]
        for rect in rect_list:
            center_y = int(rect[1] + rect[3] / 2)
            file_name = key + "_" + str(center_y) + ".png"
            image_name = os.path.join(folder, file_name)
            region = (rect[0],rect[1],rect[0] + rect[2],rect[1] + rect[3])
            croped = img.crop(region)
            croped.save(image_name)

            all_rects[center_y] = {"rect":rect, "type": key, "image_name":image_name}

    result = [(k,all_rects[k]) for k in sorted(all_rects.keys())]
    return result


@app.route('/')  
def hello_world():  
    return "Hello World"  

@app.route("/convert", methods=["POST"])
@cross_origin()
def convert2MarkDown():
    print("convert enter : ")
    print("request form : ", request.form)
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
        
        # crop image
        img = Image.open(image_name)
        cropImageToFile(img,rect_json, folder)
    except:
        print(" error happened ")
        image_data = None
    
    print(" image_name ", image_name)
    print(" rect_json ", rect_json)

    result = {"recognize" : "test"}
    response = make_response(jsonify(result), 200)
    response.headers['Content-Type'] = 'application/json'
    response.headers["Access-Control-Request-Method"] = "GET,HEAD,OPTIONS,POST,PUT"
    response.headers["Access-Control-Request-Headers"] = "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
    response.headers["Access-Control-Allow-Credentials"] = "true"

    return response


if __name__ == '__main__':  
    app.run() 

from flask import Flask, request, Response, make_response,jsonify
from datetime import datetime
import re
import io, base64, os
from PIL import Image
import json
import time
import requests
from config import *

app = Flask(__name__)

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

    result = {k: all_rects[k] for k in sorted(all_rects.keys())}

    return result

def requestMathPix(image_path):
    r = requests.post("https://api.mathpix.com/v3/text",
    files={"file": open(image_path,"rb")},
    data={
      "options_json": json.dumps({
        "math_inline_delimiters": ["```$", "$```"],
        "math_display_delimiters":["```math", "```"],
        "rm_spaces": True
      })
    },
    headers={
        "app_id": app_id,
        "app_key": app_key
    }
    )
    print(json.dumps(r.json(), indent=4, sort_keys=True))
    return r.json()

def recognize(json_info):
    reco_text = "\n"
    image_number = 0

    base64_all_str = ""
    for key, value in json_info.items():
        image_name = value["image_name"]
        if value["type"] == "text":
            math_res = requestMathPix(image_name)
            reco_text = reco_text + math_res["text"]
            reco_text = reco_text + "\n"
        elif value["type"] == "image":
            image_number = image_number + 1

            with open(image_name,"rb") as f:
                image_base64 = str(base64.b64encode(f.read()), encoding='utf-8')#使用base64进行加密
            base64_str = "[img{}]:data:image/png;base64,{}".format(image_number,image_base64)

            reco_text = "\n" + reco_text + "\n" + "![image][img{}] \n".format(image_number)
            base64_all_str = base64_all_str + base64_str + "\n"

    reco_text = reco_text + "\n" + base64_all_str 
    return reco_text
                
   
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
        
        # crop image
        img = Image.open(image_name)
        data_json = cropImageToFile(img,rect_json, folder)
        reco_text = recognize(data_json)
    except:
        print(" error happened ")
        image_data = None
        image_name = "unknown"
        reco_text = "error happened"
    
    print(" image_name ", image_name)
    print(" rect_json ", rect_json)
    print(" reco_text ", reco_text)

    result = {"recognize" : reco_text}
    response = make_response(jsonify(result), 200)
    response.headers['Content-Type'] = 'application/json'
    response.headers["Access-Control-Allow-Origin"] = "*"
    
    return response


if __name__ == '__main__':  
    app.run() 

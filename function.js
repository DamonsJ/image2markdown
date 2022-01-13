var text_left = [];
var text_top = [];
var text_width = [];
var text_height = [];

var formula_left = [];
var formula_top = [];
var formula_width = [];
var formula_height = [];

var image_left = [];
var image_top = [];
var image_width = [];
var image_height = [];
var image_data;

var cur_mode = 0;
var stage;
var text_layer;
var formula_layer;
var image_layer;
var cur_graph;
// calculate where the canvas is on the window
// (used to help calculate mouseX/mouseY)
var offsetX = 0;
var offsetY = 0;
var scrollX = 0;
var scrollY = 0;
// this flage is true when the user is dragging the mouse
var isDown = false;
// these vars will hold the starting mouse position
var startX;
var startY;
var width;
var height;

function handleMouseDown(e) {
   
    // save the starting x/y of the rectangle
    startX = e.evt.offsetX;
    startY = e.evt.offsetY;

    //console.log(" startX = " + startX);
    //console.log(" startY = " + startY);
    // set a flag indicating the drag has begun
    isDown = true;
    if (cur_mode == 1) {
        text_left.push(startX);
        text_top.push(startY);

        var rect = new Konva.Rect({
            x: startX,
            y: startY,
            width: 0,
            height: 0,
            stroke:'rgb(76, 175, 80)',
            opacity:0.8,
            strokeWidth: 4
        });
        cur_graph = rect;
        text_layer.add(rect);
        text_layer.draw();
    }

    if (cur_mode == 2) {
        formula_left.push(startX);
        formula_top.push(startY);

        var rect = new Konva.Rect({
            x: startX,
            y: startY,
            width: 0,
            height: 0,
            stroke:'#4c9baf',
            opacity:0.8,
            strokeWidth: 4
        });
        cur_graph = rect;
        formula_layer.add(rect);
        formula_layer.draw();
    }

    if (cur_mode == 3) {
        image_left.push(startX);
        image_top.push(startY);

        var rect = new Konva.Rect({
            x: startX,
            y: startY,
            width: 0,
            height: 0,
            stroke:'#7a60d8',
            opacity:0.8,
            strokeWidth: 4
        });
        cur_graph = rect;
        image_layer.add(rect);
        image_layer.draw();
    }
}

function handleMouseUp(e) {
    // the drag is over, clear the dragging flag
    isDown = false;
    if (cur_mode == 1) {
        text_width.push(width);
        text_height.push(height);
    }

    if (cur_mode == 2) {
        formula_width.push(width);
        formula_height.push(height);
    }

    if (cur_mode == 3) {
        image_width.push(width);
        image_height.push(height);
    }
}

function handleMouseOut(e) {
    // the drag is over, clear the dragging flag
    isDown = false;
}

function handleMouseMove(e) {
   
    // if we're not dragging, just return
    if (!isDown) {
        return;
    }
 
    width = e.evt.offsetX - startX;
    height = e.evt.offsetY - startY;

    // console.log(" width = " + width);
    // console.log(" height = " + height);

    // Put your mousemove stuff here
    // if (cur_mode == 1) {
    //     text_width = width;
    //     text_height = height;
    // }

    // if (cur_mode == 2) {
    //     formula_width = width;
    //     formula_height = height;
    // }

    // if (cur_mode == 3) {
    //     image_width = width;
    //     image_height = height;
    // }

    cur_graph.setAttrs({
        width: width,
        height: height
    });
}

function onDrawTextRect() {
    cur_mode = 1; // draw text
    console.log(" cur_mode = " + cur_mode);
    if (stage) {
        text_layer = new Konva.Layer();
        stage.add(text_layer);
    }
}

function onDrawFormulaRect() {
    cur_mode = 2; // draw formula
    console.log(" cur_mode = " + cur_mode);
    if (stage) {
        formula_layer = new Konva.Layer();
        stage.add(formula_layer);
    }
}

function onDrawImageRect() {
    cur_mode = 3; // draw image
    console.log(" cur_mode = " + cur_mode);
    if (stage) {
        image_layer = new Konva.Layer();
        stage.add(image_layer);
    }
}

function initKonvaStages()
{
    stage.on("mousedown", handleMouseDown);
    stage.on("mouseup", handleMouseUp);
    //stage.on("mouseout", handleMouseOut);
    stage.on("mousemove", handleMouseMove);
}

function imageLoaded() {
    afiles = document.getElementById('imgupload').files;
    cur_file = afiles[0]; // get the first file
    console.log("cur_file : ");
    console.log(cur_file.name);

    var reads = new FileReader();
    reads.onload = function(e) {
        var img = document.createElement("img");
        img.onload = function(event) {
            var canvas = document.getElementById('image_canvas');
            var ctx = canvas.getContext("2d");
            
            var tw = canvas.getBoundingClientRect().width;
            var th = canvas.getBoundingClientRect().height;
        
            console.log("tw width", tw);
            console.log("th height", th);

            var MAX_WIDTH = tw;
            var MAX_HEIGHT = th;
       
            ctx.drawImage(img, 0, 0);

            var width = img.width;
            var height = img.height;

            console.log("origin width", width);
            console.log("origin height", height);

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            console.log("dst width", width);
            console.log("dst height", height);

            canvas.width = width;
            canvas.height = height;

            var ctx2 = canvas.getContext("2d");
            ctx2.drawImage(img, 0, 0, width, height);
        
            var dataurl = canvas.toDataURL("image/png");
            image_data = dataurl;

            // markdown = "[img1]:" + dataurl;
            // markdown = "The diagram in Figure ```$1.21$``` explains the coefficient of ```$\\boldsymbol{B} .$``` Because ```$\\mathbf{u}$``` is constant, ```$\\mathbf{u}^{\\prime}=0 .$``` Hence,\n\n\\begin{aligned}\n0 &=\\cos \\theta T^{\\prime}+\\sin \\theta B^{\\prime} \\\\\n&=\\kappa \\cos \\theta N-\\tau \\sin \\theta N \\\\\n&=(\\kappa \\cos \\theta-\\tau \\sin \\theta) N\n\\end{aligned}\n\nThus, ```$\\kappa \\cos \\theta-\\tau \\sin \\theta=0$```, which gives ```$\\cot \\theta=\\tau / \\kappa .$``` Therefore, ```$\\tau / \\kappa$``` is constant since ```$\\theta$``` is."
            // document.getElementById('markdown_area').value = markdown; 

            stage = new Konva.Stage({
                container: 'canvas_div',
                width: width,
                height: height,
              });
        
            var layer = new Konva.Layer();
            stage.add(layer);

            var konva_image = new Konva.Image({
                x: 0,
                y: 0,
                image: canvas,
                width: width,
                height: height
              });
            layer.add(konva_image);
            layer.batchDraw();

            offsetX = canvas.offsetLeft;
            offsetY = canvas.offsetTop;
            scrollX = canvas.scrollLeft;
            scrollY = canvas.scrollTop;

            console.log(" offsetX = " + offsetX);
            console.log(" offsetY = " + offsetY);
            console.log(" scrollX = " + scrollX);
            console.log(" scrollY = " + scrollY);

            initKonvaStages();
        };
        img.src = this.result;
    };
    reads.readAsDataURL(cur_file);
}

function uploadImage(){
    document.getElementById("imgupload").click(); 
}

function onConvert() {
    var obj = new Object();
    obj.formula = new Object();
    obj.formula.rects = [];
    var len = formula_left.length;
    for (let i = 0; i < len; i++) {
        var rect = [formula_left[i],formula_top[i],formula_width[i],formula_height[i]];
        obj.formula.rects.push(rect);
    }
    
    obj.text = new Object();
    obj.text.rects = [];
    var lent = text_left.length;
    for (let i = 0; i < lent; i++) {
        var rect = [text_left[i],text_top[i],text_width[i],text_height[i]];
        obj.text.rects.push(rect);
    }

    obj.image = new Object();
    obj.image.rects = [];
    var leni = image_left.length;
    for (let i = 0; i < leni; i++) {
        var rect = [image_left[i],image_top[i],image_width[i],image_height[i]];
        obj.image.rects.push(rect);
    }
    var jsonString= JSON.stringify(obj);

    console.log("jsonString: ", jsonString);

    url = 'http://127.0.0.1:5000/convert';
    console.log("request : " + url);

    let headers = new Headers();
    // headers.append('Content-Type', 'multipart/form-data');
    // headers.append('Accept', 'multipart/form-data');
    headers.append('Origin','http://127.0.0.1:5000');
    // headers.append('Access-Control-Allow-Origin','*');
    headers.append('Access-Control-Request-Headers','access-control-allow-origin,content-type');

    let bytes = atob(image_data.split(',')[1])
    let ab = new ArrayBuffer(bytes.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
    }
    let blob = new Blob([ab], {type: 'image/png'})

    let formData = new FormData();
    formData.append("rect",jsonString);
    formData.append("image",blob, new Date().getTime() + '.png');

    fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        method: 'POST',
        headers: headers,
        body: formData
    })
    .then( async (response) => {
        // get json response here
        let data = await response.json();
        reco = data["recognize"];
        if(response.status === 200){
         console.log("response ok : " + reco);
         document.getElementById('markdown_area').value = reco; 
        }else{
            console.log("response failed : " + response.status)
        }
      })
      .catch((err) => {
          console.log(err);
      });
}

function onCopy() {
    var input = document.createElement('textarea');
    input.innerHTML = document.getElementById('markdown_area').value;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}
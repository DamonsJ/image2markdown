var text_left = 0;
var text_top = 0;
var text_width = 0;
var text_height = 0;

var formula_left = 0;
var formula_top = 0;
var formula_width = 0;
var formula_height = 0;

var image_left = 0;
var image_top = 0;
var image_width = 0;
var image_height = 0;

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

function handleMouseDown(e) {
   
    // save the starting x/y of the rectangle
    startX = e.evt.offsetX;
    startY = e.evt.offsetY;

    console.log(" startX = " + startX);
    console.log(" startY = " + startY);
    // set a flag indicating the drag has begun
    isDown = true;
    if (cur_mode == 1) {
        text_left = startX;
        text_top = startY;

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
        formula_left = startX;
        formula_top = startY;
    }

    if (cur_mode == 3) {
        image_left = startX;
        image_top = startY;
    }
}

function handleMouseUp(e) {
    // the drag is over, clear the dragging flag
    isDown = false;
    console.log("================================================================ handleMouseUp ")
}

function handleMouseOut(e) {
    // the drag is over, clear the dragging flag
    isDown = false;
    console.log("================================================================ handleMouseOut ")
}

function handleMouseMove(e) {
   
    // if we're not dragging, just return
    if (!isDown) {
        return;
    }
 
    var width = e.evt.offsetX - startX;
    var height = e.evt.offsetY - startY;

    console.log(" width = " + width);
    console.log(" height = " + height);

    // Put your mousemove stuff here
    if (cur_mode == 1) {
        text_width = width;
        text_height = height;

        cur_graph.setAttrs({
            width: width,
            height: height
        });
    }

    if (cur_mode == 2) {
        formula_width = width;
        formula_height = height;
    }

    if (cur_mode == 3) {
        image_width = width;
        image_height = height;
    }

    
}

function onDrawTextRect() {
    cur_mode = 1; // draw text
    console.log(" cur_mode = " + cur_mode);
    if (stage) {
        text_layer = new Konva.Layer();
        stage.add(text_layer);
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

            markdown = "[img1]:" + dataurl;
            document.getElementById('markdown_area').value = markdown; 

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
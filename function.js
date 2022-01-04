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

var canvas_global;
var ctx_global;

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
    e.preventDefault();
    e.stopPropagation();

    // save the starting x/y of the rectangle
    startX = parseInt(e.pageX - offsetX);
    startY = parseInt(e.pageY - offsetY);

    console.log(" startX = " + startX);
    console.log(" startY = " + startY);
    // set a flag indicating the drag has begun
    isDown = true;
    if (cur_mode == 1) {
        text_left = startX;
        text_top = startY;
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
    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the dragging flag
    isDown = false;
}

function handleMouseOut(e) {
    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the dragging flag
    isDown = false;
}

function handleMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();

    // if we're not dragging, just return
    if (!isDown) {
        return;
    }
 
    // get the current mouse position
    mouseX = parseInt(e.pageX - offsetX);
    mouseY = parseInt(e.pageY - offsetY);

    console.log(" mouseX = " + mouseX);
    console.log(" mouseY = " + mouseY);

    // Put your mousemove stuff here
    if (cur_mode == 1) {
        text_width = width;
        text_height = height;
    }

    if (cur_mode == 2) {
        formula_width = width;
        formula_height = height;
    }

    if (cur_mode == 3) {
        image_width = width;
        image_height = height;
    }

    ctx_global.clearRect(0, 0, canvas_global.width, canvas_global.height);

    // calculate the rectangle width/height based
    // on starting vs current mouse position
    var width = mouseX - startX;
    var height = mouseY - startY;

    // draw a new rect from the start position 
    // to the current mouse position
    ctx_global.strokeRect(startX, startY, width, height);

    // console.log(" width = " + width);
    // console.log(" height = " + height);
}

function onDrawTextRect() {
    cur_mode = 1; // draw text
    console.log(" cur_mode = " + cur_mode);

    ctx_global.strokeStyle = "rgb(76, 175, 80)";
    ctx_global.lineWidth = 3;
}

function onInitCanvas() {

    
    var canvas = document.getElementById('image_canvas');
    canvas_global = canvas;
    // ctx_global = canvas.getContext("2d");

    offsetX = canvas.offsetLeft;
    offsetY = canvas.offsetTop;
    scrollX = canvas.scrollLeft;
    scrollY = canvas.scrollTop;

    console.log(" offsetX = " + offsetX);
    console.log(" offsetY = " + offsetY);
    console.log(" scrollX = " + scrollX);
    console.log(" scrollY = " + scrollY);

    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mouseout', handleMouseOut, false);

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
            ctx_global = ctx2;

            var dataurl = canvas.toDataURL("image/png");

            markdown = "[img1]:" + dataurl;
            document.getElementById('markdown_area').value = markdown; 

            onInitCanvas();
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
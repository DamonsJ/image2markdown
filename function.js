function imageLoaded() {
    afiles = document.getElementById('imgupload').files;
    cur_file = afiles[0]; // get the first file
    console.log("cur_file : ");
    console.log(cur_file.name);

    
    var reads = new FileReader();
    reads.onload = function(e) {

        var img = document.createElement("img");
        img.onload = function(event) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");

            var MAX_WIDTH = 600;
            var MAX_HEIGHT = 800;
       
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
            document.getElementById('image_frame').src = dataurl; 
        };
        img.src = this.result;
    };
    reads.readAsDataURL(cur_file);
}

function uploadImage(){
    document.getElementById("imgupload").click(); 
}
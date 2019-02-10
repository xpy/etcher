var img,
    bg = '#fff',
    lineColor = '#000',
    cnv,
    debug = false,
    hScroll = 0,
    vScroll = 0,
    capture;

var root = {
    zoom: 1,
    intensity: 1,
    debugCnv: null
};

function preload() {
    //img = loadImage("./assets/picbig-lebowski.jpg");
    img = loadImage("./assets/1-Large-Stone-Buddha-Bust-Head_260x370.jpg");
}


function createLines(imgArray) {
    let linesArray = [];
    for (let i = 0, l = imgArray.length; i < l; i++) {
        linesArray.push(new BezierLine(imgArray[i], {x: 10, y: i * 2}, 2))
    }

    return linesArray;
}

var anotherCanvas;

function drawRow(bez) {
    let row = bez.getShape();
    var startVertex = row.startVertex;
    strokeWeight(0);
    fill(lineColor);
    beginShape();
    vertex(startVertex.x, startVertex.y);

    for (let bez of row.vertexes) {
        bezierVertex(...bez);
    }
    endShape(CLOSE);

}

function mouseDragged() {
    let lb = cnv.canvas.offsetLeft,
        rb = cnv.canvas.offsetLeft + cnv.width,
        tb = cnv.canvas.offsetTop,
        bb = cnv.canvas.offsetTop + cnv.height;
    if (mouseX > lb && mouseX < rb && mouseY > tb && mouseY < bb) {
        hScroll += (pmouseX - mouseX) * (1 / root.zoom);
        vScroll += (pmouseY - mouseY) * (1 / root.zoom);
    } else {
        return true;
    }
}

function mouseWheel(event) {
    root.zoom += event.delta / 100;
}

function setup() {
    cnv = createCanvas(600, 600);
    cnv.parent('canvas-container');
    img.resize(100, 0);
    let intensitySlider = createSlider(0, 3, 1, .1);
    intensitySlider.changed(function () {
        root.intensity = intensitySlider.value();
    });
    let toneSlider = createSlider(0, 100, 50, 1);
    toneSlider.changed(function () {
        root.tones = toneSlider.value();
    });
    // capture = createCapture(VIDEO);
    // capture.size(160, 120);
    // capture.hide();
    // save('budha');
    // anotherCanvas = createGraphics(320, 240);
    root.debugCnv = new Debugger(createGraphics(600, 600));
    root.svgCanvas = createGraphics(100, 100, SVG);
    root.svgCanvas.hide();
    /*
        with (root.svgCanvas) {
            let imgArray = etcher.prepareImage(img);
            let rowsArray = createLines(imgArray);
            root.debugCnv.setView(root.zoom, hScroll, vScroll);
            scale(root.zoom);
            translate(-hScroll, -vScroll);
            for (let i = 0, l = rowsArray.length; i < l; i++) {

                let row = rowsArray[i],
                    startVertex = row.startVertex,
                    endVertex = row.endVertex,
                    returnBeziers = row.returnBeziers,
                    beziers = row.beziers;
                strokeWeight(0);
                fill(lineColor);
                beginShape();
                vertex(startVertex.x, startVertex.y);

                for (let bez of beziers) {
                    bezierVertex(...bez)
                }
                vertex(endVertex.x, endVertex.y);
                for (let bez of returnBeziers) {
                    bezierVertex(...bez);
                    // root.debugCnv.drawPoint(bez[0], bez[1], [255, 0, 0])
                }

                bezierVertex(startVertex.x, startVertex.y, startVertex.x, startVertex.y, startVertex.x, startVertex.y);
                endShape(CLOSE);
                // root.debugCnv.drawLine(startVertex.x, startVertex.y, endVertex.x, endVertex.y, [244, 122, 158], true);
                console.log('ROOOWWW')
            }
            root.svgCanvas.save('budha.svg');
        }
    */
}


function draw() {
    root.debugCnv.debug = debug;
    background(bg);
    // anotherCanvas.image(capture, 0, 0, 160, 120);
    // let imgArray = etcher.prepareImage(anotherCanvas, root.tones);
    let imgArray = etcher.prepareImage(img, root.tones),
        rowsArray = createLines(imgArray);
    root.debugCnv.setView(root.zoom, hScroll, vScroll);
    scale(root.zoom);
    translate(-hScroll, -vScroll);
    for (let i = 0, l = rowsArray.length; i < l; i++) {
        drawRow(rowsArray[i]);
    }
    translate(hScroll, vScroll);
    scale(1 / root.zoom);
    root.debugCnv.draw();
}
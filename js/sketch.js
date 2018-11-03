var img,
    bg           = '#fff',
    lineColor    = '#000',
    invertColors = false,
    cnv,
    imgArray     = null,
    debug        = false,
    verticalScroll,
    rowsArray    = [],
    horizontalScroll,
    vScroll      = 0,
    hScroll      = 0,
    pg;
var root = {
    zoom: 1
};

function preload() {
    //img = loadImage("./assets/picbig-lebowski.jpg");
    img = loadImage("./assets/1-Large-Stone-Buddha-Bust-Head_260x370.jpg");
}

function prepareImage(img, squareSize) {
    let imageArray = [];

    function getSquare(x, y, size) {
        let sum = 0;
        for (let j = y, jl = Math.min(y + size, img.height); j < jl; j += 1) {
            for (let i = x, il = Math.min(x + size, img.width); i < il; i += 1) {
                let avg = img.get(i, j);
                avg = ((avg[0] + avg[1] + avg[2]) / 3) / 255;
                sum += avg;
            }
        }
        sum = sum / (size * size) * 1;

        // sum = float(sum.toFixed(1));
        return invertColors ? sum : 1 - sum;
    }

    let step = squareSize;
    for (let j = 0, jl = img.height; j * step < jl; j++) {
        imageArray[j] = [];
        for (let i = 0, il = img.width; i * step < il; i++) {
            imageArray[j][i] = getSquare(i * step, j * step, squareSize);
        }
    }

    return imageArray;
}

function setup() {
    cnv = createCanvas(600, 600);
    cnv.parent('canvas-container');
    root.strokeSize = createSlider(0, 100, 1);
    verticalScroll = createSlider(0, 100, 1);
    horizontalScroll = createSlider(0, 100, 1);
    root.strokeSize.parent('controls');
    root.strokeSize.input(function() {
        a.html(root.strokeSize.value());
    });
    imgArray = prepareImage(img,6);
    for (let i = 0, l = imgArray.length; i < l; i++) {
        let row = createRow(imgArray[i]);
        row.startVertex.y += i;
        row.endVertex.y += i;
        for (let bez of row.beziers) {
            bez[1] += i;
            bez[3] += i;
            bez[5] += i;
        }
        // console.log('row', row.beziers);
        rowsArray.push(row);
    }

    a = createSpan('asdfasdf');
    pg = createGraphics(600, 600);

    // save('budha');
}

function drawPoint(x, y, c) {
    y -= hScroll;
    x -= vScroll;
    x *= root.zoom;
    y *= root.zoom;
    if (x > 0 && x < 600 && y > 0 && y < 600) {
        pg.strokeWeight(5);
        pg.stroke(...c);
        pg.point(x, y);
        pg.stroke(0);
        pg.strokeWeight(1);

    }
}

function drawLine(x1, y1, x2, y2, c, flag) {
    y1 -= hScroll;
    x1 -= vScroll;
    x1 *= root.zoom;
    y1 *= root.zoom;
    y2 -= hScroll;
    x2 -= vScroll;
    x2 *= root.zoom;
    y2 *= root.zoom;

    if (flag || (x1 > 0 && x1 < 600 && y1 > 0 && y1 < 600)) {
        if (flag || (x2 > 0 && x2 < 600 && y2 > 0 && y2 < 600)) {
            pg.strokeWeight(2);
            pg.stroke(...c);
            pg.line(x1, y1, x2, y2);
            pg.stroke(0);
        }
    }
}

function createRow(points) {

    points.push(0);

    let beziers     = [],
        startVertex = {x: 0, y: 0},
        endVertex   = {x: (points.length + 1), y: 0};
    beziers.push([
        0, 0,
        points[0], points[0] / 2,
        1, points[0] / 2,
    ]);
    for (let i = 1, l = points.length; i <= l; i++) {
        let pointX         = i + 1,
            pointY         = points[i] / 2,
            previousBezier = {
                x: pointX - (points[i - 1] + points[i]) / 2,
                y: points[i - 1] / 2
            },
            nextBezier     = {
                x: pointX - (points[i] / 2),
                y: points[i] / 2
            };

        beziers.push([
            previousBezier.x,
            previousBezier.y,
            nextBezier.x,
            nextBezier.y,
            pointX,
            pointY
        ]);
    }

    return {
        startVertex: startVertex,
        endVertex: endVertex,
        beziers: beziers
    }
}

function drawRow(row) {
    let startVertex = row.startVertex,
        endVertex   = row.endVertex,
        beziers     = row.beziers;
    strokeWeight(0);
    fill(lineColor);
    beginShape();
    vertex(startVertex.x, startVertex.y);

    for (let bez of beziers) {
        bezierVertex(...bez)
    }
    vertex(endVertex.x, endVertex.y);

    for (let i = beziers.length - 2; i > 0; i--) {
        let bez = beziers[i].slice();
        bez[0] = beziers[i + 1][2];
        bez[1] = startVertex.y * 2 - beziers[i + 1][3];
        bez[2] = beziers[i + 1][0];
        bez[3] = startVertex.y * 2 - beziers[i + 1][1];
        bez[5] = startVertex.y * 2 - bez[5];
        bezierVertex(...bez);

        if (debug) {
            // drawPoint(bez[0], bez[1], [244, 122, 158]);
            drawLine(bez[2], bez[3], bez[4], bez[5], [250, 255, 20]);
            drawPoint(bez[2], bez[3], [255, 50, 50]);
            drawPoint(bez[4], bez[5], [122, 255, 255]);
        }
    }

    bezierVertex(startVertex.x, startVertex.y, startVertex.x, startVertex.y, startVertex.x, startVertex.y);
    endShape();
    if(debug){
        drawLine(startVertex.x, startVertex.y, endVertex.x, endVertex.y, [244, 122, 158], true);
    }

}

function mouseDragged() {
    vScroll += (pmouseX - mouseX) * (1 / root.zoom);
    hScroll += (pmouseY - mouseY) * (1 / root.zoom);
}

function mouseWheel(event) {
    root.zoom += event.delta / 100;
}

function draw() {

    background(bg);
    pg.clear();
    // pan();
    let r = root.zoom;
    // vScroll = verticalScroll.value(),
    // hScroll = horizontalScroll.value();
    scale(r);
    translate(-vScroll, -hScroll);
    for (let i = 0, l = rowsArray.length; i < l; i++) {
        drawRow(rowsArray[i]);
    }
    translate(vScroll, hScroll);
    scale(1 / r);
    image(pg, 0, 0);
}
var img,
    bg           = '#fff',
    lineColor    = '#000',
    invertColors = false,
    cnv,
    imgArray     = null,
    strokeSize   = null,
    debug        = false;

function preload() {
    //img = loadImage("./assets/picbig-lebowski.jpg");
    img = loadImage("./1-Large-Stone-Buddha-Bust-Head_260x370.jpg");
    // img = loadImage("./assets/goliath-bug.png");
}

function prepareImage(img, squareSize) {
    let imageArray = [];

    function getSquare(x, y, size) {
        let sum = 0;
        for (let j = y, jl = Math.min(y + size, img.height); j <= jl; j += 1) {
            for (let i = x, il = Math.min(x + size, img.width); i <= il; i += 1) {
                let avg = img.get(i, j);
                avg = ((avg[0] + avg[1] + avg[2]) / 3) / 255;
                sum += avg;
            }
        }
        sum = sum / (size * size) * 1;

        // sum = float(sum.toFixed(1));
        // console.log(sum);
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
    strokeSize = createSlider(0, 100, 1);
    strokeSize.parent('controls');
    strokeSize.input(function() {
        a.html(strokeSize.value());
    });
    imgArray = prepareImage(img, 2);
    a = createSpan('asdfasdf');

    // save('budha');
}

function drawPoint(x, y, c) {
    strokeWeight(5);
    stroke(...c);
    point(x, y);
    stroke(0);
    strokeWeight(0);
}

function createTheThing(start, pointWidth, points) {

    function getPointY(p) {
        return start.y - p * pointWidth / 2;
    }

    points.push(0);
    let beziers     = [],
        startVertex = vertex(start.x, start.y),
        endVertex   = vertex(
            start.x + pointWidth * (points.length + 1),
            start.y
        );
    beziers.push([
        start.x, start.y,
        pointWidth + start.x - points[0] * pointWidth, getPointY(points[0]),
        pointWidth + start.x,
        getPointY(points[0]),
    ]);
    for (let i = 1, l = points.length; i < l; i++) {
        let pointX         = (i + 1) * pointWidth + start.x,
            pointY         = getPointY(points[i]),
            previousBezier = {
                x: pointX - (points[i - 1] + points[i]) / 2 * pointWidth,
                y: getPointY(points[i - 1])
            },
            nextBezier     = {
                x: pointX - points[i] * pointWidth,
                y: getPointY(points[i])
            };
        if (debug) {
            drawPoint(pointX, pointY, [244, 122, 158]);
            drawPoint(previousBezier.x, previousBezier.y, [10, 122, 158]);
            drawPoint(nextBezier.x, nextBezier.y, [100, 250, 255]);
            drawPoint(pointX, 2 * start.y - pointY, [244, 122, 158]);
            drawPoint(previousBezier.x, 2 * start.y - previousBezier.y, [10, 122, 158]);
            drawPoint(nextBezier.x, 2 * start.y - nextBezier.y, [100, 250, 255]);
        }

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

function drawTheThing(start, pointWidth, created) {
    let startVertex = created.startVertex;
    let endVertex = created.endVertex;
    let beziers = created.beziers;
    strokeWeight(0);
    fill(lineColor);
    beginShape();
    vertex(startVertex.x * pointWidth, startVertex.y * pointWidth);

    for (let bez of beziers) {
        bez[0] *= pointWidth;
        bez[2] *= pointWidth;
        bez[4] *= pointWidth;
        bezierVertex(...bez)
    }
    // endShape();
    // beginShape();
    // vertex(start.x, start.y);
    vertex(endVertex.x * pointWidth, endVertex.y * pointWidth);

    for (let i = beziers.length - 2; i > 0; i--) {
        let bez = beziers[i].slice();
        bez[0] = beziers[i + 1][2];
        bez[1] = start.y * 2 - beziers[i + 1][3];
        bez[2] = beziers[i + 1][0];
        bez[3] = start.y * 2 - beziers[i + 1][1];
        bez[5] = start.y * 2 - bez[5];
        bezierVertex(...bez);
        // bezierVertex(bez[2], bez[3], bez[0], bez[1], bez[4], bez[5]);
    }

    bezierVertex(start.x, start.y, start.x, start.y, start.x, start.y);

    endShape();

    //vertex(endVertex.x, endVertex.y)

}

function draw() {

    background(bg);
    let r = strokeSize.value();
    for (let i = 0, l = imgArray.length; i < l; i++) {
        let created = createTheThing({
                x: 0,
                y: (r) * (i + 1)
            }, 1, imgArray[i]
        );
        drawTheThing({
            x: 0,
            y: (r) * (i + 1)
        }, r, created);
    }

}
var etcher = {
    prepareImage: function (img, tones) {
        let imageArray = [];
        img.loadPixels();
        tones = tones || 1000;

        for (let p = 0, lp = img.pixels.length; p < lp; p += 4) {
            let p4 = p / 4,
                j = Math.floor(p4 / img.width),
                i = p4 % img.width;
            imageArray[j] = imageArray[j] || [];
            imageArray[j][i] = ((img.pixels[p] + img.pixels[p + 1] + img.pixels[p + 2]) / 3) / 255;
            imageArray[j][i] = Math.max(Math.min(imageArray[j][i] * root.intensity, 1), 0);
            imageArray[j][i] = Math.floor(imageArray[j][i] * tones) / tones;
        }
        return imageArray;
    },
    createRow: function (points) {

        points.push(0);

        let bezierList = [],
            startVertex = {x: 0, y: 0},
            endVertex = {x: (points.length + 1), y: 0};
        bezierList.push([
            0, 0,
            points[0], points[0] / 2,
            1, points[0] / 2,
        ]);
        for (let i = 1, l = points.length; i < l; i++) {
            let pointX = i + 1,
                pointY = points[i] / 2,
                previousBezier = {
                    x: pointX - (points[i - 1] + points[i]) / 2,
                    y: points[i - 1] / 2
                },
                nextBezier = {
                    x: pointX - (points[i] / 2),
                    y: points[i] / 2
                };

            bezierList.push([
                previousBezier.x,
                previousBezier.y,
                nextBezier.x,
                nextBezier.y,
                pointX,
                pointY
            ]);
        }
        let returnBeziers = [];

        for (let i = bezierList.length - 2; i > 0; i--) {
            let bez = bezierList[i].slice();

            bez[0] = bezierList[i + 1][2];
            bez[1] = startVertex.y * 2 - bezierList[i + 1][3];
            bez[2] = bezierList[i + 1][0];
            bez[3] = startVertex.y * 2 - bezierList[i + 1][1];
            bez[5] = startVertex.y * 2 - bez[5];
            returnBeziers.push(bez)
        }


        return {
            startVertex: startVertex,
            endVertex: endVertex,
            beziers: bezierList,
            returnBeziers: returnBeziers
        }
    }

};


var BezierLine = function (line, startPoint, width) {
    width = width || 1;
    line = line || [0.30, 0.47, 0.90, 0.59, 0.96, 0.63, 0.82, 0.46, 0.69, 0.38, 0.035, 0.088, 0.38, 0.87, 0.080, 0.45, 0.71, 0.84, 0.65, 0.43];
    this.line = line;
    this.rotations = [];
    for (let l of line) {
        this.rotations.append(0)
    }
    this.rotations[3] = 90;
    startPoint = startPoint || new PointXY(0, 0);
    let startVertex = new PointXY(startPoint.x, startPoint.y),
        endVertex = new PointXY(startPoint.x + this.line.length * width + 1, startPoint.y),
        goVertex = [],
        returnVertex = [];

    this.calculate = function () {
        for (let i = 0, l = this.line.length; i < l; i++) {
            let px = startVertex.x + (i * width) + 1,
                py = startVertex.y + this.line[i],
                p = new BezierControlPoint(px, py, px - this.line[i] / 2, py, px + this.line[i] / 2, py);
            py = startVertex.y - this.line[i];
            let pr = new BezierControlPoint(px, py, px + this.line[i] / 2, py, px - this.line[i] / 2, py);
            goVertex.push(p);
            returnVertex.unshift(pr);
        }
    };

    this.getShape = function () {
        let shape = [];

        let vertex = [startVertex.x + .5, startVertex.y, goVertex[0].cp1.x, goVertex[0].cp1.y, goVertex[0].point.x, goVertex[0].point.y];
        shape.push(vertex);
        for (let i = 1, l = goVertex.length; i < l; i++) {
            let v = goVertex[i], prev = goVertex[i - 1];
            shape.push([prev.cp2.x, prev.cp2.y, v.cp1.x, v.cp1.y, v.point.x, v.point.y])
        }
        let lastVertex = goVertex[goVertex.length - 1];
        shape.push([lastVertex.cp2.x, lastVertex.cp2.y, endVertex.x - .25, endVertex.y, endVertex.x, endVertex.y]);
        shape.push([endVertex.x - .25, endVertex.y, returnVertex[0].cp1.x, returnVertex[0].cp1.y, returnVertex[0].point.x, returnVertex[0].point.y]);
        for (let i = 1, l = returnVertex.length; i < l; i++) {
            let v = returnVertex[i], prev = returnVertex[i - 1];
            shape.push([prev.cp2.x, prev.cp2.y, v.cp1.x, v.cp1.y, v.point.x, v.point.y])
        }
        lastVertex = returnVertex[returnVertex.length - 1];
        shape.push([lastVertex.cp2.x, lastVertex.cp2.y, startVertex.x + .5, startVertex.y, startVertex.x, startVertex.y]);

        return {startVertex: startVertex, vertexes: shape};
    };

    this.calculate();
};

var PointXY = function (x, y) {
    let initialX = x,
        initialY = y;
    this.x = x;
    this.y = y;
    this.rotate = function (angle) {
        let transformationMatrix = math.matrix([
            [Math.cos(angle), -Math.sin(angle), 0],
            [Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1]
        ]);
        this.transformMatrix = math.multiply(transformationMatrix, this.transformMatrix);
        return this;
    };

    this.rotateAroundPoint = function (angle, point) {
        this.move({x: -point.x, y: -point.y}).rotate(angle).move(point);
        return this;
    };
    this.matrix = function () {
        return math.matrix([this.x, this.y, 1]);
    };

    this.move = function (delta) {
        let transformationMatrix = math.matrix([[1, 0, delta.x], [0, 1, delta.y], [0, 0, 1]]);
        this.transformMatrix = math.multiply(transformationMatrix, this.transformMatrix);
        return this
    };
    this.applyTransform = function () {
        let transformArray = this.transformMatrix.toArray();
        this.x = transformArray[0];
        this.y = transformArray[1]
    };
    this.transformMatrix = this.matrix();

};

var BezierControlPoint = function (x, y, cp1x, cp1y, cp2x, cp2y) {
    this.point = new PointXY(x, y);
    this.cp1 = new PointXY(cp1x, cp1y);
    this.cp2 = new PointXY(cp2x, cp2y);
};
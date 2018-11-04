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


var bezierLine = function () {
    var line = [0.5, 0.2, 0.3, 0.4, 0.5, 0.5, 0.5, 0.2, 0.1, 0.3];
    var startVertex = new pointXY(10, 10),
        endVertex = new pointXY(10 + line.length + 1, 10),
        goVertex = [],
        returnVertex = [];
    for (let i = 0, l = line.length; i < l; i++) {
        let px = startVertex.x + i + 1;
        let py = startVertex.y + line[i];
        let p = new bezierControlPoint(px, py, px - line[i] / 2, py, px + line[i] / 2, py);
        goVertex.push(p);
        py = startVertex.y - line[i];
        let pr = new bezierControlPoint(px, py, px + line[i] / 2, py, px - line[i] / 2, py);
        returnVertex.unshift(pr);
    }

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
    }
};

var pointXY = function (x, y) {
    this.x = x;
    this.y = y;
};

var bezierControlPoint = function (x, y, cp1x, cp1y, cp2x, cp2y) {
    this.point = new pointXY(x, y);
    this.cp1 = new pointXY(cp1x, cp1y);
    this.cp2 = new pointXY(cp2x, cp2y);
};
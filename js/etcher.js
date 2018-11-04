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
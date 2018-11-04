var Debugger = function (cnv) {

    return {
        zoom: 1,
        translateX: 0,
        translateY: 1,
        debug: false,
        draw: function () {
            if (this.debug) {
                image(cnv, 0, 0);
            }
            cnv.clear();
        },
        setView: function (zoom, translateX, translateY) {
            this.zoom = zoom;
            this.translateX = translateX;
            this.translateY = translateY
        },
        drawPoint: function (x, y, c) {
            y -= this.translateY;
            x -= this.translateX;
            x *= this.zoom;
            y *= this.zoom;
            if (x > 0 && x < 600 && y > 0 && y < 600) {
                cnv.strokeWeight(5);
                cnv.stroke(...c);
                cnv.point(x, y);
                cnv.stroke(0);
                cnv.strokeWeight(1);
            }
        },
        drawLine: function (x1, y1, x2, y2, c, flag) {
            y1 -= this.translateY;
            x1 -= this.translateX;
            x1 *= this.zoom;
            y1 *= this.zoom;
            y2 -= this.translateY;
            x2 -= this.translateX;
            x2 *= this.zoom;
            y2 *= this.zoom;

            if (flag || (x1 > 0 && x1 < cnv.width && y1 > 0 && y1 < cnv.height)) {
                if (flag || (x2 > 0 && x2 < cnv.width && y2 > 0 && y2 < cnv.height)) {
                    cnv.strokeWeight(2);
                    cnv.stroke(...c);
                    cnv.line(x1, y1, x2, y2);
                    cnv.stroke(0);
                }
            }
        }
    }
};
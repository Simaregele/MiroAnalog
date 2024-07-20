export class Shape {
    constructor(pos, layer) {
        this.pos = pos;
        this.layer = layer;
        this.shape = null;
    }

    startDrawing() {
        // Abstract method
    }

    updateDrawing(pos) {
        // Abstract method
    }

    finishDrawing() {
        // Abstract method
    }

    addToLayer() {
        if (this.shape) {
            this.layer.add(this.shape);
            this.layer.draw();
        }
    }
}

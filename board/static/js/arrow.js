export class Arrow {
    constructor(pos, layer) {
        this.layer = layer;
        this.arrow = new Konva.Arrow({
            points: [pos.x, pos.y, pos.x + 1, pos.y + 1],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'red',
            stroke: 'red',
            strokeWidth: 2,
            draggable: true,
        });
        this.layer.add(this.arrow);

        this.transformer = new Konva.Transformer({
            nodes: [this.arrow],
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        });
        this.layer.add(this.transformer);
        this.transformer.hide();
    }

    addToLayer() {
        this.layer.add(this.arrow);
        this.layer.draw();
    }

    updateDrawing(pos) {
        const points = this.arrow.points();
        points[2] = pos.x;
        points[3] = pos.y;
        this.arrow.points(points);
        this.transformer.forceUpdate();
    }

    setPosition(x, y) {
        const points = this.arrow.points();
        const dx = x - points[0];
        const dy = y - points[1];
        points[0] = x;
        points[1] = y;
        points[2] += dx;
        points[3] += dy;
        this.arrow.points(points);
        this.transformer.forceUpdate();
    }

    setSize(width, height) {
        const points = this.arrow.points();
        points[2] = points[0] + width;
        points[3] = points[1] + height;
        this.arrow.points(points);
        this.transformer.forceUpdate();
    }

    getPosition() {
        const points = this.arrow.points();
        return { x: points[0], y: points[1] };
    }

    getSize() {
        const points = this.arrow.points();
        return { width: points[2] - points[0], height: points[3] - points[1] };
    }

    getSides() {
        const points = this.arrow.points();
        return {
            XL: Math.min(points[0], points[2]),
            XR: Math.max(points[0], points[2]),
            YU: Math.min(points[1], points[3]),
            YD: Math.max(points[1], points[3]),
        };
    }

    setSide(side, value) {
        const points = this.arrow.points();
        switch (side) {
            case 'XL':
                points[0] = value;
                break;
            case 'XR':
                points[2] = value;
                break;
            case 'YU':
                points[1] = value;
                break;
            case 'YD':
                points[3] = value;
                break;
        }
        this.arrow.points(points);
        this.transformer.forceUpdate();
    }

    enableTransform() {
        this.transformer.show();
        this.layer.draw();
    }

    disableTransform() {
        this.transformer.hide();
        this.layer.draw();
    }

    destroy() {
        this.transformer.destroy();  // Destroy transformer first
        this.arrow.destroy();
    }
}

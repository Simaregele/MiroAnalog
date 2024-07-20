export class Circle {
    constructor(pos, layer) {
        this.layer = layer;
        this.circle = new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: 1,
            stroke: 'red',
            strokeWidth: 2,
            draggable: true,
        });
        this.layer.add(this.circle);

        this.transformer = new Konva.Transformer({
            nodes: [this.circle],
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            boundBoxFunc: (oldBox, newBox) => {
                newBox.width = newBox.height = Math.max(newBox.width, newBox.height);
                return newBox;
            },
        });
        this.layer.add(this.transformer);
        this.transformer.hide();
    }

    addToLayer() {
        this.layer.add(this.circle);
        this.layer.draw();
    }

    updateDrawing(pos) {
        this.circle.radius(Math.max(Math.abs(pos.x - this.circle.x()), Math.abs(pos.y - this.circle.y())));
        this.transformer.forceUpdate();
    }

    setPosition(x, y) {
        this.circle.x(x);
        this.circle.y(y);
    }

    setSize(width, height) {
        this.circle.radius(Math.max(width, height) / 2);
        this.transformer.forceUpdate();
    }

    getPosition() {
        return { x: this.circle.x(), y: this.circle.y() };
    }

    getSize() {
        return { radius: this.circle.radius() };
    }

    getSides() {
        return {
            XL: this.circle.x() - this.circle.radius(),
            XR: this.circle.x() + this.circle.radius(),
            YU: this.circle.y() - this.circle.radius(),
            YD: this.circle.y() + this.circle.radius()
        };
    }

    setSide(side, value) {
        switch (side) {
            case 'XL':
                this.circle.x((value + this.getSides().XR) / 2);
                this.circle.radius((this.getSides().XR - value) / 2);
                break;
            case 'XR':
                this.circle.x((this.getSides().XL + value) / 2);
                this.circle.radius((value - this.getSides().XL) / 2);
                break;
            case 'YU':
                this.circle.y((value + this.getSides().YD) / 2);
                this.circle.radius((this.getSides().YD - value) / 2);
                break;
            case 'YD':
                this.circle.y((this.getSides().YU + value) / 2);
                this.circle.radius((value - this.getSides().YU) / 2);
                break;
        }
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
        this.circle.destroy();
    }
}

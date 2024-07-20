export class Rectangle {
    constructor(pos, layer) {
        this.layer = layer;
        this.rect = new Konva.Rect({
            x: pos.x,
            y: pos.y,
            width: 1,
            height: 1,
            stroke: 'red',
            strokeWidth: 2,
            draggable: true,
        });
        this.layer.add(this.rect);

        this.transformer = new Konva.Transformer({
            nodes: [this.rect],
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        });
        this.layer.add(this.transformer);
        this.transformer.hide();
    }

    addToLayer() {
        this.layer.add(this.rect);
        this.layer.draw();
    }

    updateDrawing(pos) {
        this.rect.width(pos.x - this.rect.x());
        this.rect.height(pos.y - this.rect.y());
        this.transformer.forceUpdate();
    }

    setPosition(x, y) {
        this.rect.x(x);
        this.rect.y(y);
    }

    setSize(width, height) {
        this.rect.width(width);
        this.rect.height(height);
        this.transformer.forceUpdate();
    }

    getPosition() {
        return { x: this.rect.x(), y: this.rect.y() };
    }

    getSize() {
        return { width: this.rect.width(), height: this.rect.height() };
    }

    getSides() {
        return {
            XL: this.rect.x(),
            XR: this.rect.x() + this.rect.width(),
            YU: this.rect.y(),
            YD: this.rect.y() + this.rect.height()
        };
    }

    setSide(side, value) {
        switch (side) {
            case 'XL':
                this.rect.x(value);
                this.rect.width(this.getSides().XR - value);
                break;
            case 'XR':
                this.rect.width(value - this.getSides().XL);
                break;
            case 'YU':
                this.rect.y(value);
                this.rect.height(this.getSides().YD - value);
                break;
            case 'YD':
                this.rect.height(value - this.getSides().YU);
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
        this.rect.destroy();
    }
}

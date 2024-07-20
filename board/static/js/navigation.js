export class Navigation {
    constructor(stage) {
        this.stage = stage;
        this.initNavigation();
    }

    initNavigation() {
        // Make stage draggable on middle mouse button
        this.stage.on('mousedown', (e) => {
            if (e.evt.button === 1) { // Middle mouse button
                this.stage.draggable(true);
            } else if (e.evt.button === 0) { // Left mouse button
                this.stage.draggable(false);
            }
        });

        this.stage.on('mouseup', (e) => {
            this.stage.draggable(false);
        });

        // Zoom on mouse wheel
        this.stage.on('wheel', (e) => {
            e.evt.preventDefault();
            const scaleBy = 1.1;
            const oldScale = this.stage.scaleX();

            const mousePointTo = {
                x: this.stage.getPointerPosition().x / oldScale - this.stage.x() / oldScale,
                y: this.stage.getPointerPosition().y / oldScale - this.stage.y() / oldScale,
            };

            const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            this.stage.scale({ x: newScale, y: newScale });

            const newPos = {
                x: -(mousePointTo.x - this.stage.getPointerPosition().x / newScale) * newScale,
                y: -(mousePointTo.y - this.stage.getPointerPosition().y / newScale) * newScale,
            };
            this.stage.position(newPos);
            this.stage.batchDraw();
        });
    }
}

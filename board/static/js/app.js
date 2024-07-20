import { Rectangle } from './rectangle.js';
import { Circle } from './circle.js';
import { Text } from './text.js';
import { Arrow } from './arrow.js';
import { Navigation } from './navigation.js';

console.log('JavaScript loaded');

document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM fully loaded and parsed');

    new Vue({
        el: '#app',
        data: {
            selectedTool: null,
            stage: null,
            layer: null,
            isDrawing: false,
            isResizing: false,
            currentShape: null,
            selectedShape: null,
            startPos: { x: 0, y: 0 },
            fixedSide: '', // Фиксированная сторона
            resizingSide: '', // Изменяемая сторона
        },
        methods: {
            selectTool(tool) {
                this.selectedTool = tool;
                console.log(`Selected tool: ${tool}`);
            },
            startDrawing(pos) {
                if (!this.selectedTool) {
                    console.log('No tool selected');
                    return;
                }
                this.isDrawing = true;
                this.startPos = pos;
                console.log(`Start drawing at position: ${pos.x}, ${pos.y}`);
                switch (this.selectedTool) {
                    case 'rectangle':
                        this.currentShape = new Rectangle(pos, this.layer);
                        break;
                    case 'circle':
                        this.currentShape = new Circle(pos, this.layer);
                        break;
                    case 'text':
                        this.currentShape = new Text(pos, this.layer);
                        break;
                    case 'arrow':
                        this.currentShape = new Arrow(pos, this.layer);
                        break;
                    default:
                        console.log(`Unknown tool: ${this.selectedTool}`);
                        return;
                }
                this.currentShape.addToLayer();
            },
            startResizing(pos) {
                if (this.selectedShape && this.selectedShape.getSides) {
                    this.isResizing = true;
                    this.startPos = pos;
                    const sides = this.selectedShape.getSides();
                    const tolerance = 10; // Порог для определения стороны

                    if (Math.abs(pos.x - sides.XL) < tolerance) {
                        this.resizingSide = 'XL';
                        this.fixedSide = 'XR';
                    } else if (Math.abs(pos.x - sides.XR) < tolerance) {
                        this.resizingSide = 'XR';
                        this.fixedSide = 'XL';
                    } else if (Math.abs(pos.y - sides.YU) < tolerance) {
                        this.resizingSide = 'YU';
                        this.fixedSide = 'YD';
                    } else if (Math.abs(pos.y - sides.YD) < tolerance) {
                        this.resizingSide = 'YD';
                        this.fixedSide = 'YU';
                    }

                    console.log('Start resizing');
                    console.log(`Resizing side: ${this.resizingSide}`);
                    console.log(`Fixed side: ${this.fixedSide}`);
                }
            },
            updateDrawing(pos) {
                if (this.isDrawing && this.currentShape) {
                    console.log(`Update drawing to position: ${pos.x}, ${pos.y}`);
                    this.currentShape.updateDrawing(pos);
                } else if (this.isResizing && this.selectedShape) {
                    switch (this.resizingSide) {
                        case 'XL':
                        case 'XR':
                            this.selectedShape.setSide(this.resizingSide, pos.x);
                            break;
                        case 'YU':
                        case 'YD':
                            this.selectedShape.setSide(this.resizingSide, pos.y);
                            break;
                    }

                    this.layer.batchDraw();

                    // Вывод размеров и положения мыши в консоль
                    console.log(`Mouse position: ${pos.x}, ${pos.y}`);
                    const size = this.selectedShape.getSize();
                    console.log(`Shape size: ${size.width || size.radius * 2} x ${size.height || size.radius * 2}`);
                }
            },
            finishDrawing() {
                if (this.isDrawing) {
                    console.log('Finish drawing');
                    this.isDrawing = false;
                    if (this.selectedTool === 'text' && this.currentShape) {
                        this.currentShape.startEditing();
                    }
                    this.currentShape = null;
                } else if (this.isResizing) {
                    console.log('Finish resizing');
                    this.isResizing = false;
                    this.selectedShape.disableTransform();
                    this.selectedShape = null;
                    this.fixedSide = '';
                    this.resizingSide = '';
                }
            },
            clearTool() {
                this.selectedTool = null;
                console.log('Tool selection cleared');
            },
            deleteShape() {
                if (this.selectedShape) {
                    this.selectedShape.destroy();
                    this.layer.draw();
                    this.selectedShape = null;
                    console.log('Shape deleted');
                }
            },
        },
        mounted() {
            console.log('Vue app mounted');
            this.stage = new Konva.Stage({
                container: 'container',
                width: window.innerWidth,
                height: window.innerHeight,
            });

            this.layer = new Konva.Layer();
            this.stage.add(this.layer);
            console.log('Stage and layer initialized');

            // Initialize navigation
            new Navigation(this.stage);

            // Add drawing and resizing events
            this.stage.on('mousedown', (e) => {
                const pos = this.stage.getPointerPosition();
                if (e.evt.ctrlKey && e.target !== this.stage && e.target.getSides) {
                    this.selectedShape = e.target;
                    this.selectedShape.enableTransform();
                    this.startResizing(pos);
                } else if (e.evt.button === 0 && e.target === this.stage) { // Left mouse button
                    console.log(`Mouse down at: ${pos.x}, ${pos.y}`);
                    this.startDrawing(pos);
                } else if (e.target !== this.stage) { // If clicking on an existing shape
                    if (this.selectedShape) {
                        this.selectedShape.disableTransform();
                    }
                    this.selectedShape = e.target;
                    this.selectedShape.enableTransform();
                    console.log('Shape selected');
                }
            });

            this.stage.on('mousemove', (e) => {
                const pos = this.stage.getPointerPosition();
                if (this.isDrawing || this.isResizing) {
                    this.updateDrawing(pos);
                }
            });

            this.stage.on('mouseup', () => {
                this.finishDrawing();
            });

            // Add ESC key event to clear tool selection
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearTool();
                } else if (e.key === 'Delete') {
                    this.deleteShape();
                }
            });
        },
    });
});

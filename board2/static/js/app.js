document.addEventListener("DOMContentLoaded", function() {
    var selectedShapeType = null;
    var currentShape = null;
    var isDrawing = false;
    var selectionRectangle = null;
    var isSelecting = false;
    var selectionStart = { x: 0, y: 0 };

    // Menu buttons
    document.getElementById('selectRect').onclick = function() { selectedShapeType = 'rectangle'; };
    document.getElementById('selectCircle').onclick = function() { selectedShapeType = 'circle'; };
    document.getElementById('selectArrow').onclick = function() { selectedShapeType = 'arrow'; };
    document.getElementById('selectText').onclick = function() { selectedShapeType = 'text'; };
    document.getElementById('selectNestedBoard').onclick = function() { selectedShapeType = 'nestedBoard'; };

    // Style elements
    var stylePanel = document.getElementById('style-panel');
    var fillColorInput = document.getElementById('fillColor');
    var strokeColorInput = document.getElementById('strokeColor');
    var strokeWidthInput = document.getElementById('strokeWidth');
    var applyStyleButton = document.getElementById('applyStyle');

    var stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth * 2,
        height: window.innerHeight * 2,
    });

    var layer = new Konva.Layer();
    stage.add(layer);

    var transformer = new Konva.Transformer();
    layer.add(transformer);

    // Create a hidden input for text editing
    var textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.style.position = 'absolute';
    textInput.style.display = 'none';
    document.body.appendChild(textInput);

    function resizeStage(pos) {
        if (pos.x > stage.width() - 50) {
            stage.width(stage.width() + window.innerWidth);
        }
        if (pos.y > stage.height() - 50) {
            stage.height(stage.height() + window.innerHeight);
        }
    }

    function saveShapes() {
        var shapes = layer.getChildren().map(shape => shape.toJSON());
        fetch(`/save_shapes/${boardId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shapes: shapes })
        }).then(response => {
            if (!response.ok) {
                console.error("Error saving shapes");
            }
        });
    }

    stage.on('mousedown', function(e) {
        var pos = stage.getPointerPosition();
        if (e.evt.shiftKey) {
            isSelecting = true;
            selectionStart = pos;
            selectionRectangle = new Konva.Rect({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                fill: 'rgba(0,0,255,0.3)',
                stroke: 'blue',
                strokeWidth: 1,
            });
            layer.add(selectionRectangle);
            layer.draw();
        } else if (e.target === stage && selectedShapeType) {
            isDrawing = true;

            switch (selectedShapeType) {
                case 'rectangle':
                    currentShape = new Konva.Rect({
                        x: pos.x,
                        y: pos.y,
                        width: 0,
                        height: 0,
                        fill: fillColorInput.value,
                        stroke: strokeColorInput.value,
                        strokeWidth: parseInt(strokeWidthInput.value, 10),
                        draggable: true,
                    });
                    break;
                case 'circle':
                    currentShape = new Konva.Circle({
                        x: pos.x,
                        y: pos.y,
                        radius: 0,
                        fill: fillColorInput.value,
                        stroke: strokeColorInput.value,
                        strokeWidth: parseInt(strokeWidthInput.value, 10),
                        draggable: true,
                    });
                    break;
                case 'arrow':
                    currentShape = new Konva.Arrow({
                        points: [pos.x, pos.y, pos.x, pos.y],
                        pointerLength: 10,
                        pointerWidth: 10,
                        fill: fillColorInput.value,
                        stroke: strokeColorInput.value,
                        strokeWidth: parseInt(strokeWidthInput.value, 10),
                        draggable: true,
                    });
                    break;
                case 'text':
                    currentShape = new Konva.Text({
                        x: pos.x,
                        y: pos.y,
                        text: 'Editable Text',
                        fontSize: 20,
                        draggable: true,
                    });
                    break;
                case 'nestedBoard':
                    fetch(`/create_nested_board/${boardId}`)
                        .then(response => response.json())
                        .then(data => {
                            currentShape = new Konva.Rect({
                                x: pos.x,
                                y: pos.y,
                                width: 200,
                                height: 100,
                                fill: 'lightgray',
                                stroke: 'black',
                                strokeWidth: 2,
                                draggable: true,
                            });
                            var nestedBoardText = new Konva.Text({
                                x: pos.x + 10,
                                y: pos.y + 10,
                                text: `Nested Board ${data.new_board_id}`,
                                fontSize: 16,
                                draggable: true,
                            });
                            currentShape.on('click', function() {
                                window.location.href = `/board/${data.new_board_id}`;
                            });
                            layer.add(currentShape);
                            layer.add(nestedBoardText);
                            layer.draw();
                            saveShapes();
                        });
                    break;
            }

            if (currentShape) {
                layer.add(currentShape);
                layer.draw();
            }
        }
    });

    stage.on('mousemove', function(e) {
        var pos = stage.getPointerPosition();
        if (isDrawing) {
            if (currentShape) {
                switch (selectedShapeType) {
                    case 'rectangle':
                        currentShape.width(pos.x - currentShape.x());
                        currentShape.height(pos.y - currentShape.y());
                        break;
                    case 'circle':
                        var radius = Math.sqrt(Math.pow(pos.x - currentShape.x(), 2) + Math.pow(pos.y - currentShape.y(), 2));
                        currentShape.radius(radius);
                        break;
                    case 'arrow':
                        var points = currentShape.points();
                        points[2] = pos.x;
                        points[3] = pos.y;
                        currentShape.points(points);
                        break;
                }
                layer.batchDraw();
            }
        } else if (isSelecting) {
            var width = pos.x - selectionStart.x;
            var height = pos.y - selectionStart.y;
            selectionRectangle.width(width);
            selectionRectangle.height(height);
            layer.batchDraw();
        }

        resizeStage(pos);
    });

    stage.on('mouseup', function(e) {
        if (isDrawing) {
            isDrawing = false;
            if (currentShape) {
                transformer.nodes([currentShape]);
                stylePanel.style.display = 'block';
                saveShapes();
            }
        } else if (isSelecting) {
            isSelecting = false;
            var shapes = stage.find('Rect, Circle, Arrow, Text');
            var box = selectionRectangle.getClientRect();
            var selectedShapes = shapes.filter(function(shape) {
                return Konva.Util.haveIntersection(shape.getClientRect(), box);
            });
            transformer.nodes(selectedShapes);
            selectionRectangle.destroy();
            layer.batchDraw();
            stylePanel.style.display = selectedShapes.length > 0 ? 'block' : 'none';
        }
    });

    stage.on('click', function(e) {
        if (e.target === stage) {
            transformer.nodes([]);
            stylePanel.style.display = 'none';
            currentShape = null;
        } else {
            transformer.nodes([e.target]);
            currentShape = e.target;

            fillColorInput.value = currentShape.fill();
            strokeColorInput.value = currentShape.stroke();
            strokeWidthInput.value = currentShape.strokeWidth();
            stylePanel.style.display = 'block';
        }
        layer.draw();
    });

    applyStyleButton.onclick = function() {
        if (currentShape) {
            currentShape.fill(fillColorInput.value);
            currentShape.stroke(strokeColorInput.value);
            currentShape.strokeWidth(parseInt(strokeWidthInput.value, 10));
            layer.draw();
            saveShapes();
        }
    };

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            transformer.nodes().forEach(function(node) {
                node.destroy();
            });
            transformer.nodes([]);
            layer.draw();
            saveShapes();
        }
        if (e.key === 'Escape') {
            selectedShapeType = null;
            transformer.nodes([]);
            stylePanel.style.display = 'none';
            layer.draw();
        }
    });

    stage.on('wheel', function(e) {
        e.evt.preventDefault();
        var scaleBy = 1.1;
        var oldScale = stage.scaleX();

        var mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        var newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        stage.scale({ x: newScale, y: newScale });

        var newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        };

        stage.position(newPos);
        stage.batchDraw();
    });

    stage.on('dblclick', function(e) {
        if (e.target instanceof Konva.Text) {
            var textNode = e.target;
            var textPosition = textNode.getAbsolutePosition();
            var stageBox = stage.container().getBoundingClientRect();

            textInput.style.top = stageBox.top + textPosition.y + 'px';
            textInput.style.left = stageBox.left + textPosition.x + 'px';
            textInput.style.width = textNode.width() - textNode.padding() * 2 + 'px';
            textInput.style.display = 'block';
            textInput.value = textNode.text();
            textInput.focus();

            textInput.oninput = function() {
                textNode.text(textInput.value);
                layer.draw();
            };

            textInput.onblur = function() {
                textInput.style.display = 'none';
            };
        }
    });

    // Load existing shapes
    shapes.forEach(function(shape) {
        var konvaShape;
        switch (shape.type) {
            case 'rectangle':
                konvaShape = new Konva.Rect(shape);
                break;
            case 'circle':
                konvaShape = new Konva.Circle(shape);
                break;
            case 'arrow':
                konvaShape = new Konva.Arrow(shape);
                break;
            case 'text':
                konvaShape = new Konva.Text(shape);
                break;
        }
        if (konvaShape) {
            layer.add(konvaShape);
        }
    });
    layer.draw();
});

export class TextEditor {
    constructor(shape, layer) {
        this.shape = shape;
        this.layer = layer;
    }

    startEditing() {
        const textPosition = this.shape.getAbsolutePosition();
        const stageBox = this.shape.getStage().container().getBoundingClientRect();

        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
        };

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = this.shape.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = '200px';
        textarea.style.height = '30px';
        textarea.style.fontSize = '20px';
        textarea.style.border = '1px solid black';
        textarea.style.backgroundColor = 'rgba(200, 200, 200, 0.5)';
        textarea.style.padding = '4px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = '20px';
        textarea.style.fontFamily = 'Arial';
        textarea.style.color = 'black';
        textarea.style.whiteSpace = 'nowrap';

        textarea.focus();

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.shape.text(textarea.value);
                document.body.removeChild(textarea);
                this.layer.draw();
            }
        });

        textarea.addEventListener('blur', () => {
            this.shape.text(textarea.value);
            document.body.removeChild(textarea);
            this.layer.draw();
        });
    }
}

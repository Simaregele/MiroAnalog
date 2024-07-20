import json
import uuid
from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)
BOARD_FILE = 'boards.json'


# Загрузка состояния досок из JSON файла
def load_boards():
    try:
        with open(BOARD_FILE, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {}


# Сохранение состояния досок в JSON файл
def save_boards(boards):
    with open(BOARD_FILE, 'w') as file:
        json.dump(boards, file)


boards = load_boards()


@app.route('/')
def index():
    main_board_id = 'main'
    if main_board_id not in boards:
        boards[main_board_id] = {'shapes': []}
        save_boards(boards)
    return redirect(url_for('board', board_id=main_board_id))


@app.route('/board/<board_id>')
def board(board_id):
    if board_id not in boards:
        return "Board not found", 404
    return render_template('board.html', board_id=board_id, shapes=boards[board_id]['shapes'])


@app.route('/create_nested_board/<parent_board_id>')
def create_nested_board(parent_board_id):
    if parent_board_id not in boards:
        return "Parent board not found", 404

    new_board_id = str(uuid.uuid4())
    boards[new_board_id] = {
        'shapes': []
    }
    save_boards(boards)
    return jsonify(new_board_id=new_board_id)


@app.route('/save_shapes/<board_id>', methods=['POST'])
def save_shapes(board_id):
    if board_id not in boards:
        return "Board not found", 404
    boards[board_id]['shapes'] = request.json['shapes']
    save_boards(boards)
    return jsonify(success=True)


if __name__ == '__main__':
    app.run(debug=True)

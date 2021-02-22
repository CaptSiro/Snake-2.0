class Engine {
    remove(row, column) {
        game.canvas.querySelectorAll("div").forEach(el => {
            if (el.style.gridRowStart == row && el.style.gridColumnStart == column) {
                game.canvas.removeChild(el);
            }
        });
    }

    draw(row, column) {
        let piece = document.createElement("div");
        piece.style.gridRowStart = row;
        piece.style.gridColumnStart = column;
        if (this.snake) {
            piece.classList.add("snake");
        } else {
            piece.classList.add("fruit");
        }
        game.canvas.appendChild(piece);
    }
}









class Game extends Engine {
    #dimentions = {rows: 12, columns: 16};
    keystrokes = [];
    score = 0;
    highScore = JSON.parse(localStorage.getItem("highScore")) || {beginner: 0, normal: 0, hard: 0, expert: 0};
    difficulty = Number(JSON.parse(localStorage.getItem("difficulty"))) || 250;
    gameStarted = false;
    run;
    canvas = document.querySelector("div.canvas");
    spanScore = document.querySelector("span.score");
    lastScore = document.querySelector(".lastScore");

    start() {
        snake.body.forEach(el => {
            this.remove(el.row, el.column);
        });

        snake.resetSnake();
        fruit.resetFruit();
        this.spanScore.innerHTML = this.score;

        this.run = setInterval(() => {
            if (this.keystrokes.length != 0) {
                snake.setFacing(this.keystrokes.shift());
            }

            let lastSpot = Object.assign({}, snake.body[snake.body.length - 1]);

            switch (snake.getFacing()) {
                case 0:
                    snake.head.row--;
                    if (snake.head.row == 0) {
                        snake.head.row = this.#dimentions.rows;
                    }
                    break;
                case 1:
                    snake.head.column++;
                    if (snake.head.column > this.#dimentions.columns) {
                        snake.head.column = 1;
                    }
                    break;
                case 2:
                    snake.head.row++;
                    if (snake.head.row > this.#dimentions.rows) {
                        snake.head.row = 1;
                    }
                    break;
                case 3:
                    snake.head.column--;
                    if (snake.head.column == 0) {
                        snake.head.column = this.#dimentions.columns;
                    }
                    break; 
            }

            snake.body.unshift(Object.assign({}, snake.head));
            snake.body.forEach((el, i) => {
                if (i != 0) {
                    if (snake.head.row == el.row && snake.head.column == el.column) {
                        this.end();
                    }
                }
            });

            if (snake.head.row == fruit.getRow() && snake.head.column == fruit.getcolumn()) {
                fruit.spawned = false;
                this.score++;
                this.spanScore.innerHTML = this.score * 50;

                this.remove(fruit.getRow(), fruit.getcolumn());
                fruit.spawnNewFruit();
            } else {
                this.remove(lastSpot.row, lastSpot.column);
                snake.body.pop();
            }

            if (!fruit.spawned) {
                fruit.spawnNewFruit();
            }

            snake.body.forEach((el) => {
                snake.draw(el.row, el.column);
            });
        }, this.difficulty);
    }

    end() {
        clearInterval(this.run);
        game.gameStarted = false;
        menu.classList.remove("none");
        this.lastScore.innerHTML = "Score: " + (this.score * 50);
        this.lastScore.classList.remove("none");

        if (this.difficulty == 500 && this.score > this.highScore.beginner) {
            this.highScore.beginner = this.score;
        }

        if (this.difficulty == 250 && this.score > this.highScore.normal) {
            this.highScore.normal = this.score;
        }

        if (this.difficulty == 100 && this.score > this.highScore.hard) {
            this.highScore.hard = this.score;
        }

        if (this.difficulty == 60 && this.score > this.highScore.expert) {
            this.highScore.expert = this.score;
        }

        updateHSD();

        localStorage.setItem("highScore", JSON.stringify(this.highScore));
        console.log(localStorage.getItem("highScore"));

        this.score = 0;
    }
}








class Snake extends Engine {
    snake = true;
    #facing = 1;
    head = {row: 1, column: 1};
    body = [Object.assign({}, this.head)];

    setFacing(value) {
        if (value != this.#facing) {
            if (value >= 0 & value <= 3) {
                if (!(value - 2 == this.#facing || value + 2 == this.#facing)) {
                    this.#facing = value;
                }
            }
        }
    }

    getFacing() {
        return this.#facing;
    }

    resetSnake() {
        this.#facing = 1;
        this.head = {row: 1, column: 1};
        this.body = [Object.assign({}, this.head)];
        this.draw(1, 1);
    }
}








class Fruit extends Engine {
    #rowcolumn = {row: 0, column: 0};
    snake = false;
    spawned = false;

    getRow() {
        return this.#rowcolumn.row;
    }

    getcolumn() {
        return this.#rowcolumn.column;
    }

    spawnNewFruit() {
        let posHolder = {};
        let onSnake;

        do {
            onSnake = false;

            posHolder.row = Math.floor((Math.random() * 12) + 1);
            posHolder.column = Math.floor((Math.random() * 16) + 1);

            snake.body.forEach(el => {
                if (el.row == posHolder.row && el.column == posHolder.column) {
                    onSnake = true;
                }
            });
        } while (onSnake == true);

        this.#rowcolumn = Object.assign({}, posHolder);

        this.draw(this.#rowcolumn.row, this.#rowcolumn.column);

        this.spawned = true;
    }

    resetFruit() {
        this.remove(this.#rowcolumn.row, this.#rowcolumn.column);
        this.#rowcolumn = {row: 0, column: 0};
        this.spawned = false;
        this.spawnNewFruit();
    }
}








function changeDiff(value) {
    switch (value) {
        case 500:
            difficulty.innerHTML = "Beginner";
            break;
    
        case 250:
            difficulty.innerHTML = "Normal";
            break;
    
        case 100:
            difficulty.innerHTML = "Hard";
            break;
    
        case 60:
            difficulty.innerHTML = "Expert";
            break;
    }
}

function toggleNone() {
    game.lastScore.classList.toggle("none");
    startButton.classList.toggle("none");
    diffButton.classList.toggle("none");
    difficulties.forEach((el) => {
        el.classList.toggle("none");
    });
}

function updateHSD() {
    highScoreDiv.innerHTML = `<p>Beginner: ${game.highScore.beginner * 50}</p>
    <p>Normal: ${game.highScore.normal * 50}</p>
    <p>Hard: ${game.highScore.hard * 50}</p>
    <p>Expert: ${game.highScore.expert * 50}</p>`;
}

let game = new Game();
let snake = new Snake();
let fruit = new Fruit();
let startButton = document.querySelector("button.start");
let difficulty = document.querySelector("span.difficultyText");
let diffButton = document.querySelector(".difficulty");
let menu = document.querySelector("menu");
let highScoreDiv = document.querySelector(".highScoresDiv");
let difficulties = [document.querySelector(".beginner"), document.querySelector(".normal"), document.querySelector(".hard"), document.querySelector(".expert"), document.querySelector(".back")];

changeDiff(game.difficulty);
updateHSD();

window.addEventListener("keydown", evt => {
    if (evt.key == "ArrowUp" || evt.key == "W" || evt.key == "w") {
        game.keystrokes.push(0);
    }
    if (evt.key == "ArrowRight" || evt.key == "D" || evt.key == "d") {
        game.keystrokes.push(1);
    }
    if (evt.key == "ArrowDown" || evt.key == "S" || evt.key == "s") {
        game.keystrokes.push(2);
    }
    if (evt.key == "ArrowLeft" || evt.key == "A" || evt.key == "a") {
        game.keystrokes.push(3);
    }
});

startButton.addEventListener("click", () => {
    if (!game.gameStarted) {
        game.gameStarted = true;
        menu.classList.add("none");
        game.start();
    }
});

diffButton.addEventListener("click", toggleNone);

difficulties.forEach((el, i) => {
    if (i == 4) {
        el.addEventListener("click", toggleNone);
    } else {
        el.addEventListener("click", () => {
            localStorage.setItem("difficulty", JSON.stringify(el.value));
            game.difficulty = el.value;
            changeDiff(Number(el.value));
        });
    }
});
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};
let score = 0;
let highscore = 0;
let isPlaying = true;
let scoreInterval;
let wind = 0;

const player = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    onGround: false,
    
    initX: 380,
    initY: 470,
    width: 30,
    height: 30,
    moveSpeed: 5,
    gravity: -1,
    jumpForce: 15,
    
    init() {
        this.x = this.initX;
        this.y = this.initY;
        this.dx = 0;
        this.dy = 0;
    },
    
    update() {
        this.dx = wind;
        this.dy += this.gravity;
        
        // 키보드 입력
        if (keys.ArrowRight || keys.KeyD) {
            this.dx += this.moveSpeed;
        }
        if (keys.ArrowLeft || keys.KeyA) {
            this.dx -= this.moveSpeed;
        }
        if ((keys.Space || keys.ArrowUp || keys.KeyW) && this.onGround) {
            this.dy = this.jumpForce;
        }
        
        // 물리 처리
        this.x += this.dx;
        this.y -= this.dy;
        
        // 바닥 감지
        if (collideWith(this, platform)) {
            this.y = platform.y - this.height;
            this.dy = 0;
            this.onGround = true;
            this.moreJump = 2;
        } else {
            this.onGround = false;
        }
        
        // 게임오버
        if (this.y > canvas.height || enemys.filter(enemy => collideWith(this, enemy)).length > 0) {
            gameOver();
        }
    },
    
    draw() {
        ctx.fillStyle = "lime";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
};

const platform = {
    x: 100,
    y: 500,
    width: 600,
    height: 20,
    
    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 1;
    }
    
    calculateDirection() {
        let x = player.x - this.x;
        let y = player.y - this.y;
        const length = Math.sqrt(x*x + y*y);
        x = x / length * this.speed;
        y = y / length * this.speed;
        this.direction = { x, y };
    }
    
    update() {
        this.x += this.direction.x;
        this.y += this.direction.y;
        
        if (this.x < 0 || this.x > canvas.width - this.width) {
            this.direction.x *= -1;
        }
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.direction.y *= -1;
        }
    }
    
    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Text {
    constructor(text, x, y, size, color, font, align) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.font = font;
        this.align = align;
    }
    
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px ${this.font}`;
        ctx.textAlign = this.align;
        ctx.fillText(this.text, this.x, this.y);
        ctx.closePath();
    }
}

const scoreText = new Text("Score - 0", 70, 100, 30, "white", "Galmuri7", "left");
const highscoreText = new Text("Highscore - 0", 70, 150, 30, "white", "Galmuri7", "left");
const gameOverText = new Text("Game Over", 400, 300, 50, "#ffffff00", "Galmuri7", "center");
const restartText = new Text("Click to Restart", 400, 350, 30, "#ffffff00", "Galmuri7", "center");

const drawable = [player, platform];
const ui = [scoreText, highscoreText, gameOverText, restartText]
const enemys = [];

start();


function start() {
    canvas.onclick = onClickCanvas;
    
    if (localStorage.getItem("highscore")) {
        setHighscore(localStorage.getItem("highscore"));
    }
    
    document.addEventListener("keydown", function (event) {
        keys[event.code] = true;
    });
    document.addEventListener("keyup", function (event) {
        keys[event.code] = false;
    });
    
    init();
    
    getJSON("https://api.openweathermap.org/data/2.5/weather?q=seoul&appid=f19be282bbe4297868c0f1088f7477cd&units=metric", function (err, data) {
        if (err !== null) {
            console.log('Something went wrong: ' + err);
        } else {
            console.log(data.wind);
            wind = data.wind.speed * Math.cos(data.wind.deg * Math.PI / 180);
            console.log(wind);
        }
    });
    
    requestAnimationFrame(update);
}

function init() {
    score = 0;
    enemys.length = 0;
    player.init();
    gameOverText.color = "#ffffff00";
    restartText.color = "#ffffff00";
    
    scoreInterval = setInterval(() => score++, 20);
    enemyInterval = setInterval(spawnEnemy, 1000);
    
    isPlaying = true;
}

function getJSON(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        const status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

function update() {
    requestAnimationFrame(update);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (isPlaying) {
        player.update();
        enemys.forEach(enemy => enemy.update());
        scoreText.text = `Score - ${score}`;
        if (score > highscore) {
            setHighscore(score);
        }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawable.forEach(obj => obj.draw());
    enemys.forEach(enemy => enemy.draw());
    ui.forEach(obj => obj.draw());
}
 
function spawnEnemy() {
    const enemy = new Enemy(0, 0);
    const rand = Math.floor(Math.random() * 4);
    switch (rand) {
        case 0: // 상
            enemy.x = Math.random() * (canvas.width - enemy.width);
            enemy.y = 0;
            break;
        case 1: // 하
            enemy.x = Math.random() * (canvas.width - enemy.width);
            enemy.y = canvas.height - enemy.height;
            break;
        case 2: // 좌
            enemy.x = 0;
            enemy.y = Math.random() * (canvas.height - enemy.height);
            break;
        case 3: // 우
            enemy.x = canvas.width - enemy.width;
            enemy.y = Math.random() * (canvas.height - enemy.height);
            break;
    }
    enemy.calculateDirection();
    enemys.push(enemy);
}

function onClickCanvas(event) {
    // 게임 오버 상태에서 화면을 클릭하면 다시 시작
    if (!isPlaying) {
        init();
    }
}

function setHighscore(_score) {
    highscore = _score;
    highscoreText.text = `Highscore - ${highscore}`;
}

function collideWith(obj1, obj2) {
    return obj1.x + obj1.width > obj2.x &&
        obj1.x < obj2.x + obj2.width &&
        obj1.y + obj1.height > obj2.y &&
        obj1.y < obj2.y + obj2.height;
}

function gameOver() {
    isPlaying = false;
    
    clearInterval(scoreInterval);
    clearInterval(enemyInterval);
    
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore);
    }
    gameOverText.color = "white";
    restartText.color = "white";
}

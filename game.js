const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

if (window.innerHeight * 1.5 > window.innerWidth) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth / 1.5;
} else {
    canvas.width = window.innerHeight * 1.5;
    canvas.height = window.innerHeight;
}

const keys = {};
let score = 0;
let highscore = 0;
let isPlaying = true;
let wind = 0;
let weather = "";
let windCoeff = canvas.height * 0.001;
let region = "Seoul";

const player = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    onGround: false,
    
    width: canvas.height * 0.05,
    height: canvas.height * 0.05,
    color: "lime",
    initX: (canvas.width - canvas.height * 0.05) * 0.5,
    initY: canvas.height * 0.55,
    moveSpeed: canvas.height * 0.008,
    gravity: -canvas.height * 0.001,
    jumpForce: canvas.height * 0.02,
    
    init() {
        this.x = this.initX;
        this.y = this.initY;
        this.dx = 0;
        this.dy = 0;
        this.color = "lime";
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
        } else {
            this.onGround = false;
        }
        
        // 게임오버
        if (this.y > canvas.height || enemys.filter(enemy => collideWith(this, enemy)).length > 0) {
            gameOver();
        }
    },
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
};

const platform = {
    x: canvas.width * 0.1,
    y: canvas.height * 0.6,
    width: canvas.width * 0.8,
    height: canvas.height * 0.03,
    
    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = canvas.height * 0.03;
        this.height = canvas.height * 0.03;
        this.speed = canvas.height * 0.005;
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

class Weather {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }
    
    update() {
        this.x += wind;
        this.y += this.speed;
    }
    
    draw() {
        if (weather == "Snow") {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(this.x, this.y, canvas.height * 0.003, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        } else {
            ctx.strokeStyle = "skyblue";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + wind, this.y + canvas.height * 0.017);
            ctx.stroke();
            ctx.closePath();
        }
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

const scoreText = new Text("Score - 0", canvas.height * 0.07, canvas.height * 0.12, canvas.height * 0.04, "white", "Galmuri7", "left");
const highscoreText = new Text("Highscore - 0", canvas.height * 0.07, canvas.height * 0.2, canvas.height * 0.04, "white", "Galmuri7", "left");
const gameOverText = new Text("Game Over", canvas.width * 0.5, canvas.height * 0.5, canvas.height * 0.08, "#ffffff00", "Galmuri7", "center");
const restartText = new Text("Click to Restart", canvas.width * 0.5, canvas.height * 0.58, canvas.height * 0.05, "#ffffff00", "Galmuri7", "center");
const windText = new Text(`${region}       - 0.0 -`, canvas.width * 0.96, canvas.height * 0.95, canvas.height * 0.04, "white", "Galmuri7", "right");
const changeWeatherKeyText = new Text("Press P key to change region", canvas.height * 0.07, canvas.height * 0.94, canvas.height * 0.03, "white", "Galmuri7", "left");

const drawable = [player, platform];
const ui = [scoreText, highscoreText, gameOverText, restartText, windText, changeWeatherKeyText];
const enemys = [];
const particles = [];

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
    
    requestAnimationFrame(update);
}

function init() {
    score = 0;
    enemys.length = 0;
    player.init();
    gameOverText.color = "#ffffff00";
    restartText.color = "#ffffff00";
    
    scoreInterval = setInterval(() => score++, 20);
    enemyInterval = setInterval(spawnEnemy, 3000);
    setInterval(makeWeatherParticle, 30);
    
    getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${region}&appid=f19be282bbe4297868c0f1088f7477cd&units=metric`, function (err, data) {
        if (err !== null) {
            console.log('Something went wrong: ' + err);
        } else {
            // 풍속
            console.log(data.wind);
            wind = data.wind.speed * Math.cos(data.wind.deg * Math.PI / 180) * windCoeff;
            console.log(wind);
            if (wind > 0) {
                windText.text = `${region}       ${wind.toFixed(1)} ->`;
            } else if (wind < 0) {
                windText.text = `${region}       <- ${Math.abs(wind.toFixed(1))}`;
            } else {
                windText.text = `${region}       - 0.0 -`;
            }
            
            // 날씨
            weather = data.weather[0].main;
            console.log(weather);
        }
    });
    
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
    
    if (keys.KeyP) {
        region = prompt("지역을 입력하세요. (다음 게임부터 적용됩니다!)\nex) Japan, London, Paris, America, ...", region);
        keys.KeyP = false;
    }
    
    // update
    enemys.forEach(enemy => enemy.update());
    particles.forEach(particle => {
        particle.update();
        if (particle.y > canvas.height) {
            particles.splice(particles.indexOf(particle), 1);
        }
    });
    if (isPlaying) {
        player.update();
        scoreText.text = `Score - ${score}`;
        if (score > highscore) {
            setHighscore(score);
        }
    }
    
    // draw
    ctx.fillStyle = "#123456";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawable.forEach(obj => obj.draw());
    particles.forEach(particle => particle.draw());
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

function makeWeatherParticle() {
    const weatherParticle = new Weather(Math.random() * canvas.width * 2 - canvas.width * 0.5, 0, Math.random() + canvas.height * 0.01);
    particles.push(weatherParticle);
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
    player.color = "#00ff0000"
    gameOverText.color = "white";
    restartText.color = "white";
}

// --- CapyDino Game Final Corrigido com Sprite de Morte --- //

let board;
let boardWidth;
let boardHeight;
let context;

// 🦖 dino
const dinoWidth = 88;
const dinoHeight = 94;
const dinoX = 50;
let dinoY;
let dinoImg;
let dinoDeadImg;

let dinoLoaded = false;
let dinoDeadLoaded = false;
let isDead = false;

let dino = {
    x: dinoX,
    y: 0,
    width: dinoWidth,
    height: dinoHeight
};

// 🌵 cactus
let cactusArray = [];
const cactus1Width = 34;
const cactus2Width = 69;
const cactus3Width = 102;
const cactusHeight = 70;
const cactusX = 700;

let cactus1Img;
let cactus2Img;
let cactus3Img;
let cactus1Loaded = false;
let cactus2Loaded = false;
let cactus3Loaded = false;

// ⚙️ physics
let velocityX = -8;
let velocityY = 0;
const gravity = 0.4;

let gameOver = false;
let score = 0;

let cactusInterval = null;
let dinoAnimationId = null;

function startDino() {
    if (window.stopFlappy) window.stopFlappy();
    if (window.stopSnake) window.stopSnake();
    if (window.stopDino) window.stopDino();

    board = document.getElementById("dino");
    if (!board) {
        console.error("Canvas do Dino não encontrado (id='dino').");
        return;
    }

    boardWidth = board.width;
    boardHeight = board.height;
    context = board.getContext("2d");
    board.style.display = "block";

    cactusArray = [];
    gameOver = false;
    isDead = false;
    score = 0;
    velocityY = 0;
    velocityX = -8;

    dinoY = boardHeight - dinoHeight;
    dino.y = dinoY;

    // 🖼️ carrega imagens
    dinoImg = new Image();
    dinoImg.onload = () => dinoLoaded = true;
    dinoImg.onerror = () => dinoLoaded = false;
    dinoImg.src = "./img/dino.png";

    dinoDeadImg = new Image();
    dinoDeadImg.onload = () => dinoDeadLoaded = true;
    dinoDeadImg.onerror = () => dinoDeadLoaded = false;
    dinoDeadImg.src = "./img/dino-dead.png";

    cactus1Img = new Image();
    cactus1Img.onload = () => cactus1Loaded = true;
    cactus1Img.src = "./img/cactus1.png";

    cactus2Img = new Image();
    cactus2Img.onload = () => cactus2Loaded = true;
    cactus2Img.src = "./img/cactus2.png";

    cactus3Img = new Image();
    cactus3Img.onload = () => cactus3Loaded = true;
    cactus3Img.src = "./img/cactus3.png";

    document.removeEventListener("keydown", moveDino);
    document.addEventListener("keydown", moveDino);

    if (dinoAnimationId) cancelAnimationFrame(dinoAnimationId);
    update();

    if (cactusInterval) clearInterval(cactusInterval);
    cactusInterval = setInterval(placeCactus, 1000);
}

function stopDino() {
    gameOver = true;
    if (cactusInterval) {
        clearInterval(cactusInterval);
        cactusInterval = null;
    }
    if (dinoAnimationId) {
        cancelAnimationFrame(dinoAnimationId);
        dinoAnimationId = null;
    }
    document.removeEventListener("keydown", moveDino);

    const tela = document.getElementById("dino");
    if (tela) tela.style.display = "none";
}

function update() {
    dinoAnimationId = requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    // 🩵 fundo
    const sky = context.createLinearGradient(0, 0, 0, boardHeight);
    sky.addColorStop(0, '#c2dddfff');
    sky.addColorStop(1, '#c2dddfff');
    context.fillStyle = sky;
    context.fillRect(0, 0, boardWidth, boardHeight);


    
    
    
    const groundH = 40;
    context.fillStyle = '#ebebebff';
    context.fillRect(0, boardHeight - groundH, boardWidth, groundH);
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.strokeRect(1, 1, boardWidth - 2, boardHeight - 2);

    // ⚙️ física
    if (!isDead) {
        velocityY += gravity;
        dino.y = Math.min(dino.y + velocityY, dinoY);
    }

    // 🦖 desenha dino
    if (isDead) {
        if (dinoDeadLoaded) {
            context.drawImage(dinoDeadImg, dino.x, dino.y, dino.width, dino.height);
        } else {
            drawDinoFallback(dino.x, dino.y, dino.width, dino.height);
            context.fillStyle = 'black';
            context.font = "18px courier";
            context.fillText("✖", dino.x + dino.width * 0.75, dino.y + dino.height * 0.15);
        }
    } else {
        if (dinoLoaded) {
            context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        } else {
            drawDinoFallback(dino.x, dino.y, dino.width, dino.height);
        }
    }

    // 🌵 desenha cactos
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;

        const img = cactus.img;
        if (img && img.complete && img.naturalWidth > 0) {
            context.drawImage(img, cactus.x, cactus.y, cactus.width, cactus.height);
        } else {
            drawCactusFallback(cactus.x, boardHeight - cactus.height, cactus.width, cactus.height);
            cactus.y = boardHeight - cactus.height;
        }

        if (detectCollision(dino, cactus) && !isDead) {
            isDead = true;
            gameOver = true;
            velocityX = 0;
            if (cactusInterval) { clearInterval(cactusInterval); cactusInterval = null; }
            document.removeEventListener("keydown", moveDino);
        }
    }

    // pontuação
    context.fillStyle = "black";
    context.font = "25px courier";
    if (!isDead) score++;
    context.fillText(score, 5, 20);

    // mostra "Game Over"
    if (isDead) {
        context.fillStyle = "red";
        context.font = "bold 32px courier";
        context.fillText("GAME OVER", boardWidth / 2 - 100, boardHeight / 2);
    }

    // interrompe após o frame final
    if (gameOver) {
        if (dinoAnimationId) {
            cancelAnimationFrame(dinoAnimationId);
            dinoAnimationId = null;
        }
        return;
    }
}

// ☁️ nuvens
function drawCloud(x, y, r) {
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.arc(x + r, y + 5, r * 0.8, 0, Math.PI * 2);
    context.arc(x - r * 0.6, y + 5, r * 0.9, 0, Math.PI * 2);
    context.fill();
}

// fallback do dino
function drawDinoFallback(x, y, w, h) {
    context.fillStyle = '#7b3f24';
    context.fillRect(x, y + h * 0.15, w * 0.9, h * 0.7);
    context.fillRect(x + w * 0.65, y, w * 0.35, h * 0.5);
    context.fillStyle = '#000';
    context.fillRect(x + w * 0.85, y + h * 0.12, w * 0.06, h * 0.06);
    context.fillStyle = '#4a2a18';
    context.fillRect(x + w * 0.15, y + h * 0.8, w * 0.15, h * 0.2);
    context.fillRect(x + w * 0.55, y + h * 0.8, w * 0.15, h * 0.2);
    const tailColors = ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#0000ff'];
    for (let i = 0; i < tailColors.length; i++) {
        context.fillStyle = tailColors[i];
        context.fillRect(x - (i + 1) * 6, y + h * 0.5 + i * 3, 6, 6);
    }
}

// fallback do cactus
function drawCactusFallback(x, y, w, h) {
    context.fillStyle = '#2e8b57';
    context.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.8);
    context.fillRect(x, y + h * 0.4, w * 0.3, h * 0.15);
    context.fillRect(x + w * 0.7, y + h * 0.35, w * 0.3, h * 0.15);
    context.fillStyle = '#1f5e3b';
    for (let i = 0; i < 5; i++) {
        context.fillRect(x + i * (w / 5), y + h * 0.15, 2, 6);
    }
}

function moveDino(e) {
    if (gameOver || isDead) return;
    if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY) {
        velocityY = -10;
    }
}

function placeCactus() {
    if (gameOver || isDead) return;

    const cactus = {
        img: null,
        x: cactusX,
        y: boardHeight - cactusHeight,
        width: null,
        height: cactusHeight
    };

    const rand = Math.random();
    if (rand > 0.9) {
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
    } else if (rand > 0.7) {
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
    } else if (rand > 0.5) {
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
    } else return;

    cactusArray.push(cactus);
    if (cactusArray.length > 5) cactusArray.shift();
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

window.startDino = startDino;
window.stopDino = stopDino;

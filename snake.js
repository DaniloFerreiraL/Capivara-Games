class Snake{
    constructor(x, y, size){
        this.x = x
        this.y = y
        this.size = size
        this.tail = [{x:this.x, y:this.y}]
        // iniciar movendo para a direita por padrão
        this.rotateX = 1
        this.rotateY = 0
    }

    // Substitui move anterior por versão simples e confiável
    move(){
        const head = this.tail[this.tail.length - 1];
        // calcula nova cabeça usando direção atual
        const newHead = {
            x: head.x + (this.rotateX * this.size),
            y: head.y + (this.rotateY * this.size)
        };
        // adiciona nova cabeça e remove o primeiro segmento (comportamento clássico)
        this.tail.push(newHead);
        this.tail.shift();

        // debug opcional (remova depois)
        // console.log('Snake.move -> head now:', newHead, 'dir:', this.rotateX, this.rotateY);
    }
}



class Apple{
    constructor(){
        console.log("apple")
        console.log(snake.size)
        var isTouching;
        while(true){
            isTouching = false;
            this.x = Math.floor(Math.random() * canvas.width / snake.size) * snake.size
            this.y = Math.floor(Math.random() * canvas.height / snake.size) * snake.size
            for(var i = 0; i < snake.tail.length;i++){
                if(this.x == snake.tail[i].x && this.y == snake.tail[i].y){
                    isTouching = true
                }
            }
            console.log(this.x, this.y)
            this.size = snake.size
            this.color = "red"
            if(!isTouching){
                break;
            }
        }
    }
}

// --- novo: mapa de pixels da capivara (6x6 exemplo) ---
const CAPYBARA_MAP = [
    "..aa......aa..",
    ".abbaaaaaabba.",
    ".abcaaaaaacba.",
    "..abbbbbbbba..",
    "..abbbbbbbba..",
    ".abddbbbbddba.",
    ".abbbbbbbbbba.",
    "abbbbccccbbbba",
    "abbbccccccbbba",
    "abbbccccccbbba",
    "abbbccccccbbba",
    ".abbccccccbba.",
    "..aabbbbbbaa..",
    "....aaaaaa...."
];
// legenda: '.' = transparente, 'b' = marrom, 'e' = olho
const CAPY_COLORS = {
    ".": null,
    "a": "#3b2117",
    "b": "#9c5a3c",
    "c": "#633826",
    "d": "#000000"
};

function drawCapybara(x, y, segSize){
    const map = CAPYBARA_MAP;
    const rows = map.length;
    const cols = map[0].length;
    // tamanho de cada "pixel" da capivara dentro do segmento
    const px = Math.max(1, Math.floor(segSize / cols));
    // centralizar a capivara dentro do segmento
    const totalW = px * cols;
    const totalH = px * rows;
    const offsetX = x + Math.floor((segSize - totalW) / 2);
    const offsetY = y + Math.floor((segSize - totalH) / 2);

    for(let ry = 0; ry < rows; ry++){
        for(let rx = 0; rx < cols; rx++){
            const ch = map[ry][rx];
            const color = CAPY_COLORS[ch];
            if(!color) continue;
            createRect(offsetX + rx * px, offsetY + ry * px, px, px, color);
        }
    }
}

var canvas = document.getElementById("canvas")
var canvasContext = canvas.getContext('2d')

// opção 2: escala tudo com SEG_SIZE
const SEG_SIZE = 40 // ajuste aqui para deixar tudo maior/menor

// --- não crie a snake/maçã aqui; crie somente ao iniciar ---
var snake = null
var apple = null
var gameIntervalId = null

// Start simples e único (cria snake, expõe em window e inicia loop)
window.startGame = function(){
    if (snake) return;               // já iniciado
    if (window.stopFlappy) window.stopFlappy();

    console.log("startGame: criando snake");
    var startX = Math.floor((canvas.width / 2) / SEG_SIZE) * SEG_SIZE;
    var startY = Math.floor((canvas.height / 2) / SEG_SIZE) * SEG_SIZE;
    snake = new Snake(startX, startY, SEG_SIZE);
    window.snake = snake;            // garante acesso global
    apple = new Apple();

    const cvs = document.getElementById('canvas');
    if (cvs) { cvs.style.display = 'block'; cvs.focus(); }

    gameLoop();
    console.log("startGame: snake criada", snake);
}

// controle de velocidade (ms entre passos da cobrinha)
const MOVE_INTERVAL = 180 // aumentar = mais lento, diminuir = mais rápido
let lastMoveTimestamp = 0
let animationId = null

// a lógica de atualização NÃO deve limpar o canvas — apenas atualiza estado
function updateLogic(){
    if(!snake) return
    snake.move()
    eatApple()
    checkHitWall()
}

// desenho separado (limpa e desenha)
function draw(){
    if(!snake) return
    // limpa e desenha tudo
    createRect(0,0,canvas.width, canvas.height, "#b1e2eb")
    for(var i = 0; i < snake.tail.length; i++){
        drawCapybara(snake.tail[i].x, snake.tail[i].y, snake.size)
    }
    canvasContext.font = "20px Arial"
    canvasContext.fillStyle = "#000000ff"
    canvasContext.fillText("Score: " + (snake.tail.length - 1), canvas.width -120, 18)
    if(apple) createRect(apple.x, apple.y, apple.size, apple.size, apple.color)
}

// loop que controla movimento por tempo e desenho por frame
function loop(timestamp){
    if(!lastMoveTimestamp) lastMoveTimestamp = timestamp
    const elapsed = timestamp - lastMoveTimestamp

    if(elapsed >= MOVE_INTERVAL){
        updateLogic()
        lastMoveTimestamp = timestamp
    }

    draw()
    animationId = requestAnimationFrame(loop)
}

function gameLoop(){
    if(animationId) return
    lastMoveTimestamp = 0
    animationId = requestAnimationFrame(loop)
}

window.stopSnake = function(){
    if(animationId){ cancelAnimationFrame(animationId); animationId = null }
    snake = null
    apple = null
    const cvs = document.getElementById('canvas'); if(cvs) cvs.style.display = 'none'
    const startBtn = document.getElementById('startSnakeBtn'); if(startBtn) { startBtn.style.display = 'inline-block'; startBtn.disabled = false }
    const otherBtn = document.getElementById('startFlappyBtn'); if(otherBtn) otherBtn.disabled = false
}

function checkHitWall(){
    var headTail = snake.tail[snake.tail.length -1]
    // Parede esquerda
    if(headTail.x < 0){
        headTail.x = canvas.width - snake.size
    }
    // Parede direita
    else if(headTail.x >= canvas.width){
        headTail.x = 0
    }
    // Parede superior
    if(headTail.y < 0){
        headTail.y = canvas.height - snake.size
    }
    // Parede inferior
    else if(headTail.y >= canvas.height){
        headTail.y = 0
    }
}

function eatApple(){
    if(snake.tail[snake.tail.length - 1].x == apple.x && snake.tail[snake.tail.length - 1].y == apple.y){
        snake.tail[snake.tail.length] = {x:apple.x, y:apple.y}
        apple = new Apple();
    }
}

function createRect(x,y,width, height, color){
    canvasContext.fillStyle = color
    canvasContext.fillRect(x,y,width,height)
}

// debug: mostra erros não capturados no console
window.addEventListener('error', e => {
    console.error('JS ERROR:', e.message, 'at', e.filename + ':' + e.lineno + ':' + e.colno);
});
window.addEventListener('unhandledrejection', e => {
    console.error('UnhandledRejection:', e.reason);
});

// botão Start do Snake (garante que exista e chama window.startGame)
const startSnakeBtn = document.getElementById('startSnakeBtn');
if (startSnakeBtn) {
    startSnakeBtn.addEventListener('click', function () {
        this.style.display = 'none';
        const other = document.getElementById('startFlappyBtn');
        if (other) other.disabled = true;
        const cvs = document.getElementById('canvas');
        if (cvs) cvs.style.display = 'block';
        console.log('Start button clicked: calling startGame()');
        if (typeof window.startGame === 'function') {
            window.startGame();
        } else {
            console.error('startGame() não encontrada. Verifique se window.startGame está definida.');
        }
    });
} else {
    console.warn('startSnakeBtn não encontrado no DOM.');
}

// Verifique por typos comuns: replace "rotatey" -> "rotateY" e "rotatex" -> "rotateX"
console.log('Dica: pesquise por "rotatey" e "rotatex" no arquivo e corrija para "rotateY"/"rotateX" se existirem.');

(function(){
    console.log('snake.js: carregando...');
    window.addEventListener('error', e => {
        console.error('Erro global capturado em snake.js:', e.message, 'em', e.filename+':'+e.lineno+':'+e.colno);
    });
    window.addEventListener('unhandledrejection', e => {
        console.error('UnhandledRejection em snake.js:', e.reason);
    });
})();

// controla direção sem permitir reversão 180°
function setDirection(nx, ny){
    if(!snake) return;
    // não permitir virar 180°
    if(snake.rotateX === -nx && snake.rotateY === -ny) return;
    snake.rotateX = nx;
    snake.rotateY = ny;
}

// listener de teclado (setas e WASD)
window.addEventListener('keydown', function(e){
    if(!snake) return;
    const k = e.keyCode || e.which;
    // prevenir scroll com as setas/WASD
    if([37,38,39,40,65,68,83,87].includes(k)) e.preventDefault();

    switch(k){
        case 37: // ←
        case 65: // A
            setDirection(-1, 0);
            break;
        case 39: // →
        case 68: // D
            setDirection(1, 0);
            break;
        case 38: // ↑
        case 87: // W
            setDirection(0, -1);
            break;
        case 40: // ↓
        case 83: // S
            setDirection(0, 1);
            break;
    }
});
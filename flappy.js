(function(){
    'use strict';

    // --- BOARD ---
    let board;
    const boardWidth = 360;
    const boardHeight = 640;
    let context = null;

    // --- BIRD ---
    const birdWidth = 34;
    const birdHeight = 24;
    const birdX = boardWidth / 8;
    const birdY = boardHeight / 2;
    let birdImg;

    let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

    // --- PIPES ---
    let pipeArray = [];
    const pipeWidth = 64;
    const pipeHeight = 512;
    const pipeX = boardWidth;
    const pipeY = 0;

    let topPipeImg;
    let bottomPipeImg;

    // --- PHYSICS ---
    const velocityX = -2;
    let velocityY = 0;
    const gravity = 0.4;

    let gameOver = false;
    let score = 0;

    // --- CONTROLE ---
    let restartDelayMs = 1000;
    let lastGameOverAt = 0;
    let flappyAnimationId = null;
    let flappyPipeIntervalId = null;
    let flappyStarted = false;

    // --- LOOP PRINCIPAL ---
    function startLoop() {
        if (flappyAnimationId) return;
        function loop() {
            if (gameOver) {
                cancelAnimationFrame(flappyAnimationId);
                flappyAnimationId = null;
                return;
            }
            update();
            flappyAnimationId = requestAnimationFrame(loop);
        }
        flappyAnimationId = requestAnimationFrame(loop);
    }

    // --- INICIAR FLAPPY ---
    function startFlappy() {
        if (flappyStarted) return;

        // 🔥 Para o Snake se estiver rodando
        if (window.stopSnake) window.stopSnake();

        // 🔥 Esconde e limpa o Pacman imediatamente
        const pacmanFrame = document.getElementById('pacmanFrame');
        if (pacmanFrame) {
            pacmanFrame.style.display = 'none';
            pacmanFrame.removeAttribute('src');
            // Garante que o iframe não empurre nada
            pacmanFrame.style.position = 'absolute';
            pacmanFrame.style.top = '-9999px';
        }

        flappyStarted = true;
        gameOver = false;
        score = 0;
        pipeArray = [];

        board = document.getElementById('board');
        if (!board) {
            console.error('canvas #board não encontrado');
            return;
        }

        board.width = boardWidth;
        board.height = boardHeight;
        board.style.display = 'block';
        context = board.getContext('2d');

        // Carrega as imagens
        birdImg = new Image(); birdImg.src = './flappybird.png';
        topPipeImg = new Image(); topPipeImg.src = './toppipe.png';
        bottomPipeImg = new Image(); bottomPipeImg.src = './bottompipe.png';

        startLoop();

        if (flappyPipeIntervalId) clearInterval(flappyPipeIntervalId);
        flappyPipeIntervalId = setInterval(placePipes, 1500);

        document.addEventListener('keydown', moveBird);
    }

    // --- PARAR FLAPPY ---
    function stopFlappy() {
        flappyStarted = false;
        gameOver = true;

        if (flappyAnimationId) {
            cancelAnimationFrame(flappyAnimationId);
            flappyAnimationId = null;
        }
        if (flappyPipeIntervalId) {
            clearInterval(flappyPipeIntervalId);
            flappyPipeIntervalId = null;
        }

        document.removeEventListener('keydown', moveBird);

        const boardEl = document.getElementById('board');
        if (boardEl) {
            boardEl.style.display = 'none';
            const ctx = boardEl.getContext('2d');
            ctx.clearRect(0, 0, boardEl.width, boardEl.height);
        }
    }

    // --- UPDATE (LOOP PRINCIPAL) ---
    function update() {
        if (!context) return;
        context.clearRect(0, 0, board.width, board.height);

        if (gameOver) return;

        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0);
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        if (bird.y > board.height) {
            gameOver = true;
            lastGameOverAt = performance.now();
        }

        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
                lastGameOverAt = performance.now();
            }
        }

        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift();
        }

        context.fillStyle = 'white';
        context.font = '45px sans-serif';
        context.fillText(Math.floor(score), 5, 45);

        if (gameOver) {
            context.fillText('GAME OVER', 5, 90);
        }
    }

    // --- GERAR CANOS ---
    function placePipes() {
        if (gameOver) return;

        let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
        let openingSpace = board.height / 4;

        let topPipe = {
            img: topPipeImg,
            x: pipeX,
            y: randomPipeY,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        };

        pipeArray.push(topPipe);

        let bottomPipe = {
            img: bottomPipeImg,
            x: pipeX,
            y: randomPipeY + pipeHeight + openingSpace,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        };

        pipeArray.push(bottomPipe);
    }

    // --- MOVIMENTO DO PÁSSARO ---
    function moveBird(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyX') {
            velocityY = -6;

            if (gameOver) {
                const now = performance.now();
                if (now - lastGameOverAt < restartDelayMs) return;
                bird.y = birdY;
                bird.x = birdX;
                velocityY = 0;
                pipeArray = [];
                score = 0;
                gameOver = false;
                startLoop();
                if (!flappyPipeIntervalId) flappyPipeIntervalId = setInterval(placePipes, 1500);
            }
        }
    }

    // --- COLISÃO ---
    function detectCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // --- EXPORTA FUNÇÕES ---
    window.startFlappy = startFlappy;
    window.stopFlappy = stopFlappy;

})();

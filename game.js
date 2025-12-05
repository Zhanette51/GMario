// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 50,
        startY: 250,
        width: 32,
        height: 48,
        speed: 5,
        jumpForce: 15,
        lives: 3
    },
    gravity: 0.8,
    world: {
        groundLevel: 350,
        skyColor: '#5c94fc',
        backgroundSpeed: 0.5
    }
};

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const restartButton = document.getElementById('restartButton');

// Сообщения для принцессы Пич
const peachMessages = [
    "С юбилеем! 👑",
    "Самая прекрасная! 💖",
    "Ваша доброта побеждает! 🏰",
    "Вы вдохновляете! ✨",
    "Ваша улыбка - солнце! ☀️",
    "Самая мудрая! 🦉",
    "Ваши объятия - дом! 🏡",
    "Вы - сердце! ❤️",
    "Ваша сила в доброте! 💪",
    "Вы самая лучшая! 🌸"
];

// Объекты для хранения спрайтов
const sprites = {
    peach: {
        standRight: null,
        standLeft: null,
        walkRight: [],
        walkLeft: [],
        jumpRight: null,
        jumpLeft: null
    },
    tiles: {},
    items: {},
    background: {}
};

// Параметры анимации
let animationFrame = 0;
let walkAnimationCounter = 0;
const WALK_ANIMATION_SPEED = 8;

// Упрощенная функция создания спрайтов
function createSimpleSprite(width, height, color, type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);
    
    switch(type) {
        case 'peach_stand':
            // Упрощенная Пич
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(10, 20, 12, 28); // Платье
            
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(6, 0, 20, 8); // Волосы
            
            ctx.fillStyle = '#FFE4C4';
            ctx.fillRect(10, 8, 12, 12); // Лицо
            
            ctx.fillStyle = '#000';
            ctx.fillRect(12, 12, 2, 2); // Глаз левый
            ctx.fillRect(18, 12, 2, 2); // Глаз правый
            
            ctx.fillStyle = '#FF1493';
            ctx.fillRect(14, 16, 4, 2); // Рот
            break;
            
        case 'brick':
            // Кирпичный блок
            ctx.fillStyle = '#C04000';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#8B0000';
            // Вертикальные линии
            for (let x = 4; x < width; x += 8) {
                ctx.fillRect(x, 0, 2, height);
            }
            break;
            
        case 'question':
            // Вопросительный блок
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#B8860B';
            ctx.fillRect(0, 0, width, 4);
            ctx.fillRect(0, 0, 4, height);
            ctx.fillRect(width-4, 0, 4, height);
            ctx.fillRect(0, height-4, width, 4);
            
            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', width/2, height/2);
            break;
            
        case 'coin':
            // Монета
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(width/2, height/2, width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#B8860B';
            ctx.beginPath();
            ctx.arc(width/2, height/2, width/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P', width/2, height/2);
            break;
            
        case 'flower':
            // Цветок
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(width/2 - 2, height/2, 4, height/2); // Стебель
            
            ctx.fillStyle = '#FF69B4';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(
                    width/2 + Math.cos(i * Math.PI/2) * 8,
                    height/2 + Math.sin(i * Math.PI/2) * 8,
                    6, 0, Math.PI * 2
                );
                ctx.fill();
            }
            break;
            
        case 'flag':
            // Флаг
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(width/2 - 3, 0, 6, height); // Флагшток
            
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(width/2, 30, 20, 15); // Флаг
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(width/2 + 20, 30);
            ctx.lineTo(width/2 + 30, 35);
            ctx.lineTo(width/2 + 20, 45);
            ctx.closePath();
            ctx.fill();
            break;
            
        default:
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
    }
    
    return canvas;
}

// Функция загрузки спрайтов с прогрессом
function loadSprites() {
    let loadedCount = 0;
    const totalSprites = 12;
    
    function updateProgress() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalSprites) * 100);
        loadingElement.textContent = `Создаём королевство... ${percent}%`;
        
        if (loadedCount === totalSprites) {
            setTimeout(() => {
                loadingElement.style.display = 'none';
                initGame();
            }, 100);
        }
    }
    
    // Создаем спрайты асинхронно
    setTimeout(() => {
        // Принцесса Пич
        sprites.peach.standRight = createSimpleSprite(32, 48, '#FF69B4', 'peach_stand');
        updateProgress();
        
        sprites.peach.standLeft = createMirroredSprite(sprites.peach.standRight);
        updateProgress();
        
        // Создаем только 2 кадра анимации вместо 3
        sprites.peach.walkRight.push(createSimpleSprite(32, 48, '#FF69B4', 'peach_stand'));
        updateProgress();
        sprites.peach.walkRight.push(createSimpleSprite(32, 48, '#FF69B4', 'peach_stand'));
        updateProgress();
        
        sprites.peach.walkLeft.push(createMirroredSprite(sprites.peach.walkRight[0]));
        updateProgress();
        sprites.peach.walkLeft.push(createMirroredSprite(sprites.peach.walkRight[1]));
        updateProgress();
        
        sprites.peach.jumpRight = createSimpleSprite(32, 48, '#FF69B4', 'peach_stand');
        updateProgress();
        sprites.peach.jumpLeft = createMirroredSprite(sprites.peach.jumpRight);
        updateProgress();
        
        // Блоки
        sprites.tiles.ground = createSimpleSprite(32, 32, '#8B4513', 'brick');
        updateProgress();
        sprites.tiles.brick = createSimpleSprite(32, 32, '#C04000', 'brick');
        updateProgress();
        sprites.tiles.question = createSimpleSprite(32, 32, '#FFD700', 'question');
        updateProgress();
        
        // Предметы
        sprites.items.coin = createSimpleSprite(24, 24, '#FFD700', 'coin');
        updateProgress();
        sprites.items.flower = createSimpleSprite(32, 32, '#FF69B4', 'flower');
        updateProgress();
        sprites.items.star = createSimpleSprite(32, 32, '#FFD700', 'coin');
        updateProgress();
        sprites.items.flag = createSimpleSprite(40, 150, '#FF69B4', 'flag');
        updateProgress();
        
        // Фон (простой спрайт для облака)
        const cloudCanvas = document.createElement('canvas');
        cloudCanvas.width = 80;
        cloudCanvas.height = 40;
        const cloudCtx = cloudCanvas.getContext('2d');
        cloudCtx.fillStyle = '#FFFFFF';
        cloudCtx.beginPath();
        cloudCtx.arc(40, 20, 20, 0, Math.PI * 2);
        cloudCtx.fill();
        sprites.background.cloud = cloudCanvas;
        updateProgress();
        
        // Куст (простой спрайт)
        const bushCanvas = document.createElement('canvas');
        bushCanvas.width = 60;
        bushCanvas.height = 40;
        const bushCtx = bushCanvas.getContext('2d');
        bushCtx.fillStyle = '#228B22';
        bushCtx.beginPath();
        bushCtx.arc(30, 20, 20, 0, Math.PI * 2);
        bushCtx.fill();
        sprites.background.bush = bushCanvas;
        updateProgress();
        
    }, 50);
}

function createMirroredSprite(originalCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');
    
    ctx.translate(originalCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(originalCanvas, 0, 0);
    
    return canvas;
}

// ===================== ИГРОВЫЕ ОБЪЕКТЫ =====================
let player = {
    x: CONFIG.player.startX,
    y: CONFIG.player.startY,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    velocityX: 0,
    velocityY: 0,
    isOnGround: false,
    facingRight: true,
    lives: CONFIG.player.lives,
    invincible: false,
    invincibleTimer: 0,
    isJumping: false
};

// Платформы
let platforms = [
    {x: 0, y: CONFIG.world.groundLevel, width: 800, height: 50, type: 'ground'},
    {x: 150, y: 280, width: 96, height: 32, type: 'brick'},
    {x: 320, y: 220, width: 96, height: 32, type: 'brick'},
    {x: 500, y: 280, width: 96, height: 32, type: 'brick'},
    {x: 650, y: 180, width: 64, height: 32, type: 'brick'},
    {x: 200, y: 240, width: 32, height: 32, type: 'question'},
    {x: 370, y: 180, width: 32, height: 32, type: 'question'},
    {x: 550, y: 240, width: 32, height: 32, type: 'question'}
];

// Предметы
let items = [
    {x: 200, y: 200, width: 32, height: 32, collected: false, type: 'flower'},
    {x: 370, y: 140, width: 32, height: 32, collected: false, type: 'star'},
    {x: 550, y: 200, width: 32, height: 32, collected: false, type: 'flower'},
    {x: 680, y: 140, width: 24, height: 24, collected: false, type: 'coin'},
    {x: 750, y: 100, width: 24, height: 24, collected: false, type: 'coin'}
];

let flag = {x: 750, y: 180, width: 40, height: 150, reached: false};
let clouds = [
    {x: 100, y: 60, width: 80, height: 40},
    {x: 350, y: 80, width: 100, height: 50},
    {x: 600, y: 40, width: 120, height: 60}
];

let bushes = [
    {x: 50, y: CONFIG.world.groundLevel - 30, width: 60, height: 40},
    {x: 300, y: CONFIG.world.groundLevel - 30, width: 80, height: 50},
    {x: 550, y: CONFIG.world.groundLevel - 30, width: 70, height: 45}
];

let score = 0;
let gameOver = false;
let gameWin = false;
const keys = {};
const particles = [];
let floatingMessages = [];
let backgroundOffset = 0;

// ===================== УПРАВЛЕНИЕ =====================
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') resetGame();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartButton.addEventListener('click', resetGame);

// ===================== ОСНОВНЫЕ ФУНКЦИИ =====================
function initGame() {
    player = {
        x: CONFIG.player.startX,
        y: CONFIG.player.startY,
        width: CONFIG.player.width,
        height: CONFIG.player.height,
        velocityX: 0,
        velocityY: 0,
        isOnGround: false,
        facingRight: true,
        lives: CONFIG.player.lives,
        invincible: false,
        invincibleTimer: 0,
        isJumping: false
    };
    
    items.forEach(item => item.collected = false);
    flag.reached = false;
    score = 0;
    gameOver = false;
    gameWin = false;
    backgroundOffset = 0;
    scoreElement.textContent = score;
    livesElement.textContent = '👑'.repeat(player.lives);
    messageElement.style.display = 'none';
    floatingMessages = [];
    
    gameLoop();
}

function gameLoop() {
    if (gameOver || gameWin) {
        if (gameWin) {
            showWinMessage();
        }
        return;
    }
    
    update();
    draw();
    animationFrame++;
    requestAnimationFrame(gameLoop);
}

function update() {
    // Управление
    player.velocityX = 0;
    if (keys['ArrowLeft']) {
        player.velocityX = -CONFIG.player.speed;
        player.facingRight = false;
        walkAnimationCounter++;
    }
    if (keys['ArrowRight']) {
        player.velocityX = CONFIG.player.speed;
        player.facingRight = true;
        walkAnimationCounter++;
    }
    
    // Прыжок
    if (keys['ArrowUp'] && player.isOnGround) {
        player.velocityY = -CONFIG.player.jumpForce;
        player.isOnGround = false;
        player.isJumping = true;
    }
    
    // Гравитация
    player.velocityY += CONFIG.gravity;
    
    // Обновление позиции
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Проверка падения
    if (player.y > canvas.height) {
        loseLife();
        return;
    }
    
    // Столкновение с платформами
    player.isOnGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velocityY) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
        }
    });
    
    // Сбор предметов
    items.forEach((item, index) => {
        if (!item.collected &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            item.collected = true;
            score += item.type === 'coin' ? 100 : 200;
            scoreElement.textContent = score;
            
            // Показываем сообщение
            showFloatingMessage(
                peachMessages[index % peachMessages.length], 
                item.x + item.width/2, 
                item.y
            );
            
            if (items.every(i => i.collected)) {
                messageElement.textContent = "🎉 Все предметы собраны! К флагу! 🎉";
                messageElement.style.display = 'block';
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 2000);
            }
        }
    });
    
    // Достижение флага
    if (!flag.reached &&
        player.x < flag.x + flag.width &&
        player.x + player.width > flag.x &&
        player.y < flag.y + flag.height &&
        player.y + player.height > flag.y) {
        
        flag.reached = true;
        if (items.every(item => item.collected)) {
            gameWin = true;
        } else {
            messageElement.textContent = "Сначала собери все предметы!";
            messageElement.style.display = 'block';
            setTimeout(() => {
                messageElement.style.display = 'none';
                flag.reached = false;
            }, 1500);
        }
    }
    
    // Обновление невидимости
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    // Обновление плавающих сообщений
    for (let i = floatingMessages.length - 1; i >= 0; i--) {
        floatingMessages[i].update();
        if (floatingMessages[i].life <= 0) {
            floatingMessages.splice(i, 1);
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    ctx.fillStyle = CONFIG.world.skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Солнце
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 60, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Облака
    clouds.forEach(cloud => {
        if (sprites.background.cloud) {
            ctx.drawImage(sprites.background.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
        }
    });
    
    // Кусты
    bushes.forEach(bush => {
        if (sprites.background.bush) {
            ctx.drawImage(sprites.background.bush, bush.x, bush.y, bush.width, bush.height);
        }
    });
    
    // Платформы
    platforms.forEach(platform => {
        if (platform.type === 'ground') {
            // Земля
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Трава сверху
            ctx.fillStyle = '#7CFC00';
            ctx.fillRect(platform.x, platform.y - 10, platform.width, 10);
        } else if (platform.type === 'brick' && sprites.tiles.brick) {
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                for (let y = platform.y; y < platform.y + platform.height; y += 32) {
                    ctx.drawImage(sprites.tiles.brick, x, y, 32, 32);
                }
            }
        } else if (platform.type === 'question' && sprites.tiles.question) {
            ctx.drawImage(sprites.tiles.question, platform.x, platform.y, platform.width, platform.height);
        }
    });
    
    // Предметы
    items.forEach(item => {
        if (!item.collected && sprites.items[item.type]) {
            ctx.drawImage(sprites.items[item.type], item.x, item.y, item.width, item.height);
        }
    });
    
    // Флаг
    if (sprites.items.flag) {
        ctx.drawImage(sprites.items.flag, flag.x, flag.y, flag.width, flag.height);
    }
    
    // Игрок
    let playerSprite;
    if (!player.isOnGround) {
        // Прыжок
        playerSprite = player.facingRight ? sprites.peach.jumpRight : sprites.peach.jumpLeft;
    } else if (player.velocityX !== 0) {
        // Ходьба
        const walkFrame = Math.floor(walkAnimationCounter / WALK_ANIMATION_SPEED) % sprites.peach.walkRight.length;
        playerSprite = player.facingRight ? sprites.peach.walkRight[walkFrame] : sprites.peach.walkLeft[walkFrame];
    } else {
        // Стояние
        playerSprite = player.facingRight ? sprites.peach.standRight : sprites.peach.standLeft;
    }
    
    if (playerSprite && (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0)) {
        ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
    }
    
    // Плавающие сообщения
    floatingMessages.forEach(message => {
        message.draw(ctx);
    });
    
    // Анимация флага при достижении
    if (flag.reached) {
        ctx.save();
        ctx.translate(flag.x + flag.width, flag.y + 30);
        ctx.rotate(Math.sin(Date.now() / 200) * 0.3);
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, -20);
        ctx.lineTo(0, -40);
        ctx.fill();
        ctx.restore();
    }
}

function loseLife() {
    if (player.invincible) return;
    
    player.lives--;
    livesElement.textContent = '👑'.repeat(player.lives);
    
    if (player.lives <= 0) {
        gameOver = true;
        showMessage("Не сдавайся, принцесса! Попробуй ещё раз! 💖");
    } else {
        player.invincible = true;
        player.invincibleTimer = 120;
        player.x = CONFIG.player.startX;
        player.y = CONFIG.player.startY;
        player.velocityX = 0;
        player.velocityY = 0;
    }
}

function showWinMessage() {
    const messages = [
        "🎊 ПОБЕДА ПРИНЦЕССЫ ПИЧ! 🎊",
        "С Юбилеем, ваше величество!",
        "Вы спасли королевство!",
        "Все предметы собраны! 👑"
    ];
    
    let message = messages[0];
    messageElement.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 1.5em; color: #FF69B4;">${message}</div>
        <div style="font-size: 0.8em; color: #8B4513;">${messages.slice(1).join('<br>')}</div>
        <div style="margin-top: 20px; font-size: 0.7em;">Нажми R или кнопку для новой игры</div>
    `;
    messageElement.style.display = 'block';
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
}

function showFloatingMessage(text, x, y) {
    floatingMessages.push({
        x: x,
        y: y,
        text: text,
        life: 100,
        velocityY: -2,
        opacity: 1,
        update: function() {
            this.y += this.velocityY;
            this.life--;
            this.opacity = this.life / 100;
        },
        draw: function(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.font = 'bold 16px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FF69B4';
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            
            ctx.strokeText(this.text, this.x, this.y);
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    });
}

function resetGame() {
    initGame();
}

// Запуск игры
loadSprites();

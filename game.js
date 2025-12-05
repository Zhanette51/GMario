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
    gifts: {}, // Изменим с items на gifts для ясности
    background: {}
};

// Параметры анимации
let animationFrame = 0;
let walkAnimationCounter = 0;
const WALK_ANIMATION_SPEED = 8;

// Функция создания принцессы Пич с короной из трёх треугольников
function createPeachSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, 32, 48);
    
    // Тело (платье)
    ctx.fillStyle = '#FF69B4'; // Розовое платье
    // Платье с V-образным вырезом
    ctx.beginPath();
    ctx.moveTo(8, 20);
    ctx.lineTo(24, 20);
    ctx.lineTo(24, 45);
    ctx.lineTo(8, 45);
    ctx.closePath();
    ctx.fill();
    
    // Руки
    ctx.fillStyle = '#FFE4C4'; // Телесный цвет
    ctx.fillRect(4, 24, 4, 8); // Левая рука
    ctx.fillRect(24, 24, 4, 8); // Правая рука
    
    // Голова (круглая, без пикселей)
    ctx.beginPath();
    ctx.arc(16, 12, 10, 0, Math.PI * 2); // Голова
    ctx.fillStyle = '#FFE4C4';
    ctx.fill();
    
    // Волосы
    ctx.fillStyle = '#FFD700'; // Золотистые волосы
    ctx.beginPath();
    ctx.ellipse(16, 8, 10, 6, 0, 0, Math.PI * 2); // Верхняя часть волос
    ctx.fill();
    
    // Корона с тремя треугольниками
    ctx.fillStyle = '#FFD700';
    
    // Центральный треугольник короны
    ctx.beginPath();
    ctx.moveTo(16, 2);  // Верхняя точка
    ctx.lineTo(12, 8);  // Левая нижняя
    ctx.lineTo(20, 8);  // Правая нижняя
    ctx.closePath();
    ctx.fill();
    
    // Левый треугольник короны
    ctx.beginPath();
    ctx.moveTo(10, 4);  // Верхняя точка
    ctx.lineTo(6, 8);   // Левая нижняя
    ctx.lineTo(14, 8);  // Правая нижняя
    ctx.closePath();
    ctx.fill();
    
    // Правый треугольник короны
    ctx.beginPath();
    ctx.moveTo(22, 4);  // Верхняя точка
    ctx.lineTo(18, 8);  // Левая нижняя
    ctx.lineTo(26, 8);  // Правая нижняя
    ctx.closePath();
    ctx.fill();
    
    // Основание короны
    ctx.fillRect(6, 8, 20, 2);
    
    // Глаза (без пикселей, простые круги)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(12, 11, 2, 0, Math.PI * 2); // Левый глаз
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(20, 11, 2, 0, Math.PI * 2); // Правый глаз
    ctx.fill();
    
    // Улыбка (дуга)
    ctx.beginPath();
    ctx.arc(16, 15, 4, 0.2, Math.PI - 0.2, false); // Улыбка
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Бантик на платье
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(16, 25, 4, 2, 0, 0, Math.PI * 2); // Центр бантика
    ctx.fill();
    
    // Ленты бантика
    ctx.beginPath();
    ctx.moveTo(16, 25);
    ctx.lineTo(12, 30);
    ctx.moveTo(16, 25);
    ctx.lineTo(20, 30);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ноги (ботинки)
    ctx.fillStyle = '#8B4513'; // Коричневые ботинки
    ctx.fillRect(10, 45, 6, 3);  // Левый ботинок
    ctx.fillRect(16, 45, 6, 3);  // Правый ботинок
    
    return canvas;
}

// Функция создания спрайта подарка
function createGiftSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 30;
    const ctx = canvas.getContext('2d');
    
    // Коробка подарка
    ctx.fillStyle = '#FF4081'; // Ярко-розовый
    ctx.fillRect(0, 0, 30, 30);
    
    // Обводка
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 28, 28);
    
    // Ленточка
    ctx.fillStyle = '#FFD700'; // Золотая
    ctx.fillRect(13, 0, 4, 30); // Вертикальная
    ctx.fillRect(0, 13, 30, 4); // Горизонтальная
    
    // Бантик в центре
    ctx.beginPath();
    ctx.ellipse(15, 15, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Концы ленты
    ctx.beginPath();
    ctx.moveTo(15, 18);
    ctx.lineTo(10, 23);
    ctx.moveTo(15, 18);
    ctx.lineTo(20, 23);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    return canvas;
}

// Функция загрузки спрайтов с прогрессом
function loadSprites() {
    let loadedCount = 0;
    const totalSprites = 10;
    
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
        sprites.peach.standRight = createPeachSprite();
        updateProgress();
        
        sprites.peach.standLeft = createMirroredSprite(sprites.peach.standRight);
        updateProgress();
        
        // Для простоты используем тот же спрайт для анимации
        sprites.peach.walkRight.push(createPeachSprite());
        updateProgress();
        sprites.peach.walkLeft.push(createMirroredSprite(sprites.peach.walkRight[0]));
        updateProgress();
        
        sprites.peach.jumpRight = createPeachSprite();
        updateProgress();
        sprites.peach.jumpLeft = createMirroredSprite(sprites.peach.jumpRight);
        updateProgress();
        
        // Блоки
        sprites.tiles.ground = createSimpleSprite(32, 32, '#8B4513', 'brick');
        updateProgress();
        sprites.tiles.brick = createSimpleSprite(32, 32, '#C04000', 'brick');
        updateProgress();
        
        // Подарки
        sprites.gifts.gift = createGiftSprite();
        updateProgress();
        
        // Флаг
        sprites.gifts.flag = createSimpleSprite(40, 150, '#FF69B4', 'flag');
        updateProgress();
        
        // Облако
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
        
    }, 50);
}

// Вспомогательная функция для создания простых спрайтов
function createSimpleSprite(width, height, color, type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);
    
    if (type === 'brick') {
        // Кирпичный блок
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = darkenColor(color, 30);
        for (let x = 4; x < width; x += 8) {
            ctx.fillRect(x, 0, 2, height);
        }
    } else if (type === 'flag') {
        // Флаг
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width/2 - 3, 0, 6, height); // Флагшток
        
        ctx.fillStyle = color;
        ctx.fillRect(width/2, 30, 20, 15); // Флаг
        
        // Корона на флаге
        ctx.fillStyle = '#FFD700';
        // Центральный треугольник
        ctx.beginPath();
        ctx.moveTo(width/2 + 25, 35);
        ctx.lineTo(width/2 + 22, 40);
        ctx.lineTo(width/2 + 28, 40);
        ctx.closePath();
        ctx.fill();
        // Левый треугольник
        ctx.beginPath();
        ctx.moveTo(width/2 + 20, 37);
        ctx.lineTo(width/2 + 17, 42);
        ctx.lineTo(width/2 + 23, 42);
        ctx.closePath();
        ctx.fill();
        // Правый треугольник
        ctx.beginPath();
        ctx.moveTo(width/2 + 30, 37);
        ctx.lineTo(width/2 + 27, 42);
        ctx.lineTo(width/2 + 33, 42);
        ctx.closePath();
        ctx.fill();
        // Основание короны
        ctx.fillRect(width/2 + 17, 42, 16, 2);
    }
    
    return canvas;
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

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
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
    {x: 650, y: 180, width: 64, height: 32, type: 'brick'}
];

// Подарки (счет от 1 до 5)
let gifts = [
    {x: 180, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 350, y: 180, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 530, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 680, y: 140, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 750, y: 100, width: 30, height: 30, collected: false, type: 'gift'}
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

let score = 0; // Теперь это количество собранных подарков (0-5)
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
    
    gifts.forEach(gift => gift.collected = false);
    flag.reached = false;
    score = 0; // Сбрасываем счетчик подарков
    gameOver = false;
    gameWin = false;
    backgroundOffset = 0;
    scoreElement.textContent = `${score}/5`; // Формат: 0/5
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
    
    // Сбор подарков (теперь увеличиваем на 1, не на 200)
    gifts.forEach((gift, index) => {
        if (!gift.collected &&
            player.x < gift.x + gift.width &&
            player.x + player.width > gift.x &&
            player.y < gift.y + gift.height &&
            player.y + player.height > gift.y) {
            
            gift.collected = true;
            score++; // Увеличиваем на 1
            scoreElement.textContent = `${score}/5`; // Обновляем отображение
            
            // Показываем сообщение
            showFloatingMessage(
                peachMessages[index % peachMessages.length], 
                gift.x + gift.width/2, 
                gift.y
            );
            
            // Если собрали все 5 подарков
            if (score === gifts.length) {
                messageElement.textContent = "🎉 Все подарки собраны! К флагу! 🎉";
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
        if (score === gifts.length) { // Проверяем, что собраны ВСЕ 5 подарков
            gameWin = true;
        } else {
            messageElement.textContent = `Сначала собери все подарки! (${score}/5)`;
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
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(bush.x + bush.width/2, bush.y + bush.height/2, bush.width/2, 0, Math.PI * 2);
        ctx.fill();
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
            // Кирпичные платформы
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                ctx.drawImage(sprites.tiles.brick, x, platform.y, 32, 32);
            }
        }
    });
    
    // Подарки с анимацией парения
    gifts.forEach(gift => {
        if (!gift.collected && sprites.gifts.gift) {
            const floatOffset = Math.sin(Date.now() / 300 + gift.x * 0.1) * 5;
            ctx.drawImage(sprites.gifts.gift, gift.x, gift.y + floatOffset, gift.width, gift.height);
            
            // Мигающий эффект для подарков
            if (Math.sin(Date.now() / 200) > 0) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(gift.x, gift.y + floatOffset, gift.width, gift.height);
                ctx.globalAlpha = 1;
            }
        }
    });
    
    // Флаг
    if (sprites.gifts.flag) {
        ctx.drawImage(sprites.gifts.flag, flag.x, flag.y, flag.width, flag.height);
    }
    
    // Игрок (принцесса Пич)
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
        
        // Флаг победы
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, -20);
        ctx.lineTo(0, -40);
        ctx.closePath();
        ctx.fill();
        
        // Корона на флаге победы
        ctx.fillStyle = '#FFD700';
        // Центральный треугольник
        ctx.beginPath();
        ctx.moveTo(10, -30);
        ctx.lineTo(7, -25);
        ctx.lineTo(13, -25);
        ctx.closePath();
        ctx.fill();
        // Левый треугольник
        ctx.beginPath();
        ctx.moveTo(4, -28);
        ctx.lineTo(1, -23);
        ctx.lineTo(7, -23);
        ctx.closePath();
        ctx.fill();
        // Правый треугольник
        ctx.beginPath();
        ctx.moveTo(16, -28);
        ctx.lineTo(13, -23);
        ctx.lineTo(19, -23);
        ctx.closePath();
        ctx.fill();
        // Основание короны
        ctx.fillRect(1, -23, 18, 2);
        
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
        "С Юбилеем!",
        "Все 5 подарков собраны!",
        "Королевство спасено! 👑"
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
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FF69B4';
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            
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

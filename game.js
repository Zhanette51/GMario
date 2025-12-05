// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 50,
        startY: 250,
        width: 32, // Стандартный размер спрайта Mario
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
    "С юбилеем, ваше величество! 👑",
    "Самая прекрасная принцесса! 💖",
    "Ваша доброта побеждает все! 🏰",
    "Вы вдохновляете королевство! ✨",
    "Ваша улыбка - наше солнце! ☀️",
    "Самая мудрая правительница! 🦉",
    "Ваши объятия - наш дом! 🏡",
    "Вы - сердце нашего королевства! ❤️",
    "Ваша сила в доброте! 💪",
    "Вы самая лучшая принцесса! 🌸"
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
    enemies: {},
    items: {},
    background: {}
};

// Параметры анимации
let animationFrame = 0;
let walkAnimationCounter = 0;
const WALK_ANIMATION_SPEED = 8; // Чем меньше, тем быстрее анимация

// Функция загрузки всех спрайтов
function loadSprites() {
    // Создаем базовые спрайты в стиле Super Mario
    loadingElement.textContent = "Создаём королевство...";
    
    // 1. Создаем принцессу Пич (пиксельный стиль Super Mario)
    createPeachSprites();
    
    // 2. Создаем блоки и платформы
    createTileSprites();
    
    // 3. Создаем предметы
    createItemSprites();
    
    // 4. Создаем фоновые элементы
    createBackgroundSprites();
    
    setTimeout(() => {
        loadingElement.style.display = 'none';
        initGame();
    }, 1500);
}

function createPeachSprites() {
    // Цвета принцессы Пич
    const peachColors = {
        dress: '#FF69B4',      // Розовое платье
        skin: '#FFE4C4',       // Телесный цвет
        hair: '#FFD700',       // Золотистые волосы
        crown: '#FFDF00',      // Корона
        details: '#FF1493'     // Акценты
    };

    // Стоящая вправо
    sprites.peach.standRight = createMarioStyleSprite(32, 48, peachColors, 'peach_stand');
    
    // Стоящая влево (зеркало)
    sprites.peach.standLeft = createMirroredSprite(sprites.peach.standRight);
    
    // Анимация ходьбы вправо (3 кадра)
    for (let i = 0; i < 3; i++) {
        sprites.peach.walkRight.push(createMarioStyleSprite(32, 48, peachColors, `peach_walk_${i}`));
        sprites.peach.walkLeft.push(createMirroredSprite(sprites.peach.walkRight[i]));
    }
    
    // Прыжок
    sprites.peach.jumpRight = createMarioStyleSprite(32, 48, peachColors, 'peach_jump');
    sprites.peach.jumpLeft = createMirroredSprite(sprites.peach.jumpRight);
}

function createMarioStyleSprite(width, height, colors, type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Очищаем с прозрачностью
    ctx.clearRect(0, 0, width, height);
    
    // Пиксельный стиль Super Mario
    const pixelSize = 4; // Размер "пикселя" для стиля
    
    if (type.includes('peach')) {
        // Голова и волосы
        drawPixelArea(ctx, 8, 0, 16, 8, colors.hair, pixelSize); // Волосы сверху
        drawPixelArea(ctx, 12, 8, 8, 8, colors.skin, pixelSize); // Лицо
        
        // Глаза
        drawPixel(ctx, 14, 12, '#000000', pixelSize);
        drawPixel(ctx, 18, 12, '#000000', pixelSize);
        
        // Улыбка
        drawPixel(ctx, 16, 16, colors.details, pixelSize);
        
        // Корона
        drawPixelArea(ctx, 12, 0, 8, 4, colors.crown, pixelSize);
        drawPixel(ctx, 10, 2, colors.crown, pixelSize);
        drawPixel(ctx, 22, 2, colors.crown, pixelSize);
        
        // Платье
        drawPixelArea(ctx, 8, 16, 16, 24, colors.dress, pixelSize);
        
        // Руки
        drawPixelArea(ctx, 4, 20, 4, 8, colors.skin, pixelSize);
        drawPixelArea(ctx, 24, 20, 4, 8, colors.skin, pixelSize);
        
        // Детали платья
        drawPixelArea(ctx, 12, 24, 8, 4, colors.details, pixelSize); // Пояс
        drawPixelArea(ctx, 12, 32, 8, 4, colors.details, pixelSize); // Юбка
        
        // Ноги
        drawPixelArea(ctx, 12, 40, 4, 8, '#8B4513', pixelSize); // Левый ботинок
        drawPixelArea(ctx, 16, 40, 4, 8, '#8B4513', pixelSize); // Правый ботинок
        
        // Анимация ходьбы
        if (type.includes('walk_1')) {
            drawPixelArea(ctx, 12, 44, 4, 4, colors.skin, pixelSize); // Видна часть ноги
        } else if (type.includes('walk_2')) {
            drawPixelArea(ctx, 16, 44, 4, 4, colors.skin, pixelSize); // Другая нога
        }
        
        // Прыжок - поднятые руки
        if (type.includes('jump')) {
            drawPixelArea(ctx, 4, 12, 4, 8, colors.skin, pixelSize);
            drawPixelArea(ctx, 24, 12, 4, 8, colors.skin, pixelSize);
        }
    }
    
    return canvas;
}

function createTileSprites() {
    // Блок земли (как в Super Mario)
    sprites.tiles.ground = createBlockSprite(32, 32, '#8B4513', 'ground');
    
    // Кирпичный блок
    sprites.tiles.brick = createBlockSprite(32, 32, '#C04000', 'brick');
    
    // Вопросительный блок
    sprites.tiles.question = createQuestionBlock();
    
    // Труба
    sprites.tiles.pipe = createPipeSprite();
}

function createBlockSprite(width, height, baseColor, type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Основной цвет
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);
    
    // Текстура в пиксельном стиле
    ctx.fillStyle = darkenColor(baseColor, 30);
    
    // Вертикальные линии
    for (let x = 0; x < width; x += 4) {
        ctx.fillRect(x, 0, 2, height);
    }
    
    // Горизонтальные линии
    for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 2);
    }
    
    // Светлые пиксели для объема
    ctx.fillStyle = lightenColor(baseColor, 20);
    for (let x = 2; x < width; x += 8) {
        for (let y = 2; y < height; y += 8) {
            ctx.fillRect(x, y, 2, 2);
        }
    }
    
    return canvas;
}

function createQuestionBlock() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Основной цвет - желтый
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, 32, 32);
    
    // Темные границы
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(0, 0, 32, 4); // Верх
    ctx.fillRect(0, 28, 32, 4); // Низ
    ctx.fillRect(0, 0, 4, 32); // Лево
    ctx.fillRect(28, 0, 4, 32); // Право
    
    // Вопросительный знак
    ctx.fillStyle = '#8B4513';
    // Точка
    ctx.fillRect(14, 10, 4, 4);
    // Палочка
    ctx.fillRect(14, 16, 4, 8);
    // Верхняя часть
    ctx.fillRect(10, 6, 12, 4);
    ctx.fillRect(18, 10, 4, 4);
    
    // Блики
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(4, 4, 4, 4);
    ctx.fillRect(24, 4, 4, 4);
    
    return canvas;
}

function createPipeSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Зеленая труба в стиле Mario
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 64, 64);
    
    // Темно-зеленые полосы
    ctx.fillStyle = '#006400';
    for (let y = 0; y < 64; y += 16) {
        ctx.fillRect(0, y, 64, 8);
    }
    
    // Светлые блики
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(4, 4, 56, 4);
    ctx.fillRect(4, 20, 56, 4);
    ctx.fillRect(4, 36, 56, 4);
    ctx.fillRect(4, 52, 56, 4);
    
    return canvas;
}

function createItemSprites() {
    // Цветок (как в Mario, но розовый для Пич)
    sprites.items.flower = createFlowerSprite();
    
    // Звезда
    sprites.items.star = createStarSprite();
    
    // Монета (подарок)
    sprites.items.coin = createCoinSprite();
    
    // Флаг
    sprites.items.flag = createFlagSprite();
}

function createFlowerSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Стебель
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(14, 16, 4, 12);
    
    // Листья
    ctx.beginPath();
    ctx.ellipse(10, 20, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, 20, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Цветок (розовый для Пич)
    ctx.fillStyle = '#FF69B4';
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.ellipse(
            16 + Math.cos(angle) * 6,
            12 + Math.sin(angle) * 6,
            6, 6, 0, 0, Math.PI * 2
        );
        ctx.fill();
    }
    
    // Центр цветка
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(16, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

function createStarSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFD700';
    
    // Рисуем звезду
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? 12 : 6;
        const x = 16 + Math.cos(angle) * radius;
        const y = 16 + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Блики
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(10, 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

function createCoinSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    
    // Золотая монета
    const gradient = ctx.createRadialGradient(12, 12, 0, 12, 12, 12);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, '#B8860B');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Блик
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Буква P (Peach)
    ctx.fillStyle = '#8B4513';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', 12, 12);
    
    return canvas;
}

function createFlagSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Флагшток
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(18, 0, 4, 150);
    
    // Основание
    ctx.fillRect(10, 140, 20, 10);
    
    // Флаг (розовый для Пич)
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.moveTo(22, 30);
    ctx.lineTo(40, 20);
    ctx.lineTo(22, 50);
    ctx.closePath();
    ctx.fill();
    
    // Корона на флаге
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(30, 22);
    ctx.lineTo(33, 28);
    ctx.lineTo(38, 28);
    ctx.lineTo(34, 32);
    ctx.lineTo(36, 38);
    ctx.lineTo(30, 34);
    ctx.lineTo(24, 38);
    ctx.lineTo(26, 32);
    ctx.lineTo(22, 28);
    ctx.lineTo(27, 28);
    ctx.closePath();
    ctx.fill();
    
    return canvas;
}

function createBackgroundSprites() {
    // Облака в стиле Mario
    sprites.background.cloud = createMarioCloud();
    
    // Кусты
    sprites.background.bush = createMarioBush();
    
    // Горы
    sprites.background.mountain = createMountain();
}

function createMarioCloud() {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFFFFF';
    
    // Основные части облака (как в Super Mario)
    ctx.beginPath();
    ctx.ellipse(30, 30, 20, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(60, 25, 25, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(90, 30, 20, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(48, 18, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(30, 32, 20, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(60, 27, 25, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(90, 32, 20, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(48, 20, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

function createMarioBush() {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#228B22';
    
    // Куст из нескольких шаров (как в Mario)
    ctx.beginPath();
    ctx.arc(20, 35, 15, 0, Math.PI * 2);
    ctx.arc(40, 25, 18, 0, Math.PI * 2);
    ctx.arc(60, 35, 15, 0, Math.PI * 2);
    ctx.arc(50, 40, 12, 0, Math.PI * 2);
    ctx.arc(30, 40, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Более темные участки для объема
    ctx.fillStyle = '#006400';
    ctx.beginPath();
    ctx.arc(15, 32, 8, 0, Math.PI * 2);
    ctx.arc(35, 22, 10, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

function createMountain() {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    // Гора с снежной вершиной
    const gradient = ctx.createLinearGradient(0, 80, 0, 0);
    gradient.addColorStop(0, '#8B4513');
    gradient.addPathStop(0.7, '#A0522D');
    gradient.addColorStop(1, '#DEB887');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(60, 0);
    ctx.lineTo(120, 80);
    ctx.closePath();
    ctx.fill();
    
    // Снежная вершина
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(60, 0);
    ctx.lineTo(80, 20);
    ctx.lineTo(70, 30);
    ctx.lineTo(50, 30);
    ctx.closePath();
    ctx.fill();
    
    return canvas;
}

// Вспомогательные функции
function drawPixel(ctx, x, y, color, size = 4) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
}

function drawPixelArea(ctx, x, y, w, h, color, size = 4) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, w * size, h * size);
}

function createMirroredSprite(originalCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');
    
    // Отражаем по горизонтали
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

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
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

// Платформы в стиле Mario
let platforms = [
    // Основная земля
    {x: 0, y: CONFIG.world.groundLevel, width: 800, height: 50, type: 'ground'},
    // Кирпичные платформы
    {x: 150, y: 280, width: 96, height: 32, type: 'brick'},
    {x: 320, y: 220, width: 96, height: 32, type: 'brick'},
    {x: 500, y: 280, width: 96, height: 32, type: 'brick'},
    {x: 650, y: 180, width: 64, height: 32, type: 'brick'},
    // Вопросительные блоки
    {x: 200, y: 240, width: 32, height: 32, type: 'question'},
    {x: 370, y: 180, width: 32, height: 32, type: 'question'},
    {x: 550, y: 240, width: 32, height: 32, type: 'question'}
];

// Предметы для сбора (вместо подарков - цветы, звезды, монеты)
let items = [
    {x: 200, y: 200, width: 32, height: 32, collected: false, type: 'flower'},
    {x: 370, y: 140, width: 32, height: 32, collected: false, type: 'star'},
    {x: 550, y: 200, width: 32, height: 32, collected: false, type: 'flower'},
    {x: 680, y: 140, width: 24, height: 24, collected: false, type: 'coin'},
    {x: 750, y: 100, width: 24, height: 24, collected: false, type: 'coin'}
];

let flag = {x: 750, y: 180, width: 40, height: 150, reached: false};
let clouds = [
    {x: 100, y: 60, width: 96, height: 48},
    {x: 350, y: 80, width: 96, height: 48},
    {x: 600, y: 40, width: 96, height: 48}
];

let bushes = [
    {x: 50, y: CONFIG.world.groundLevel - 30, width: 80, height: 48},
    {x: 300, y: CONFIG.world.groundLevel - 30, width: 80, height: 48},
    {x: 550, y: CONFIG.world.groundLevel - 30, width: 80, height: 48}
];

let mountains = [
    {x: -50, y: 250, width: 120, height: 80},
    {x: 200, y: 270, width: 120, height: 80},
    {x: 500, y: 260, width: 120, height: 80}
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
        createParticles(player.x + player.width/2, player.y + player.height, 5, '#FFD700');
    }
    
    // Анимация ходьбы
    if (walkAnimationCounter > 60) walkAnimationCounter = 0;
    
    // Гравитация
    player.velocityY += CONFIG.gravity;
    
    // Обновление позиции
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Если игрок на земле, сбрасываем флаг прыжка
    if (player.isOnGround) {
        player.isJumping = false;
    }
    
    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Проверка падения
    if (player.y > canvas.height) {
        loseLife();
        return;
    }
    
    // Движение фона (параллакс)
    if (player.velocityX !== 0) {
        backgroundOffset += player.velocityX * CONFIG.world.backgroundSpeed * 0.1;
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
            
            // Эффект сбора
            const colors = {
                'flower': '#FF69B4',
                'star': '#FFD700',
                'coin': '#FFD700'
            };
            createParticles(item.x + item.width/2, item.y + item.height/2, 10, colors[item.type]);
            
            // Показываем сообщение принцессы
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
    
    // Обновление частиц
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
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
    
    // Градиентное небо (утро в Mushroom Kingdom)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB'); // Голубой
    skyGradient.addColorStop(0.6, '#5c94fc'); // Синий
    skyGradient.addColorStop(1, '#1a5fb4'); // Темно-синий
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Солнце
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 60, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Лучи солнца
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(
            700 + Math.cos(angle) * 30,
            60 + Math.sin(angle) * 30
        );
        ctx.lineTo(
            700 + Math.cos(angle) * 45,
            60 + Math.sin(angle) * 45
        );
        ctx.stroke();
    }
    
    // Горы с параллаксом
    mountains.forEach((mountain, index) => {
        const parallaxOffset = backgroundOffset * 0.3;
        const x = (mountain.x + parallaxOffset * (index + 1)) % (canvas.width + 200) - 100;
        ctx.drawImage(sprites.background.mountain, x, mountain.y, mountain.width, mountain.height);
    });
    
    // Облака с параллаксом
    clouds.forEach((cloud, index) => {
        const parallaxOffset = backgroundOffset * 0.5;
        const x = (cloud.x + parallaxOffset * (index + 1)) % (canvas.width + 200) - 100;
        ctx.drawImage(sprites.background.cloud, x, cloud.y, cloud.width, cloud.height);
    });
    
    // Кусты
    bushes.forEach(bush => {
        ctx.drawImage(sprites.background.bush, bush.x, bush.y, bush.width, bush.height);
    });
    
    // Платформы
    platforms.forEach(platform => {
        if (platform.type === 'ground') {
            // Земля с текстурой
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                for (let y = platform.y; y < platform.y + platform.height; y += 32) {
                    ctx.drawImage(sprites.tiles.ground, x, y, 32, 32);
                }
            }
        } else if (platform.type === 'brick') {
            // Кирпичные блоки
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                for (let y = platform.y; y < platform.y + platform.height; y += 32) {
                    ctx.drawImage(sprites.tiles.brick, x, y, 32, 32);
                }
            }
        } else if (platform.type === 'question') {
            // Вопросительные блоки с анимацией
            ctx.drawImage(sprites.tiles.question, platform.x, platform.y, platform.width, platform.height);
            
            // Анимация мигания
            if (Math.sin(Date.now() / 200) > 0) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.globalAlpha = 1;
            }
        }
    });
    
    // Предметы
    items.forEach(item => {
        if (!item.collected) {
            ctx.drawImage(sprites.items[item.type], item.x, item.y, item.width, item.height);
            
            // Анимация парения для цветов и звезд
            if (item.type !== 'coin') {
                const floatOffset = Math.sin(Date.now() / 300) * 5;
                ctx.drawImage(sprites.items[item.type], item.x, item.y + floatOffset, item.width, item.height);
            }
            
            // Мигание для монет
            if (item.type === 'coin') {
                if (Math.sin(Date.now() / 150) > 0) {
                    ctx.globalAlpha = 0.7;
                    ctx.drawImage(sprites.items.coin, item.x, item.y, item.width, item.height);
                    ctx.globalAlpha = 1;
                }
            }
        }
    });
    
    // Флаг
    ctx.drawImage(sprites.items.flag, flag.x, flag.y, flag.width, flag.height);
    
    // Игрок (принцесса Пич) с анимацией
    let playerSprite;
    if (!player.isOnGround) {
        // Прыжок
        playerSprite = player.facingRight ? sprites.peach.jumpRight : sprites.peach.jumpLeft;
    } else if (player.velocityX !== 0) {
        // Ходьба - циклическая анимация
        const walkFrame = Math.floor(walkAnimationCounter / WALK_ANIMATION_SPEED) % sprites.peach.walkRight.length;
        playerSprite = player.facingRight ? sprites.peach.walkRight[walkFrame] : sprites.peach.walkLeft[walkFrame];
    } else {
        // Стояние
        playerSprite = player.facingRight ? sprites.peach.standRight : sprites.peach.standLeft;
    }
    
    // Рисуем игрока с учетом невидимости
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
    }
    
    // Частицы
    particles.forEach(particle => {
        particle.draw(ctx);
    });
    
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
        
        // Корона на флаге
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(10, -30);
        ctx.lineTo(13, -24);
        ctx.lineTo(18, -24);
        ctx.lineTo(14, -20);
        ctx.lineTo(16, -14);
        ctx.lineTo(10, -18);
        ctx.lineTo(4, -14);
        ctx.lineTo(6, -20);
        ctx.lineTo(2, -24);
        ctx.lineTo(7, -24);
        ctx.closePath();
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
        
        // Эффект потери жизни
        for (let i = 0; i < 20; i++) {
            createParticles(player.x + player.width/2, player.y + player.height/2, 3, '#FF69B4');
        }
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
    
    // Фейерверк в розовых тонах
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                10,
                ['#FF69B4', '#FFD700', '#FFB6C1', '#DA70D6'][Math.floor(Math.random() * 4)]
            );
        }, i * 100);
    }
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
            
            // Тень
            ctx.strokeText(this.text, this.x, this.y);
            // Основной текст
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    });
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8 - 2,
            life: 30 + Math.random() * 30,
            color: color,
            size: 2 + Math.random() * 4,
            update: function() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.velocityY += 0.1;
                this.life--;
                this.size *= 0.95;
            },
            draw: function(ctx) {
                ctx.globalAlpha = this.life / 60;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    }
}

function resetGame() {
    initGame();
}

// Запуск игры
loadSprites();

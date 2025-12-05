// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 50,
        startY: 250,
        width: 40,
        height: 60,
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

// Объекты для хранения загруженных изображений
const images = {
    peach: null,
    gift: null,
    flag: null,
    ground: null,
    grass: null,
    platform: null,
    clouds: null,
    background_mountains: null
};

// Спрайты для игры
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
    gifts: {},
    background: {}
};

// Параметры анимации
let animationFrame = 0;
let walkAnimationCounter = 0;
const WALK_ANIMATION_SPEED = 8;

// Функция загрузки изображений
function loadSprites() {
    let loadedCount = 0;
    const totalImages = 8; // Всего изображений для загрузки
    
    function updateProgress() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalImages) * 100);
        loadingElement.textContent = `Загружаем королевство... ${percent}%`;
        
        if (loadedCount === totalImages) {
            setTimeout(() => {
                // После загрузки всех изображений создаем спрайты
                createSpritesFromImages();
                loadingElement.style.display = 'none';
                initGame();
            }, 100);
        }
    }
    
    // Массив изображений для загрузки
    const imageFiles = [
        { name: 'peach', path: 'images/peach.png' },
        { name: 'gift', path: 'images/gift.png' },
        { name: 'flag', path: 'images/flag.png' },
        { name: 'ground', path: 'images/ground.png' },
        { name: 'grass', path: 'images/grass.png' },
        { name: 'platform', path: 'images/platform.png' },
        { name: 'clouds', path: 'images/clouds.png' },
        { name: 'background_mountains', path: 'images/background_mountains.png' }
    ];
    
    // Загружаем все изображения
    imageFiles.forEach(imgData => {
        const img = new Image();
        img.onload = function() {
            images[imgData.name] = img;
            updateProgress();
        };
        img.onerror = function() {
            console.warn(`Не удалось загрузить изображение: ${imgData.path}`);
            // Создаем простой спрайт вместо изображения
            createFallbackSprite(imgData.name);
            updateProgress();
        };
        img.src = imgData.path;
    });
}

// Создание спрайтов из загруженных изображений
function createSpritesFromImages() {
    // Принцесса Пич
    if (images.peach) {
        sprites.peach.standRight = images.peach;
        sprites.peach.standLeft = createMirroredImage(images.peach);
        sprites.peach.walkRight.push(images.peach);
        sprites.peach.walkLeft.push(createMirroredImage(images.peach));
        sprites.peach.jumpRight = images.peach;
        sprites.peach.jumpLeft = createMirroredImage(images.peach);
    } else {
        createFallbackPeachSprites();
    }
    
    // Блоки и платформы
    if (images.ground) {
        sprites.tiles.ground = images.ground;
    } else {
        sprites.tiles.ground = createSimpleSprite(32, 32, '#8B4513', 'ground');
    }
    
    if (images.grass) {
        sprites.tiles.grass = images.grass;
    } else {
        sprites.tiles.grass = createSimpleSprite(32, 32, '#7CFC00', 'grass');
    }
    
    if (images.platform) {
        sprites.tiles.platform = images.platform;
    } else {
        sprites.tiles.platform = createSimpleSprite(32, 32, '#C04000', 'brick');
    }
    
    // Подарки и флаг
    if (images.gift) {
        sprites.gifts.gift = images.gift;
    } else {
        sprites.gifts.gift = createSimpleSprite(30, 30, '#FF4081', 'gift');
    }
    
    if (images.flag) {
        sprites.gifts.flag = images.flag;
    } else {
        sprites.gifts.flag = createSimpleSprite(40, 150, '#FF69B4', 'flag');
    }
    
    // Фон
    if (images.clouds) {
        sprites.background.clouds = images.clouds;
    } else {
        const cloudCanvas = document.createElement('canvas');
        cloudCanvas.width = 80;
        cloudCanvas.height = 40;
        const cloudCtx = cloudCanvas.getContext('2d');
        cloudCtx.fillStyle = '#FFFFFF';
        cloudCtx.beginPath();
        cloudCtx.arc(40, 20, 20, 0, Math.PI * 2);
        cloudCtx.fill();
        sprites.background.clouds = cloudCanvas;
    }
    
    if (images.background_mountains) {
        sprites.background.mountains = images.background_mountains;
    } else {
        const mountainCanvas = document.createElement('canvas');
        mountainCanvas.width = 120;
        mountainCanvas.height = 80;
        const mountainCtx = mountainCanvas.getContext('2d');
        mountainCtx.fillStyle = '#8B4513';
        mountainCtx.beginPath();
        mountainCtx.moveTo(0, 80);
        mountainCtx.lineTo(60, 0);
        mountainCtx.lineTo(120, 80);
        mountainCtx.closePath();
        mountainCtx.fill();
        sprites.background.mountains = mountainCanvas;
    }
    
    // Куст (у нас нет изображения, создаем программно)
    const bushCanvas = document.createElement('canvas');
    bushCanvas.width = 60;
    bushCanvas.height = 40;
    const bushCtx = bushCanvas.getContext('2d');
    bushCtx.fillStyle = '#228B22';
    bushCtx.beginPath();
    bushCtx.arc(30, 20, 20, 0, Math.PI * 2);
    bushCtx.fill();
    sprites.background.bush = bushCanvas;
}

// Функция создания зеркального отражения изображения
function createMirroredImage(originalImage) {
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    
    ctx.translate(originalImage.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(originalImage, 0, 0);
    
    return canvas;
}

// Резервные спрайты (если изображения не загрузились)
function createFallbackSprite(type) {
    switch(type) {
        case 'peach':
            createFallbackPeachSprites();
            break;
        case 'gift':
            images.gift = createSimpleSprite(30, 30, '#FF4081', 'gift');
            break;
        case 'flag':
            images.flag = createSimpleSprite(40, 150, '#FF69B4', 'flag');
            break;
        case 'ground':
            images.ground = createSimpleSprite(32, 32, '#8B4513', 'ground');
            break;
        case 'grass':
            images.grass = createSimpleSprite(32, 32, '#7CFC00', 'grass');
            break;
        case 'platform':
            images.platform = createSimpleSprite(32, 32, '#C04000', 'platform');
            break;
        case 'clouds':
            const cloudCanvas = document.createElement('canvas');
            cloudCanvas.width = 80;
            cloudCanvas.height = 40;
            const cloudCtx = cloudCanvas.getContext('2d');
            cloudCtx.fillStyle = '#FFFFFF';
            cloudCtx.beginPath();
            cloudCtx.arc(40, 20, 20, 0, Math.PI * 2);
            cloudCtx.fill();
            images.clouds = cloudCanvas;
            break;
        case 'background_mountains':
            const mountainCanvas = document.createElement('canvas');
            mountainCanvas.width = 120;
            mountainCanvas.height = 80;
            const mountainCtx = mountainCanvas.getContext('2d');
            mountainCtx.fillStyle = '#8B4513';
            mountainCtx.beginPath();
            mountainCtx.moveTo(0, 80);
            mountainCtx.lineTo(60, 0);
            mountainCtx.lineTo(120, 80);
            mountainCtx.closePath();
            mountainCtx.fill();
            images.background_mountains = mountainCanvas;
            break;
    }
}

function createFallbackPeachSprites() {
    // Создаем простую принцессу Пич
    const peachCanvas = document.createElement('canvas');
    peachCanvas.width = 40;
    peachCanvas.height = 60;
    const peachCtx = peachCanvas.getContext('2d');
    
    // Рисуем принцессу
    peachCtx.fillStyle = '#FF69B4';
    peachCtx.fillRect(10, 20, 20, 30); // Платье
    
    peachCtx.fillStyle = '#FFE4C4';
    peachCtx.beginPath();
    peachCtx.arc(20, 15, 10, 0, Math.PI * 2); // Голова
    peachCtx.fill();
    
    // Корона с тремя треугольниками
    peachCtx.fillStyle = '#FFD700';
    peachCtx.beginPath();
    peachCtx.moveTo(20, 5);
    peachCtx.lineTo(15, 10);
    peachCtx.lineTo(25, 10);
    peachCtx.closePath();
    peachCtx.fill();
    
    peachCtx.beginPath();
    peachCtx.moveTo(12, 7);
    peachCtx.lineTo(7, 12);
    peachCtx.lineTo(17, 12);
    peachCtx.closePath();
    peachCtx.fill();
    
    peachCtx.beginPath();
    peachCtx.moveTo(28, 7);
    peachCtx.lineTo(23, 12);
    peachCtx.lineTo(33, 12);
    peachCtx.closePath();
    peachCtx.fill();
    
    peachCtx.fillRect(7, 12, 26, 2); // Основание короны
    
    images.peach = peachCanvas;
}

function createSimpleSprite(width, height, color, type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);
    
    if (type === 'ground' || type === 'brick') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = darkenColor(color, 30);
        for (let x = 4; x < width; x += 8) {
            ctx.fillRect(x, 0, 2, height);
        }
    } else if (type === 'grass') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    } else if (type === 'gift') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(width/2 - 2, 0, 4, height);
        ctx.fillRect(0, height/2 - 2, width, 4);
    } else if (type === 'flag') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width/2 - 3, 0, 6, height);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(width/2, 30);
        ctx.lineTo(width, 20);
        ctx.lineTo(width/2, 50);
        ctx.closePath();
        ctx.fill();
    }
    
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
    {x: 150, y: 280, width: 96, height: 32, type: 'platform'},
    {x: 320, y: 220, width: 96, height: 32, type: 'platform'},
    {x: 500, y: 280, width: 96, height: 32, type: 'platform'},
    {x: 650, y: 180, width: 64, height: 32, type: 'platform'}
];

// Подарки (5 штук, счет от 1 до 5)
let gifts = [
    {x: 180, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 350, y: 180, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 530, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 680, y: 140, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 750, y: 100, width: 30, height: 30, collected: false, type: 'gift'}
];

let flag = {x: 750, y: 180, width: 40, height: 150, reached: false};

// Фоновые элементы
let clouds = [
    {x: 100, y: 60, width: 80, height: 40},
    {x: 350, y: 80, width: 100, height: 50},
    {x: 600, y: 40, width: 120, height: 60}
];

let mountains = [
    {x: -50, y: 250, width: 120, height: 80},
    {x: 200, y: 270, width: 120, height: 80},
    {x: 500, y: 260, width: 120, height: 80}
];

let bushes = [
    {x: 50, y: CONFIG.world.groundLevel - 30, width: 60, height: 40},
    {x: 300, y: CONFIG.world.groundLevel - 30, width: 80, height: 50},
    {x: 550, y: CONFIG.world.groundLevel - 30, width: 70, height: 45}
];

let score = 0; // Количество собранных подарков
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
    score = 0;
    gameOver = false;
    gameWin = false;
    backgroundOffset = 0;
    
    // Обновляем отображение счета
    updateScoreDisplay();
    
    livesElement.textContent = '👑'.repeat(player.lives);
    messageElement.style.display = 'none';
    floatingMessages = [];
    
    gameLoop();
}

// Функция для обновления отображения счета
function updateScoreDisplay() {
    scoreElement.textContent = `${score}/${gifts.length}`;
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
    
    // Сбор подарков
    gifts.forEach((gift, index) => {
        if (!gift.collected &&
            player.x < gift.x + gift.width &&
            player.x + player.width > gift.x &&
            player.y < gift.y + gift.height &&
            player.y + player.height > gift.y) {
            
            gift.collected = true;
            score++; // Увеличиваем на 1
            updateScoreDisplay(); // Обновляем отображение
            
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
        if (score === gifts.length) {
            gameWin = true;
        } else {
            messageElement.textContent = `Сначала собери все подарки! (${score}/${gifts.length})`;
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
    
    // Горы
    mountains.forEach(mountain => {
        if (sprites.background.mountains) {
            ctx.drawImage(sprites.background.mountains, mountain.x, mountain.y, mountain.width, mountain.height);
        }
    });
    
    // Облака
    clouds.forEach(cloud => {
        if (sprites.background.clouds) {
            ctx.drawImage(sprites.background.clouds, cloud.x, cloud.y, cloud.width, cloud.height);
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
            if (sprites.tiles.ground) {
                for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                    ctx.drawImage(sprites.tiles.ground, x, platform.y, 32, 32);
                }
            }
            
            // Трава сверху
            if (sprites.tiles.grass) {
                for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                    ctx.drawImage(sprites.tiles.grass, x, platform.y - 10, 32, 20);
                }
            }
        } else if (platform.type === 'platform' && sprites.tiles.platform) {
            // Платформы
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                ctx.drawImage(sprites.tiles.platform, x, platform.y, 32, 32);
            }
            
            // Трава на платформах
            if (sprites.tiles.grass) {
                ctx.drawImage(sprites.tiles.grass, platform.x, platform.y - 5, platform.width, 5);
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
        `Все ${gifts.length} подарков собраны!`,
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

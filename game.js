// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 50,
        startY: 250,
        width: 120,   // Принцесса в 3 раза больше
        height: 180,
        speed: 5,
        jumpForce: 16, // Увеличим для большей прыгучести
        lives: 3
    },
    gravity: 0.8,
    world: {
        groundLevel: 350,
        skyColor: '#87CEEB', // Более светлое небо
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
    platform: null,
    clouds: null,
    background_mountains: null
};

// Размеры спрайтов после масштабирования
const spriteSizes = {
    peach: { width: 120, height: 180 },     // В 3 раза больше
    gift: { width: 30, height: 30 },        // Без изменений
    flag: { width: 40, height: 150 },       // Без изменений
    ground: { width: 32, height: 32 },      // Без изменений
    platform: { width: 32, height: 32 },    // Островки обратно в 1x
    clouds: { width: 80, height: 40 },      // Без изменений
    background_mountains: { width: 240, height: 200 } // Выше в 2 раза
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

// Птички для анимации
const birds = [];
let lastBirdTime = 0;
const BIRD_INTERVAL = 2000; // Птичка каждые 2 секунды

// Параметры анимации
let animationFrame = 0;
let walkAnimationCounter = 0;
const WALK_ANIMATION_SPEED = 8;

// Функция загрузки изображений
function loadSprites() {
    let loadedCount = 0;
    const totalImages = 7; // Теперь 7 изображений (без травы)
    
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
    
    // Массив изображений для загрузки (без grass)
    const imageFiles = [
        { name: 'peach', path: 'images/peach.png' },
        { name: 'gift', path: 'images/gift.png' },
        { name: 'flag', path: 'images/flag.png' },
        { name: 'ground', path: 'images/ground.png' },
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
            createFallbackSprite(imgData.name);
            updateProgress();
        };
        img.src = imgData.path;
    });
}

// Создание спрайтов из загруженных изображений
function createSpritesFromImages() {
    // Принцесса Пич (увеличиваем в 3 раза)
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
        mountainCanvas.width = 240;
        mountainCanvas.height = 200;
        const mountainCtx = mountainCanvas.getContext('2d');
        mountainCtx.fillStyle = '#8B4513';
        mountainCtx.beginPath();
        mountainCtx.moveTo(0, 200);
        mountainCtx.lineTo(120, 0);
        mountainCtx.lineTo(240, 200);
        mountainCtx.closePath();
        mountainCtx.fill();
        sprites.background.mountains = mountainCanvas;
    }
}

// Функция создания птички
function createBird() {
    return {
        x: -20, // Начинаем за экраном слева
        y: 30 + Math.random() * 100, // Случайная высота
        width: 20,
        height: 15,
        speed: 1.5 + Math.random() * 1, // Случайная скорость
        wingPhase: Math.random() * Math.PI * 2, // Фаза взмаха крыльев
        wingSpeed: 0.1 + Math.random() * 0.1,
        color: ['#8B4513', '#A0522D', '#D2691E'][Math.floor(Math.random() * 3)],
        update: function() {
            this.x += this.speed;
            this.wingPhase += this.wingSpeed;
            return this.x < canvas.width + 50; // Удаляем, если улетела за правый край
        },
        draw: function(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Тело птички
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Крылья
            const wingHeight = Math.sin(this.wingPhase) * 5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-8, wingHeight);
            ctx.lineTo(8, wingHeight);
            ctx.closePath();
            ctx.fill();
            
            // Клюв
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(this.width/2, 0);
            ctx.lineTo(this.width/2 + 5, -2);
            ctx.lineTo(this.width/2 + 5, 2);
            ctx.closePath();
            ctx.fill();
            
            // Глаз
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(3, -3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    };
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
            mountainCanvas.width = 240;
            mountainCanvas.height = 200;
            const mountainCtx = mountainCanvas.getContext('2d');
            mountainCtx.fillStyle = '#8B4513';
            mountainCtx.beginPath();
            mountainCtx.moveTo(0, 200);
            mountainCtx.lineTo(120, 0);
            mountainCtx.lineTo(240, 200);
            mountainCtx.closePath();
            mountainCtx.fill();
            images.background_mountains = mountainCanvas;
            break;
    }
}

function createFallbackPeachSprites() {
    // Создаем простую принцессу Пич (в 3 раза больше)
    const peachCanvas = document.createElement('canvas');
    peachCanvas.width = 120;
    peachCanvas.height = 180;
    const peachCtx = peachCanvas.getContext('2d');
    
    // Рисуем принцессу в увеличенном размере
    peachCtx.fillStyle = '#FF69B4';
    peachCtx.fillRect(30, 60, 60, 90);
    
    peachCtx.fillStyle = '#FFE4C4';
    peachCtx.beginPath();
    peachCtx.arc(60, 45, 30, 0, Math.PI * 2);
    peachCtx.fill();
    
    // Корона с тремя треугольниками
    peachCtx.fillStyle = '#FFD700';
    peachCtx.beginPath();
    peachCtx.moveTo(60, 15);
    peachCtx.lineTo(45, 30);
    peachCtx.lineTo(75, 30);
    peachCtx.closePath();
    peachCtx.fill();
    
    peachCtx.beginPath();
    peachCtx.moveTo(36, 21);
    peachCtx.lineTo(21, 36);
    peachCtx.lineTo(51, 36);
    peachCtx.closePath();
    peachCtx.fill();
    
    peachCtx.beginPath();
    peachCtx.moveTo(84, 21);
    peachCtx.lineTo(69, 36);
    peachCtx.lineTo(99, 36);
    peachCtx.closePath();
    peachCtx.fill();
    
    peachCtx.fillRect(21, 36, 78, 6);
    
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
    y: CONFIG.world.groundLevel - CONFIG.player.height, // Ставим на землю
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    velocityX: 0,
    velocityY: 0,
    isOnGround: true,
    facingRight: true,
    lives: CONFIG.player.lives,
    invincible: false,
    invincibleTimer: 0,
    isJumping: false
};

// Платформы (островки обратно в нормальный размер)
let platforms = [
    // Основная земля
    {x: 0, y: CONFIG.world.groundLevel, width: 800, height: 32, type: 'ground'},
    // Летающие островки (нормальный размер)
    {x: 150, y: 280, width: 96, height: 32, type: 'platform'},
    {x: 320, y: 220, width: 96, height: 32, type: 'platform'},
    {x: 500, y: 280, width: 96, height: 32, type: 'platform'},
    {x: 650, y: 180, width: 64, height: 32, type: 'platform'}
];

// Подарки
let gifts = [
    {x: 180, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 350, y: 180, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 530, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 680, y: 140, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 750, y: 100, width: 30, height: 30, collected: false, type: 'gift'}
];

// Флаг (низ соприкасается с землей)
let flag = {x: 750, y: CONFIG.world.groundLevel - 150, width: 40, height: 150, reached: false};

// Фоновые элементы
let clouds = [
    {x: 100, y: 60, width: 80, height: 40},
    {x: 350, y: 80, width: 100, height: 50},
    {x: 600, y: 40, width: 120, height: 60}
];

// Горы (выше в 2 раза)
let mountains = [
    {x: -50, y: 150, width: 240, height: 200},
    {x: 200, y: 170, width: 240, height: 200},
    {x: 500, y: 160, width: 240, height: 200}
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
        y: CONFIG.world.groundLevel - CONFIG.player.height,
        width: CONFIG.player.width,
        height: CONFIG.player.height,
        velocityX: 0,
        velocityY: 0,
        isOnGround: true,
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
    birds.length = 0;
    lastBirdTime = 0;
    
    updateScoreDisplay();
    livesElement.textContent = '👑'.repeat(player.lives);
    messageElement.style.display = 'none';
    floatingMessages = [];
    
    gameLoop();
}

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
    
    // Столкновение с платформами (более точная проверка)
    player.isOnGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 10) { // Узкая зона для "стояния"
            
            // Корректировка позиции для точного стояния
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
            player.isJumping = false;
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
            score++;
            updateScoreDisplay();
            
            showFloatingMessage(
                peachMessages[index % peachMessages.length], 
                gift.x + gift.width/2, 
                gift.y
            );
            
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
    
    // Обновление птичек
    const now = Date.now();
    if (now - lastBirdTime > BIRD_INTERVAL) {
        birds.push(createBird());
        lastBirdTime = now;
    }
    
    for (let i = birds.length - 1; i >= 0; i--) {
        if (!birds[i].update()) {
            birds.splice(i, 1);
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Градиентное небо (от светло-голубого к белому)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.6, '#B0E2FF');
    skyGradient.addColorStop(1, '#FFFFFF');
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Солнце
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 60, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Лучи солнца
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(
            700 + Math.cos(angle) * 40,
            60 + Math.sin(angle) * 40
        );
        ctx.lineTo(
            700 + Math.cos(angle) * 60,
            60 + Math.sin(angle) * 60
        );
        ctx.stroke();
    }
    
    // Горы (высокие)
    mountains.forEach(mountain => {
        if (sprites.background.mountains) {
            ctx.drawImage(
                sprites.background.mountains, 
                mountain.x, 
                mountain.y, 
                mountain.width, 
                mountain.height
            );
        }
    });
    
    // Облака
    clouds.forEach(cloud => {
        if (sprites.background.clouds) {
            ctx.drawImage(
                sprites.background.clouds, 
                cloud.x, 
                cloud.y, 
                cloud.width, 
                cloud.height
            );
        }
    });
    
    // Птички
    birds.forEach(bird => {
        bird.draw(ctx);
    });
    
    // Коричневый фон под землей
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CONFIG.world.groundLevel + 32, canvas.width, canvas.height - CONFIG.world.groundLevel - 32);
    
    // Платформы
    platforms.forEach(platform => {
        if (platform.type === 'ground') {
            // Земля
            if (sprites.tiles.ground) {
                for (let x = platform.x; x < platform.x + platform.width; x += spriteSizes.ground.width) {
                    ctx.drawImage(
                        sprites.tiles.ground, 
                        x, 
                        platform.y, 
                        spriteSizes.ground.width, 
                        spriteSizes.ground.height
                    );
                }
            }
        } else if (platform.type === 'platform' && sprites.tiles.platform) {
            // Летающие островки
            for (let x = platform.x; x < platform.x + platform.width; x += spriteSizes.platform.width) {
                ctx.drawImage(
                    sprites.tiles.platform, 
                    x, 
                    platform.y, 
                    spriteSizes.platform.width, 
                    spriteSizes.platform.height
                );
            }
        }
    });
    
    // Подарки
    gifts.forEach(gift => {
        if (!gift.collected && sprites.gifts.gift) {
            const floatOffset = Math.sin(Date.now() / 300 + gift.x * 0.1) * 5;
            ctx.drawImage(
                sprites.gifts.gift, 
                gift.x, 
                gift.y + floatOffset, 
                gift.width, 
                gift.height
            );
            
            if (Math.sin(Date.now() / 200) > 0) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(gift.x, gift.y + floatOffset, gift.width, gift.height);
                ctx.globalAlpha = 1;
            }
        }
    });
    
    // Флаг (низ на земле)
    if (sprites.gifts.flag) {
        ctx.drawImage(
            sprites.gifts.flag, 
            flag.x, 
            flag.y, 
            flag.width, 
            flag.height
        );
    }
    
    // Игрок (принцесса Пич)
    let playerSprite;
    if (!player.isOnGround) {
        playerSprite = player.facingRight ? sprites.peach.jumpRight : sprites.peach.jumpLeft;
    } else if (player.velocityX !== 0) {
        const walkFrame = Math.floor(walkAnimationCounter / WALK_ANIMATION_SPEED) % sprites.peach.walkRight.length;
        playerSprite = player.facingRight ? sprites.peach.walkRight[walkFrame] : sprites.peach.walkLeft[walkFrame];
    } else {
        playerSprite = player.facingRight ? sprites.peach.standRight : sprites.peach.standLeft;
    }
    
    if (playerSprite && (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0)) {
        ctx.drawImage(
            playerSprite, 
            player.x, 
            player.y, 
            spriteSizes.peach.width, 
            spriteSizes.peach.height
        );
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
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(10, -30);
        ctx.lineTo(7, -25);
        ctx.lineTo(13, -25);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(4, -28);
        ctx.lineTo(1, -23);
        ctx.lineTo(7, -23);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(16, -28);
        ctx.lineTo(13, -23);
        ctx.lineTo(19, -23);
        ctx.closePath();
        ctx.fill();
        
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
        player.y = CONFIG.world.groundLevel - CONFIG.player.height;
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

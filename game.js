// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 80,
        startY: 80,
        width: 60,
        height: 80,
        speed: 5,
        jumpForce: 16,
        lives: 3
    },
    gravity: 0.8,
    world: {
        groundLevel: 350,
        skyColor: '#87CEEB',
        backgroundSpeed: 0.5
    }
};

// ===================== АУДИО =====================
const audio = {
    backgroundMusic: null,
    jumpSound: null,
    collectSound: null,
    winSound: null,
    hurtSound: null,
    
    init: function() {
        // Фоновая музыка
        this.backgroundMusic = document.getElementById('backgroundMusic');
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.3;
            this.backgroundMusic.loop = true;
        }
        
        // Создаем звуковые эффекты
        this.createSounds();
    },
    
    createSounds: function() {
        // Звук прыжка
        this.jumpSound = this.createBeepSound(523.25, 0.1); // До
        this.collectSound = this.createBeepSound(659.25, 0.2); // Ми
        this.winSound = this.createBeepSound(783.99, 0.5); // Соль
        this.hurtSound = this.createBeepSound(220, 0.3); // Ля низкое
    },
    
    createBeepSound: function(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        return { frequency, duration };
    },
    
    playJump: function() {
        if (this.jumpSound) this.createBeepSound(this.jumpSound.frequency, this.jumpSound.duration);
    },
    
    playCollect: function() {
        if (this.collectSound) this.createBeepSound(this.collectSound.frequency, this.collectSound.duration);
    },
    
    playWin: function() {
        if (this.winSound) {
            // Воспроизводим аккорд победы
            this.createBeepSound(783.99, 0.3); // Соль
            setTimeout(() => this.createBeepSound(659.25, 0.3), 100); // Ми
            setTimeout(() => this.createBeepSound(523.25, 0.5), 200); // До
        }
    },
    
    playHurt: function() {
        if (this.hurtSound) this.createBeepSound(this.hurtSound.frequency, this.hurtSound.duration);
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
    "Пусть сбывается всё задуманное! 👑",
    "Пусть всё получается, как мечтается! 💖",
    "Напоминание: ты любима всем окружением! ✨",
    "Дальше — лучше! ❤️",
    "Мудрейшая! 🦉",
    "Всех высот. Ты этого достойна! 🏰",
    "Любимая, ценная, единственная! 🏡",
    "Твой внутренний свет непобедим! ☀️",
    "Твоя сила в доброте! 💪",
    "Твоя улыбка — твоя сила! 🌸"
];

// Объекты для хранения загруженных изображений
const images = {
    peach: null,
    gift: null,
    flag: null,
    ground: null,
    platform: null,
    clouds: null,
    background_mountains: null,
    grass: null,
    dog: null // Добавили собаку
};

// Размеры спрайтов
const spriteSizes = {
    peach: { width: 120, height: 180 },
    gift: { width: 30, height: 30 },
    flag: { width: 40, height: 150 },
    ground: { width: 32, height: 32 },
    platform: { width: 32, height: 32 },
    clouds: { width: 80, height: 40 },
    background_mountains: { width: 240, height: 200 },
    grass: { width: 32, height: 66 },
    dog: { width: 80, height: 53 } // 2/3 от игрока (120*2/3=80, 180*2/3=120, но сделаем поменьше в высоту)
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
    background: {},
    dog: { // Добавили спрайты собаки
        runRight: null,
        runLeft: null,
        idleRight: null,
        idleLeft: null
    }
};

// Птички для анимации (буква V)
const birds = [];
let lastBirdTime = 0;
const BIRD_INTERVAL = 2500;

// Параметры анимации
let animationFrame = 0;
let walkAnimationCounter = 0;
const WALK_ANIMATION_SPEED = 8;

// Функция загрузки изображений
function loadSprites() {
    let loadedCount = 0;
    const totalImages = 9; // Увеличили на 1 для собаки
    
    function updateProgress() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalImages) * 100);
        loadingElement.textContent = `Загружаем королевство... ${percent}%`;
        
        if (loadedCount === totalImages) {
            setTimeout(() => {
                createSpritesFromImages();
                loadingElement.style.display = 'none';
                initGame();
            }, 100);
        }
    }
    
    const imageFiles = [
        { name: 'peach', path: 'images/peach.png' },
        { name: 'gift', path: 'images/gift.png' },
        { name: 'flag', path: 'images/flag.png' },
        { name: 'ground', path: 'images/ground.png' },
        { name: 'platform', path: 'images/platform.png' },
        { name: 'clouds', path: 'images/clouds.png' },
        { name: 'background_mountains', path: 'images/background_mountains.png' },
        { name: 'grass', path: 'images/grass.png' },
        { name: 'dog', path: 'images/dog.png' } // Добавили собаку
    ];
    
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
    
    // Собака
    if (images.dog) {
        sprites.dog.runRight = images.dog;
        sprites.dog.runLeft = createMirroredImage(images.dog);
        sprites.dog.idleRight = images.dog;
        sprites.dog.idleLeft = createMirroredImage(images.dog);
    } else {
        createFallbackDogSprites();
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
    
    // Трава
    if (images.grass) {
        sprites.tiles.grass = images.grass;
    } else {
        sprites.tiles.grass = createSimpleSprite(32, 66, '#7CFC00', 'grass');
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

// Функция проверки коллизии (столкновения)
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Функция создания птички в виде буквы V
function createVBird() {
    return {
        x: -30,
        y: 50 + Math.random() * 120,
        width: 20,
        height: 15,
        speed: 1 + Math.random() * 1.5,
        wingAngle: Math.random() * Math.PI / 4,
        wingSpeed: 0.15 + Math.random() * 0.1,
        angle: (Math.random() - 0.5) * 0.3,
        angleSpeed: 0.02 + Math.random() * 0.02,
        color: ['#8B4513', '#A0522D', '#D2691E', '#5D2906'][Math.floor(Math.random() * 4)],
        update: function() {
            this.x += this.speed;
            this.wingAngle = Math.PI/6 + Math.sin(Date.now() / 200 + this.x * 0.1) * Math.PI/12;
            this.angle = Math.sin(Date.now() / 500 + this.x * 0.05) * 0.2;
            return this.x < canvas.width + 50;
        },
        draw: function(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            // Левое крыло
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const leftWingX = Math.cos(this.wingAngle) * 15;
            const leftWingY = Math.sin(this.wingAngle) * 15;
            ctx.lineTo(-leftWingX, leftWingY);
            ctx.stroke();
            
            // Правое крыло
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const rightWingX = Math.cos(this.wingAngle) * 15;
            const rightWingY = Math.sin(this.wingAngle) * 15;
            ctx.lineTo(-rightWingX, -rightWingY);
            ctx.stroke();
            
            // Тело
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(8, 0);
            ctx.stroke();
            
            // Глаз
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(4, -2, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Клюв
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(12, -3);
            ctx.lineTo(12, 3);
            ctx.closePath();
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

// Резервные спрайты
function createFallbackSprite(type) {
    switch(type) {
        case 'peach':
            createFallbackPeachSprites();
            break;
        case 'dog':
            createFallbackDogSprites();
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
        case 'grass':
            images.grass = createSimpleSprite(32, 66, '#7CFC00', 'grass');
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
    const peachCanvas = document.createElement('canvas');
    peachCanvas.width = 120;
    peachCanvas.height = 180;
    const peachCtx = peachCanvas.getContext('2d');
    
    peachCtx.fillStyle = '#FF69B4';
    peachCtx.fillRect(30, 60, 60, 90);
    
    peachCtx.fillStyle = '#FFE4C4';
    peachCtx.beginPath();
    peachCtx.arc(60, 45, 30, 0, Math.PI * 2);
    peachCtx.fill();
    
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

function createFallbackDogSprites() {
    const dogCanvas = document.createElement('canvas');
    dogCanvas.width = 80;
    dogCanvas.height = 53;
    const dogCtx = dogCanvas.getContext('2d');
    
    // Простая собачка
    dogCtx.fillStyle = '#8B4513'; // Коричневый цвет
    dogCtx.fillRect(20, 20, 40, 25); // Тело
    
    // Голова
    dogCtx.fillStyle = '#A0522D'; // Светло-коричневый
    dogCtx.fillRect(10, 15, 20, 15);
    
    // Уши
    dogCtx.fillStyle = '#5D2906'; // Темно-коричневый
    dogCtx.fillRect(8, 10, 8, 8);
    dogCtx.fillRect(24, 10, 8, 8);
    
    // Лапы
    dogCtx.fillStyle = '#8B4513';
    dogCtx.fillRect(15, 45, 8, 8);
    dogCtx.fillRect(30, 45, 8, 8);
    dogCtx.fillRect(45, 45, 8, 8);
    dogCtx.fillRect(60, 45, 8, 8);
    
    // Хвост
    dogCtx.fillStyle = '#A0522D';
    dogCtx.fillRect(65, 25, 10, 5);
    
    // Глаза
    dogCtx.fillStyle = '#000000';
    dogCtx.fillRect(15, 20, 3, 3);
    dogCtx.fillRect(25, 20, 3, 3);
    
    // Нос
    dogCtx.fillRect(12, 25, 5, 3);
    
    images.dog = dogCanvas;
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
        
        ctx.fillStyle = darkenColor(color, 20);
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(i * 4, height - 10 + Math.sin(i) * 3, 2, 10);
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

// Собака
let dog = {
    x: CONFIG.player.startX - 150, // Начинаем позади игрока
    y: CONFIG.world.groundLevel - 53, // На земле
    width: spriteSizes.dog.width,
    height: spriteSizes.dog.height,
    speed: 3, // Скорость собаки
    followDistance: 100, // Дистанция для начала преследования
    isFollowing: false
};

// Платформы (только ground и platform)
let platforms = [
    {x: 0, y: CONFIG.world.groundLevel, width: 800, height: 32, type: 'ground'},
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

// Флаг (низ на земле)
let flag = {x: 750, y: CONFIG.world.groundLevel - 150, width: 40, height: 150, reached: false};

// Фоновые элементы
let clouds = [
    {x: 100, y: 60, width: 80, height: 40},
    {x: 350, y: 80, width: 100, height: 50},
    {x: 600, y: 40, width: 120, height: 60}
];

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
    
    // Инициализация собаки
    dog = {
        x: CONFIG.player.startX - 150,
        y: CONFIG.world.groundLevel - 53,
        width: spriteSizes.dog.width,
        height: spriteSizes.dog.height,
        speed: 3,
        followDistance: 100,
        isFollowing: false
    };
    
    // Инициализируем игрока на земле
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            player.y = platform.y - player.height;
            player.isOnGround = true;
        }
    });
    
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
    update();
    draw();
    animationFrame++;
    requestAnimationFrame(gameLoop);
}

function update() {
    // Если игра окончена или выиграна, не обновляем логику
    if (gameOver || gameWin) {
        return;
    }
    
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
    
    // Сохраняем старую позицию для коррекции
    let oldX = player.x;
    let oldY = player.y;
    
    // Пробуем двигаться по X
    player.x += player.velocityX;
    
    // Проверяем столкновение с платформами по X
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Если столкнулись по горизонтали, возвращаем старую позицию
            if (player.velocityX > 0) {
                // Двигались вправо
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) {
                // Двигались влево
                player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
        }
    });
    
    // Пробуем двигаться по Y
    player.y += player.velocityY;
    
    // Проверяем столкновение с платформами по Y
    player.isOnGround = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0) {
                // Падаем вниз - ставим на платформу
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isOnGround = true;
                player.isJumping = false;
            } else if (player.velocityY < 0) {
                // Прыгаем вверх - ударяемся головой
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }
    });
    
    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Проверка падения
    if (player.y > canvas.height) {
        loseLife();
        return;
    }
    
    // Обновление собаки
    updateDog();
    
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
                }, 3000);
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
            showWinMessage();
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
        birds.push(createVBird());
        lastBirdTime = now;
    }
    
    for (let i = birds.length - 1; i >= 0; i--) {
        if (!birds[i].update()) {
            birds.splice(i, 1);
        }
    }
}

// Функция обновления собаки
function updateDog() {
    // Проверяем, далеко ли игрок от собаки
    const distanceToPlayer = Math.abs(player.x - dog.x);
    
    // Если игрок далеко, собака начинает преследовать
    if (distanceToPlayer > dog.followDistance) {
        dog.isFollowing = true;
        
        // Определяем направление движения
        if (player.x > dog.x) {
            // Игрок справа - идем вправо
            dog.x += dog.speed;
        } else {
            // Игрок слева - идем влево
            dog.x -= dog.speed;
        }
    } else {
        dog.isFollowing = false;
    }
    
    // Ограничиваем собаку в пределах экрана
    if (dog.x < 0) dog.x = 0;
    if (dog.x > canvas.width - dog.width) dog.x = canvas.width - dog.width;
    
    // Собака всегда на земле
    dog.y = CONFIG.world.groundLevel - dog.height;
}

function draw() {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Градиентное небо
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
    
    // Птички (новые V-образные)
    birds.forEach(bird => {
        bird.draw(ctx);
    });
    
    // Коричневый фон под землей
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CONFIG.world.groundLevel, canvas.width, canvas.height - CONFIG.world.groundLevel);
    
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
    
    // Трава поверх земли
    if (sprites.tiles.grass) {
        platforms.forEach(platform => {
            if (platform.type === 'ground') {
                for (let x = platform.x; x < platform.x + platform.width; x += spriteSizes.grass.width) {
                    ctx.drawImage(
                        sprites.tiles.grass, 
                        x, 
                        CONFIG.world.groundLevel - spriteSizes.grass.height + 10,
                        spriteSizes.grass.width, 
                        spriteSizes.grass.height
                    );
                }
            }
        });
    }
    
    // Собака (рисуется перед игроком)
    if (sprites.dog) {
        // Определяем, в какую сторону смотрит собака (по направлению к игроку)
        const dogFacingRight = player.x > dog.x;
        const dogSprite = dogFacingRight ? sprites.dog.runRight : sprites.dog.runLeft;
        
        if (dogSprite) {
            ctx.drawImage(
                dogSprite, 
                dog.x, 
                dog.y, 
                dog.width, 
                dog.height
            );
        }
    }
    
    // Игрок
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
        player.y = CONFIG.player.startY;
        player.velocityX = 0;
        player.velocityY = 0;
        
        // Собака также возвращается к игроку при возрождении
        dog.x = CONFIG.player.startX - 150;
        dog.y = CONFIG.world.groundLevel - 53;
        
        // Ставим игрока на платформу при возрождении
        platforms.forEach(platform => {
            if (checkCollision(player, platform)) {
                player.y = platform.y - player.height;
                player.isOnGround = true;
            }
        });
    }
}

function showWinMessage() {
    const messages = [
        "🎊 ПОБЕДА! 🎊",
        "Когда мы чего-то хотим, обычно не хватает или времени, или ресурсов,",
        `Сегодня все ${gifts.length} крестражей памяти собраны,`,
        "Так пусть, как сейчас, всё будет в достатке в нужный момент!"
    ];
    
    let message = messages[0];
    messageElement.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 1.5em; color: #FF69B4;">${message}</div>
        <div style="font-size: 0.8em; color: #8B4513;">${messages.slice(1).join('<br>')}</div>
        <div style="margin-top: 20px; font-size: 0.7em;">Нажми R или кнопку для новой игры</div>
    `;
    messageElement.style.display = 'block';
    
    // Автоматически скрыть сообщение через 3 секунды
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 4000);
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
        life: 180, // 180 кадров = 3 секунды при 60 FPS
        velocityY: -2,
        opacity: 1,
        update: function() {
            this.y += this.velocityY;
            this.life--;
            this.opacity = this.life / 180;
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

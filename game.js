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
    
    // 3. С

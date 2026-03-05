// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');

// 蛇和食物变量
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 120; // 初始速度
let gameInterval;

// 键盘控制
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const keyPressed = event.key;

    // 防止反向移动
    if (keyPressed === 'ArrowUp' && direction !== 'down') {
        nextDirection = 'up';
    } else if (keyPressed === 'ArrowDown' && direction !== 'up') {
        nextDirection = 'down';
    } else if (keyPressed === 'ArrowLeft' && direction !== 'right') {
        nextDirection = 'left';
    } else if (keyPressed === 'ArrowRight' && direction !== 'left') {
        nextDirection = 'right';
    }
}

// 生成随机食物位置
function generateFood() {
    // 确保食物不在蛇身上
    let newFood;
    let onSnake;

    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / 20)),
            y: Math.floor(Math.random() * (canvas.height / 20))
        };

        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);

    return newFood;
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇头（不同颜色）
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(snake[0].x * 20, snake[0].y * 20, 20, 20);

    // 绘制蛇身
    ctx.fillStyle = '#8BC34A';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * 20, snake[i].y * 20, 20, 20);
    }

    // 添加蛇头的眼睛
    ctx.fillStyle = '#000';
    // 根据方向绘制眼睛
    if (direction === 'right') {
        ctx.fillRect((snake[0].x * 20) + 14, (snake[0].y * 20) + 5, 3, 3);
        ctx.fillRect((snake[0].x * 20) + 14, (snake[0].y * 20) + 12, 3, 3);
    } else if (direction === 'left') {
        ctx.fillRect((snake[0].x * 20) + 3, (snake[0].y * 20) + 5, 3, 3);
        ctx.fillRect((snake[0].x * 20) + 3, (snake[0].y * 20) + 12, 3, 3);
    } else if (direction === 'up') {
        ctx.fillRect((snake[0].x * 20) + 5, (snake[0].y * 20) + 3, 3, 3);
        ctx.fillRect((snake[0].x * 20) + 12, (snake[0].y * 20) + 3, 3, 3);
    } else if (direction === 'down') {
        ctx.fillRect((snake[0].x * 20) + 5, (snake[0].y * 20) + 14, 3, 3);
        ctx.fillRect((snake[0].x * 20) + 12, (snake[0].y * 20) + 14, 3, 3);
    }
}

// 绘制食物
function drawFood() {
    // 创建渐变效果
    const gradient = ctx.createRadialGradient(
        food.x * 20 + 10,
        food.y * 20 + 10,
        1,
        food.x * 20 + 10,
        food.y * 20 + 10,
        10
    );
    gradient.addColorStop(0, '#FFEB3B');
    gradient.addColorStop(1, '#F44336');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 9, 0, Math.PI * 2);
    ctx.fill();

    // 添加发光效果
    ctx.shadowColor = '#FFEB3B';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// 移动蛇
function moveSnake() {
    direction = nextDirection;

    // 复制蛇头
    const head = {...snake[0]};

    // 根据方向移动蛇头
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }

    // 检查碰撞边界
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width / 20 ||
        head.y >= canvas.height / 20
    ) {
        gameOver();
        return;
    }

    // 检查碰撞自己
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }

    // 将新头部添加到蛇身
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;

        // 生成新食物
        food = generateFood();

        // 增加游戏速度（最高限制）
        if (gameSpeed > 60) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        // 创建粒子效果
        createParticles(food.x * 20 + 10, food.y * 20 + 10);
    } else {
        // 移除尾部
        snake.pop();
    }
}

// 创建粒子效果
function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        document.body.appendChild(particle);

        // 随机方向和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const duration = 500 + Math.random() * 500;

        // 使用CSS动画
        particle.animate([
            { transform: `translate(0, 0)`, opacity: 1 },
            { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        });

        // 移除粒子
        setTimeout(() => {
            particle.remove();
        }, duration);
    }
}

// 游戏循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    drawGrid();

    // 移动蛇
    moveSnake();

    // 绘制蛇和食物
    drawSnake();
    drawFood();
}

// 绘制网格背景
function drawGrid() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;

    // 垂直线
    for (let x = 0; x <= canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // 水平线
    for (let y = 0; y <= canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = 120;

    // 更新UI
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';

    // 重新开始游戏循环
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 开始游戏
food = generateFood();
gameInterval = setInterval(gameLoop, gameSpeed);
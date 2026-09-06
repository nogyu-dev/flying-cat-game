const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageNames = ['bird', 'cactus', 'cat'];

// グローバルな game オブジェクト
const game = {
    enemys: [],
    image: {},
    isGameOver: true,
    score: 0,
    timer: null
};

// 複数画像読み込み
let imageLoadCounter = 0;
for (const imageName of imageNames) {
    const imagePath = `image/${imageName}.png`;
    game.image[imageName] = new Image();
    game.image[imageName].src = imagePath;
    game.image[imageName].onload = () => {
        imageLoadCounter += 1;
        if (imageLoadCounter === imageNames.length) {
            console.log('画像のロードが完了しました。');
            init();
        }
    }
}

function init() {
    game.enemys     = [];
    game.isGameOver = false;
    game.score      = 0;
    createCat();
    game.timer = setInterval(ticker, 30);
}

function ticker() {
    // 画面クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 敵キャラクターの生成
    if(Math.floor(Math.random() * (100 - game.score / 100)) === 0) {
        createCactus();
    }
    if(Math.floor(Math.random() * (200 - game.score / 100)) === 0) {
        createBird();
    }

    // キャクターの移動
    moveCat(); // 猫の移動
    moveEnemys(); // 敵キャラクターの移動

    //描画
    drawCat();// 猫の描画
    drawEnemys(); // 敵キャラクターの描画
    drawScore(); // スコアの描画

    // あたり判定
    hitCheck();

    // カウンターの更新
    game.score += 1;
}

function createCat() {
    game.cat = {
        x: 100,
        y: canvas.height / 2,
        moveY: 0,
        width: 150,
        height: 100,
        image: game.image.cat
    }
}

function createCactus() {
    game.enemys.push({
        x: canvas.width + game.image.cactus.width / 2,
        y: canvas.height - game.image.cactus.height / 2,
        width: game.image.cactus.width,
        height: game.image.cactus.height,
        moveX: -10,
        image: game.image.cactus
    });
}

function createBird() {
    const birdY = Math.random() * (300 - game.image.bird.height) + 150;
    game.enemys.push({
        x: canvas.width + game.image.bird.width / 2,
        y: birdY,
        width: game.image.bird.width,
        height: game.image.bird.height,
        moveX: -15,
        image: game.image.bird
    });
}

function moveCat() {
    game.cat.y += game.cat.moveY;
        game.cat.moveY += 0.5;
            // 画面の上から出ないようにする
    if (game.cat.y < game.cat.height / 2) {
        game.cat.y = game.cat.height / 2;
       game.cat.moveY = 0;
    }
    // 画面の下から出ないようにする
    if (game.cat.y > canvas.height - game.cat.height / 2) {
        game.cat.y = canvas.height - game.cat.height / 2;
        game.cat.moveY = 0;
    }
    }

function moveEnemys() {
    for (const enemy of game.enemys) {
        enemy.x += enemy.moveX;
    }
    // 画面の外に出たキャラクターを配列から削除
    game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}

function drawCat() {
    ctx.drawImage(game.image.cat, game.cat.x - game.cat.width / 2, game.cat.y - game.cat.height / 2,
      game.cat.width,game.cat.height);
}

function drawEnemys() {
    for (const enemy of game.enemys) {
        ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
    }
}

function drawScore() {
    ctx.font = '24px serif';
    ctx.fillText(`score: ${game.score}`, 0, 30);
}

function hitCheck() {
    for (const enemy of game.enemys) {
        if (
            Math.abs(game.cat.x - enemy.x) < game.cat.width / 2 + enemy.width / 2 &&
            Math.abs(game.cat.y - enemy.y) < game.cat.height / 2 + enemy.height  / 2
        ) {
            game.isGameOver = true;
            ctx.font = 'bold 100px serif';
            ctx.fillText(`Game Over!`, 150, 200);
            clearInterval(game.timer);
        }
    }
}

document.onkeydown = function(e) {
    if(e.key === ' ') {
        game.cat.moveY = -7;;
    }
    if(e.key === 'Enter' && game.isGameOver === true) {
        init();
    }
};
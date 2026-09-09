const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearVideo = document.getElementById('clearVideo');

const imageNames = ['chicken', 'centaur', 'squirrel', 'bomb', 'negigirl', 'rushingboy', 'bath', 'yoshimuramen', 'cat', 'sky', 'cloud', 'tsunoballoon'];

// グローバルな game オブジェクト
const game = {
    enemys: [],
    clouds: [],
    cloudCounter: 0,
    chickenCounter: 0,
    tsunoballoon: null,
    tsunoballoonCount: 0,
    image: {},
    catSound: new Audio('sound/cat.mp3'),
    bgm: new Audio('sound/bgm.mp3'),
    isGameOver: true,
    score: 0,
    timer: null
};

// BGMを繰り返し再生する
game.bgm.loop = true;

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
    game.clouds = [];
    game.cloudCounter = 0;
    game.tsunoballoon = null;
    game.tsunoballoonCount = 0;
    game.isGameOver = false;
    game.score      = 0;

    createCat();
    createCloud();

    game.timer = setInterval(ticker, 30);
}

function ticker() {
    // 画面クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景の描画
    drawSky();

    game.cloudCounter += 1;

    // 雲の生成
    if (game.cloudCounter >= 300) {
        createCloud();
        game.cloudCounter = 0;
    }

    // 定期的にニワトリを生成
    game.chickenCounter += 1;
    if(game.chickenCounter >= 100) {
    createChicken();
    game.chickenCounter = 0;
    }

    // ランダムに障害物を生成
    if(Math.floor(Math.random() * 1500) === 0) {
        createCentaur();
    }
    if(Math.floor(Math.random() * 1000) === 0) {
       createSquirrel();
    }
     if(Math.floor(Math.random() * 600) === 0) {
       createBomb();
    }
     if(Math.floor(Math.random() * 800) === 0) {
        createNegiGirl();
    }
    if(Math.floor(Math.random() * 800) === 0) {
        createRushingBoy();
    }
    if(Math.floor(Math.random() * 1000) === 0) {
        createBath();
    }
    if(Math.floor(Math.random() * 800) === 0) {
    createYoshimuramen();
    }


    // キャクターの移動
    moveClouds(); // 雲の移動
    moveCat(); // 猫の移動
    moveEnemys(); // 敵キャラクターの移動
    moveTsunoballoon(); // 津野先生風船の移動

    // あたり判定
    hitCheck();

    // 飛行距離の更新
    game.score += 0.3;

    // 200mで1回目の邪魔画像
    if(game.score >= 200 && game.tsunoballoonCount === 0) {
    createTsunoballoon();
    game.tsunoballoonCount = 1;
    }

    // 700mで2回目の邪魔画像
    if(game.score >= 700 && game.tsunoballoonCount === 1) {
    createTsunoballoon();
    game.tsunoballoonCount = 2;
    }

    // 1000mを超えたら数値を1000に固定
    if (game.score >= 1000) {
    game.score = 1000;
    }

   //描画 順番が大切
    drawClouds();// 雲の描画
    drawCat();// 猫の描画
    drawEnemys(); // 敵キャラクターの描画
    drawTsunoballoon(); // 津野先生風船の描画
    drawScore(); // スコアの描画
    drawGameOver(); // ゲームオーバーの描画


    // 1000mまで飛んだらゲームクリア
    if (game.score >= 1000) {
     game.isGameOver = true;

    game.bgm.pause();

    // クリア動画を表示して再生
    clearVideo.style.display = 'block';
    clearVideo.play();

    clearInterval(game.timer);
    }
}


function createCat() {
    game.cat = {
        x: 90,
        y: canvas.height / 2,
        moveY: 0,
        width: 110,
        height: 75,
        image: game.image.cat
    }
}

function createCloud() {
    game.clouds.push({
        x: canvas.width + 100,
        y: Math.random() * canvas.height,
        width: 500,
        height: 250,
        moveX: -3,
        image: game.image.cloud
    });

}

function createChicken() {
    const chickenY = Math.random() * 130 + 570;
    game.enemys.push({
        x: canvas.width + 50,
        y: chickenY,
        width: 100,
        height: 90,
        moveX: -6,
        image: game.image.chicken
    });
}

function createCentaur() {
    const centaurY = Math.random() * (canvas.height - 280) + 140 ;
    game.enemys.push({
       x: canvas.width + 150,
        y: centaurY,
        width: 300,
        height: 280,
        moveX: -3,
        image: game.image.centaur
    });
}

function createSquirrel() {
    const squirrelY = Math.random() * (canvas.height - 33) + 16.5;
    game.enemys.push({
        x: canvas.width + 25,
        y: squirrelY,
        width: 50,
        height: 33,
        moveX: -30,
        image: game.image.squirrel
    });
}

function createBomb() {
    const bombY = Math.random() * (canvas.height - 49) + 24.5;
    game.enemys.push({
        x: canvas.width + 35,
        y: bombY,
        width: 70,
        height: 49,
        moveX: -7,
        image: game.image.bomb
    });
}

function createNegiGirl() {
    const girlY = Math.random() * (canvas.height - 117) + 58.5;
    game.enemys.push({
        x: canvas.width + 75,
        y: girlY,
        width: 150,
        height: 117,
        moveX: -8,
        image: game.image.negigirl
    });
}

function createRushingBoy() {
    const rushingBoyY = Math.random() * (canvas.height - 108) + 54;
    game.enemys.push({
        x: canvas.width + 65,
        y: rushingBoyY,
        width: 130,
        height: 108,
        moveX: -10,
        image: game.image.rushingboy
    });
}

function createBath() {
    const bathY = Math.random() * (canvas.height - 166) + 83;
    game.enemys.push({
        x: canvas.width + 120,
        y: bathY,
        width: 240,
        height: 166,
        moveX: -4,
        image: game.image.bath
    });
}

function createYoshimuramen() {
    const ramenY = Math.random() * (canvas.height - 197) + 98.5;
    game.enemys.push({
        x: canvas.width + 95,
        y: ramenY,
        width: 190,
        height: 197,
        moveX: -5,
        image: game.image.yoshimuramen
    });
}


function createTsunoballoon() {
    game.tsunoballoon = {
        x: canvas.width / 2,
        y: canvas.height + 600,
        width: 800,
        height: 1200,
        moveY: -5,
        image: game.image.tsunoballoon
    };
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

function moveClouds() {
    for (const cloud of game.clouds) {
        cloud.x += cloud.moveX;
    }
    // 画面の外に出た雲を配列から削除
game.clouds = game.clouds.filter(cloud => cloud.x > -cloud.width);
}

function moveEnemys() {
    for (const enemy of game.enemys) {
        enemy.x += enemy.moveX;
    }
    // 画面の外に出たキャラクターを配列から削除
    game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}

function moveTsunoballoon() {
    if(game.tsunoballoon !== null) {
        game.tsunoballoon.y += game.tsunoballoon.moveY;
    }
}

function drawCat() {
    ctx.drawImage(game.image.cat, game.cat.x - game.cat.width / 2, game.cat.y - game.cat.height / 2,
      game.cat.width,game.cat.height);
}

function drawClouds() {
    for (const cloud of game.clouds) {
        ctx.drawImage(
            cloud.image,
            cloud.x - cloud.width / 2,
            cloud.y - cloud.height / 2,
            cloud.width,
            cloud.height
        );
    }
}

function drawEnemys() {
    for (const enemy of game.enemys) {
        ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    }
}

function drawTsunoballoon() {
    if(game.tsunoballoon !== null) {
        ctx.drawImage(
            game.tsunoballoon.image,
            game.tsunoballoon.x - game.tsunoballoon.width / 2,
            game.tsunoballoon.y - game.tsunoballoon.height / 2,
            game.tsunoballoon.width,
            game.tsunoballoon.height
        );
    }
}

function drawSky() {
    ctx.drawImage(game.image.sky, 0, 0, canvas.width, canvas.height);
}

function drawScore() {
    ctx.font = '30px sans-serif';
    ctx.fillText(`飛行距離 : ${Math.floor(game.score)} m`, 10, 40);
}

function drawGameOver() {
    if(game.isGameOver === true) {
        ctx.fillStyle = 'black';
        ctx.font = 'bold 110px sans-serif';
        ctx.fillText('Game Over!', 330, 390);
    }
}

function hitCheck() {
    for (const enemy of game.enemys) {
        if (
            Math.abs(game.cat.x - enemy.x) < game.cat.width * 0.7 / 2 + enemy.width * 0.7 / 2 &&
            Math.abs(game.cat.y - enemy.y) < game.cat.height * 0.7 / 2 + enemy.height * 0.7 / 2
        ) {
            game.isGameOver = true;

            // BGMを停止
            game.bgm.pause();
            game.bgm.currentTime = 0;

            clearInterval(game.timer);
        }
    }
}

document.onkeydown = function(e) {
    if(e.key === ' ' && game.isGameOver === false) {
        game.cat.moveY = -7;

        // 猫の鳴き声
        game.catSound.currentTime = 0;
        game.catSound.play();

        // BGMを再生
        game.bgm.play();
    }
};

// スマホのタッチ操作
document.ontouchstart = function() {
   if(game.isGameOver === false) {
    game.cat.moveY = -7;

    // 猫の鳴き声
    game.catSound.currentTime = 0;
    game.catSound.play();

    // BGMを再生
    game.bgm.play();
}
};
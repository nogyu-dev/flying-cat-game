// Canvasの準備
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearVideo = document.getElementById("clearVideo");

// 使用する画像
const imageNames = [
  "chicken",
  "centaur",
  "squirrel",
  "bomb",
  "negigirl",
  "rushingboy",
  "bath",
  "yoshimuramen",
  "cat",
  "sky",
  "cloud",
  "tsunoballoon",
  "toppage",
];

// ゲームで使用するデータオブジェクト
const game = {
  enemys: [],
  enemyCounter: 0,
  clouds: [],
  cloudCounter: 0,
  chickenCounter: 0,
  tsunoballoon: null,
  tsunoballoonCount: 0,
  image: {},
  catSound: new Audio("sound/cat.mp3"),
  bgm: new Audio("sound/bgm.mp3"),
  isGameOver: true,
  score: 0,
  timer: null,
};

// BGMをループ再生
game.bgm.loop = true;

// 画像をすべて読み込む
let imageLoadCounter = 0;
for (const imageName of imageNames) {
  const imagePath = `image/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if (imageLoadCounter === imageNames.length) {
      console.log("画像のロードが完了しました。");
      init();
    }
  };
}

// ゲームの初期設定
function init() {
  game.enemys = [];
  game.clouds = [];
  game.cloudCounter = 0;
  game.tsunoballoon = null;
  game.tsunoballoonCount = 0;
  game.isGameOver = false;
  game.score = 0;

  createCat();
  createCloud();

  ctx.drawImage(game.image.toppage, 0, 0, canvas.width, canvas.height);
}

// ゲームのメイン処理
function ticker() {
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景の描画
  drawSky();

  game.cloudCounter += 1;

  // 雲を一定間隔で生成
  if (game.cloudCounter >= 300) {
    createCloud();
    game.cloudCounter = 0;
  }

  // ニワトリを一定間隔で生成
  game.chickenCounter += 1;
  if (game.chickenCounter >= 100) {
    createChicken();
    game.chickenCounter = 0;
  }

  // 一定間隔でランダムな障害物を生成
  game.enemyCounter += 1;

  if (game.enemyCounter >= 60) {
    const randomEnemy = Math.floor(Math.random() * 20);

    if (randomEnemy < 5) {
      createBomb();
    } else if (randomEnemy < 9) {
      createNegiGirl();
    } else if (randomEnemy < 12) {
      createRushingBoy();
    } else if (randomEnemy < 15) {
      createYoshimuramen();
    } else if (randomEnemy < 17) {
      createBath();
    } else if (randomEnemy < 19) {
      createSquirrel();
    } else {
      createCentaur();
    }
    game.enemyCounter = 0;
  }

  // 700m以降はリスの出現率をアップ
  if (game.score >= 700 && Math.floor(Math.random() * 300) === 0) {
    createSquirrel();
  }

  // キャラクターを移動
  moveClouds(); // 雲の移動
  moveCat(); // 猫の移動
  moveEnemys(); // 敵キャラクターの移動
  moveTsunoballoon(); // 津野先生邪魔風船の移動

  // 当たり判定
  hitCheck();

  // 飛行距離を更新
  game.score += 0.3;

  // 200mで1回目の邪魔画像
  if (game.score >= 200 && game.tsunoballoonCount === 0) {
    createTsunoballoon();
    game.tsunoballoonCount = 1;
  }

  // 700mで2回目の邪魔画像
  if (game.score >= 700 && game.tsunoballoonCount === 1) {
    createTsunoballoon();
    game.tsunoballoonCount = 2;
  }

  // 1000mを超えたら数値を1000に固定
  if (game.score >= 1000) {
    game.score = 1000;
  }

  // 画面を描画 順番が大切
  drawClouds(); // 雲の描画
  drawCat(); // 猫の描画
  drawEnemys(); // 敵キャラクターの描画
  drawTsunoballoon(); // 津野先生風船の描画
  drawScore(); // スコアの描画
  drawGameOver(); // ゲームオーバーの描画

  // 1000mでゲームクリア
  if (game.score >= 1000) {
    game.isGameOver = true;

    game.bgm.pause();

    // クリア動画を表示して再生
    clearVideo.style.display = "block";
    clearVideo.play();

    clearInterval(game.timer);
  }
}


// --- キャラクター生成 ---

// 黒猫を生成
function createCat() {
  game.cat = {
    x: 90,
    y: canvas.height / 2,
    moveY: 0,
    width: 110,
    height: 75,
    image: game.image.cat,
  };
}

// 雲を生成
function createCloud() {
  game.clouds.push({
    x: canvas.width + 100,
    y: Math.random() * canvas.height,
    width: 500,
    height: 250,
    moveX: -3,
    image: game.image.cloud,
  });
}

// ニワトリを生成
function createChicken() {
  const chickenY = Math.random() * 130 + 570;
  game.enemys.push({
    x: canvas.width + 50,
    y: chickenY,
    width: 100,
    height: 90,
    moveX: -6,
    image: game.image.chicken,
  });
}

// ケンタウロスを生成
function createCentaur() {
  const centaurY = Math.random() * (canvas.height - 280) + 140;
  game.enemys.push({
    x: canvas.width + 150,
    y: centaurY,
    width: 300,
    height: 280,
    moveX: -2,
    image: game.image.centaur,
  });
}

// リスを生成
function createSquirrel() {
  const squirrelY = Math.random() * (canvas.height - 33) + 16.5;
  game.enemys.push({
    x: canvas.width + 25,
    y: squirrelY,
    width: 50,
    height: 33,
    moveX: -30,
    image: game.image.squirrel,
  });
}

// 爆弾を生成
function createBomb() {
  const bombY = Math.random() * (canvas.height - 49) + 24.5;
  game.enemys.push({
    x: canvas.width + 35,
    y: bombY,
    width: 70,
    height: 49,
    moveX: -8,
    image: game.image.bomb,
  });
}

// ネギ少女を生成
function createNegiGirl() {
  const girlY = Math.random() * (canvas.height - 117) + 58.5;
  game.enemys.push({
    x: canvas.width + 75,
    y: girlY,
    width: 150,
    height: 117,
    moveX: -10,
    image: game.image.negigirl,
  });
}

// ロケット少年を生成
function createRushingBoy() {
  const rushingBoyY = Math.random() * (canvas.height - 108) + 54;
  game.enemys.push({
    x: canvas.width + 65,
    y: rushingBoyY,
    width: 130,
    height: 108,
    moveX: -12,
    image: game.image.rushingboy,
  });
}

// 風呂のおじさんを生成
function createBath() {
  const bathY = Math.random() * (canvas.height - 166) + 83;
  game.enemys.push({
    x: canvas.width + 120,
    y: bathY,
    width: 240,
    height: 166,
    moveX: -4,
    image: game.image.bath,
  });
}

// 吉村先生ラーメンを生成
function createYoshimuramen() {
  const ramenY = Math.random() * (canvas.height - 197) + 98.5;
  game.enemys.push({
    x: canvas.width + 95,
    y: ramenY,
    width: 190,
    height: 197,
    moveX: -5,
    image: game.image.yoshimuramen,
  });
}

// 津野先生邪魔風船を生成
function createTsunoballoon() {
  game.tsunoballoon = {
    x: canvas.width / 2,
    y: canvas.height + 600,
    width: 800,
    height: 1200,
    moveY: -4,
    image: game.image.tsunoballoon,
  };
}


// --- 移動処理 ---

// 黒猫を移動
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

// 雲を移動
function moveClouds() {
  for (const cloud of game.clouds) {
    cloud.x += cloud.moveX;
  }
  // 画面の外に出た雲を配列から削除
  game.clouds = game.clouds.filter((cloud) => cloud.x > -cloud.width);
}

// 障害物を移動
function moveEnemys() {
  for (const enemy of game.enemys) {
    enemy.x += enemy.moveX;
  }
  // 画面の外に出たキャラクターを配列から削除
  game.enemys = game.enemys.filter((enemy) => enemy.x > -enemy.width);
}

// 津野先生邪魔風船を移動
function moveTsunoballoon() {
  if (game.tsunoballoon !== null) {
    game.tsunoballoon.y += game.tsunoballoon.moveY;
  }
}


// --- 描画処理 ---

// 黒猫を描画
function drawCat() {
  ctx.drawImage(
    game.image.cat,
    game.cat.x - game.cat.width / 2,
    game.cat.y - game.cat.height / 2,
    game.cat.width,
    game.cat.height,
  );
}

// 雲を描画
function drawClouds() {
  for (const cloud of game.clouds) {
    ctx.drawImage(
      cloud.image,
      cloud.x - cloud.width / 2,
      cloud.y - cloud.height / 2,
      cloud.width,
      cloud.height,
    );
  }
}

// 障害物を描画
function drawEnemys() {
  for (const enemy of game.enemys) {
    ctx.drawImage(
      enemy.image,
      enemy.x - enemy.width / 2,
      enemy.y - enemy.height / 2,
      enemy.width,
      enemy.height,
    );
  }
}

// 津野先生邪魔風船を描画
function drawTsunoballoon() {
  if (game.tsunoballoon !== null) {
    ctx.drawImage(
      game.tsunoballoon.image,
      game.tsunoballoon.x - game.tsunoballoon.width / 2,
      game.tsunoballoon.y - game.tsunoballoon.height / 2,
      game.tsunoballoon.width,
      game.tsunoballoon.height,
    );
  }
}

// 背景を描画
function drawSky() {
  ctx.drawImage(game.image.sky, 0, 0, canvas.width, canvas.height);
}

// 飛行距離を描画
function drawScore() {
  ctx.font = "30px sans-serif";
  ctx.fillText(`飛行距離 : ${Math.floor(game.score)} m`, 10, 40);
}

// ゲームオーバーを描画
function drawGameOver() {
  if (game.isGameOver === true) {
    ctx.fillStyle = "black";
    ctx.font = "bold 110px sans-serif";
    ctx.fillText("Game Over!", 330, 390);
  }
}


// --- 当たり判定 ---

// 黒猫と障害物の当たり判定
function hitCheck() {
  for (const enemy of game.enemys) {
    if (
      Math.abs(game.cat.x - enemy.x) <
        (game.cat.width * 0.7) / 2 + (enemy.width * 0.7) / 2 &&
      Math.abs(game.cat.y - enemy.y) <
        (game.cat.height * 0.7) / 2 + (enemy.height * 0.7) / 2
    ) {
      game.isGameOver = true;

      // BGMを停止
      game.bgm.pause();
      game.bgm.currentTime = 0;

      clearInterval(game.timer);
    }
  }
}


// --- 操作処理 ---

// PCのキーボード操作
document.onkeydown = function (e) {
  // 最初のSpaceキーでゲームスタート
  
  if (e.key === " " && game.timer === null) {
    game.timer = setInterval(ticker, 30);
    game.bgm.play();

    return;
  }

  // ゲーム中の操作

  if (e.key === " " && game.isGameOver === false) {
    game.cat.moveY = -7;
    game.catSound.currentTime = 0;

    game.catSound.play();
    game.bgm.play();
  }
};

// スマートフォンのタッチ操作
document.ontouchstart = function () {
  // 最初のタップでゲームスタート

  if (game.timer === null) {
    game.timer = setInterval(ticker, 30);
    game.bgm.play();

    return;
  }

  // ゲーム中の操作

  if (game.isGameOver === false) {
    game.cat.moveY = -7;
    game.catSound.currentTime = 0;

    game.catSound.play();
    game.bgm.play();
  }
};

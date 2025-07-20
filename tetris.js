'use strict';

/* =============================== Initial Screen =============================== */

// initialPageとmainPageの取得
let initial_screen = document.getElementById("initial-screen");
let main_screen = document.getElementById("main-screen");

/* --- loading画面 --- */
window.addEventListener("load", () => {
  setTimeout(() => {
    initial_screen.style.display = "block";
    document.getElementById("load").style.display = "none";
    document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });
  }, 4000);
})


/* --- ゲーム説明 --- */
const btnMenu = document.getElementById("btn-menu");

btnMenu.addEventListener("click", () => {
  const more = document.querySelector('.more');
  more.classList.toggle('appear');

  if (btnMenu.textContent == "HOW TO PLAY") {
    btnMenu.textContent = "CLOSE";
  } else {
    btnMenu.textContent = "HOW TO PLAY";
  }
});


/* --- BGM --- */
// オープニングサウンド
const BGM_OPENING = new Audio("sounds/tetris_bgm_opening.m4a");
BGM_OPENING.volume = 0.3;

// メインサウンド(Stage1-2)
const BGM_STAGE_TO_2 = new Audio("sounds/tetris_bgm_stage_1.m4a");
BGM_STAGE_TO_2.volume = 0.3;
// メインサウンド(Stage3-4)
const BGM_STAGE_TO_4 = new Audio("sounds/tetris_bgm_stage_2.m4a");
BGM_STAGE_TO_4.volume = 0.3;
// メインサウンド(Stage5-7)
const BGM_STAGE_TO_7 = new Audio("sounds/tetris_bgm_stage_3.m4a");
BGM_STAGE_TO_7.volume = 0.3;
// メインサウンド(Stage8)
const BGM_STAGE_8 = new Audio("sounds/semifinal_stage_main_sound.mp3");
BGM_STAGE_8.volume = 0.3;
// メインサウンド(Stage9)
const BGM_FINAL_STAGE_9 = new Audio("sounds/final_stage_main_sound.mp3");
BGM_FINAL_STAGE_9.volume = 0.3;
// ステージクリアサウンド
const BGM_STAGE_CLEAR = new Audio("sounds/stage_clear.mp3");


/* --- SOUND EFFECT --- */
// ゲームオーバー効果音
const SOUND_GAME_OVER = new Audio("sounds/game_over.mp3");
// スタック効果音
const SOUND_STACK = new Audio("sounds/down_key.mp3");
// ブロック消滅効果音
const SOUND_DELETE_BLOCK = new Audio("sounds/delete_block.mp3");
// 回転効果音
const SOUND_ROTATE = new Audio("sounds/rotate.mp3");
// メニュー選択効果音
const SOUND_SELECT = new Audio("sounds/pause_menu.mp3");


// サウンドフラグ
let vol_flag = false;



// サウンドボタン
let vol_initial = document.getElementById("vol-initial");
// サウンドボタン画像
let vol_img = document.getElementById("vol-img");

/* --- サウンドボタンの画像切り替え --- */
const changeVolImg = (img) => {
  if (!vol_flag) {
    img.src = "img/volume_mute2.jpg";
  } else {
    img.src = "img/volume_on2.jpg";
  }
  img.width = 30;
  img.height = 30;
  img.style.verticalAlign = "middle";
  img.style.borderRadius = "50%"
}

/* --- オープニングサウンドの切り替え --- */
const sound_play_main = () => {
  if (vol_flag) {
    BGM_OPENING.pause();
    vol_flag = false;
  } else {
    BGM_OPENING.pause();
    BGM_OPENING.play();
    BGM_OPENING.loop = true;
    vol_flag = true;
  }
}

/* --- サウンドボタン表示切り替え --- */
const toggleVolume = (btn) => {
  if (vol_flag) {
    btn.style.background = "#1d3557";
    btn.style.color = "#a8dadc";
    btn.innerHTML = "BGM";
  } else {
    btn.style.background = "#a8dadc";
    btn.style.color = "#1d3557";
    btn.innerHTML = "BGM ";
  }
}

/* --- サウンドON or OFF・サウンド画像切り替え --- */
vol_initial.addEventListener("click", () => {
  sound_play_main();
  toggleVolume(vol_initial);
  changeVolImg(vol_img);

  vol_initial.append(vol_img);
}, false);


/* --- オープニングの画像 --- */
let mainScreenImg = document.getElementById("main-img");

/* --- 時間帯によって画像を切り替える --- */
const openingImg = (hour) => {
  if (hour >= 6 && hour <= 17) {
    mainScreenImg.src = "img/opening_day_time.jpg";
  } else {
    mainScreenImg.src = "img/opening_night_time.jpg";
  }
}

let now = new Date();
let hour = now.getHours();

openingImg(hour);

/* =============================== Main Screen =============================== */


// 1ブロックのサイズ
const BLOCK_SIZE = 25;

// テトロミノのサイズ
const TETRO_SIZE = 4;

// canvasのサイズ基準
const FIELD_COL = 10;
const FIELD_ROW = 20;

// テトロミノのブロックサイズを掛け合わせてフィールドの大きさを定義
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;

// サブスクリーンのフィールドの大きさを定義
const SUB_SCREEN = BLOCK_SIZE * TETRO_SIZE;

// フィールド ({FIELD_COL * FIELD_ROW} を格納する配列)
let field = [];



/* --- キャンバスAPIを取得してフィールドを描画 --- */
/* --- メインスクリーンキャンバス --- */
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

canvas.width = SCREEN_W;
canvas.height = SCREEN_H;
canvas.style.border = "4px ridge #a8dadc";



/* --- サブスクリーンキャンバス --- */
let screen_can = document.getElementById("canvas-side");
let screen_con = screen_can.getContext('2d');

screen_can.width = SUB_SCREEN;
screen_can.height = SUB_SCREEN;
screen_can.style.border = "3mm ridge #1d3557";



// テトロミノ
let tetro;

// テトロミノのtype
let tetro_t;

// テトロミノネクスト
let tetro_n;

// テトロミノの落下地点を定義
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

// テトロミノの現在地を代入
let tetro_x = START_X;
let tetro_y = START_Y;

// setInterval
let interval;

// Game Over判定
let over = false;

// Game Speed
let game_speed = 900;

// Level
let level = 1;

// スコア
let scoreCount = 0;

// 消したライン数
let deleteLine = 0;

/* --- scoreリスト --- */
const scoreList =
{
  1: 40, // 1列 : 40 Score
  2: 100, // 2列 : 100 Score
  3: 400, // 3列 : 400 Score
  4: 1200, // 4列 : 1200 Score
}

/* --- テトロミノの色 --- */
const TETRO_COLORS =
  [
    "#000",             // 0: 黒
    "#6cf",             // 1: 水色
    "#fb2",             // 2: オレンジ
    "#66f",             // 3: 青
    "#c5c",             // 4: 紫
    "#fd2",             // 5: 黄色
    "#f44",             // 6: 赤
    "#6b6",             // 7: 緑
  ];


/* --- テトロミノのType --- */
const TETRO_TYPES =
  [
    [],
    // I
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // L
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // J
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // T
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // O
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // Z
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // S
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ]


/* --- メインサウンドプレイ --- */
const soundPlay = () => {
  // ファイナルステージ
  if (game_speed <= 100) {
    BGM_STAGE_8.pause();
    BGM_FINAL_STAGE_9.play();
    BGM_FINAL_STAGE_9.loop = true;
  // セミファイナルステージ
  }
  else if (game_speed <= 200) {
    BGM_STAGE_TO_7.pause();
    BGM_STAGE_8.play();
    BGM_STAGE_8.loop = true
  }
  // ステージ5-7
  else if (game_speed <= 500) {
    BGM_STAGE_TO_4.pause();
    BGM_STAGE_TO_7.play();
    BGM_STAGE_TO_7.loop = true;
  }
  // ステージ3-4
  else if (game_speed <= 700) {
    BGM_STAGE_TO_2.pause();
    BGM_STAGE_TO_4.play();
    BGM_STAGE_TO_4.loop = true;
  }
  // ステージ1-2
  else {
    BGM_STAGE_TO_2.pause();
    BGM_STAGE_TO_2.play();
    BGM_STAGE_TO_2.loop = true;
  }
}

/* --- メインサウンドプレイをSTOP --- */
const soundPause = () => {
  if (game_speed <= 100) {
    BGM_FINAL_STAGE_9.pause();
  // セミファイナルステージ
  }
  else if (game_speed <= 200) {
    BGM_STAGE_8.pause();
  }
  // ステージ5-7
  else if (game_speed <= 500) {
    BGM_STAGE_TO_7.pause();
  }
  // ステージ3-4
  else if (game_speed <= 700) {
    BGM_STAGE_TO_4.pause();
  }
  // ステージ1-2
  else {
    BGM_STAGE_TO_2.pause();
  }
}


/* --- スコア画面・レベル別サウンド設定 --- */
const screenTransition = () => {
  // 次のレベルまでのスコア
  const UP_TO_NEXT = 3000;
  let nextLevel = level * UP_TO_NEXT;

  // スコアが一定の点数に到達するとレベルアップ
  if ((scoreCount >= nextLevel) && (game_speed !== 100)) {
    level++;
    game_speed -= 100;

    if (vol_flag) {
      // ステージクリア音
      BGM_STAGE_CLEAR.play();
    };
    onClearInterval();
    interval = setInterval(dropTetro, game_speed);
  }
  // ゲームスピードに応じてサウンドを変化
  if (vol_flag) {
    soundPlay();
  }

  // スコアボードを取得
  let scoreBoardLevel = document.getElementById("level");
  let scoreBoardCount = document.getElementById("score-count");
  let scoreBoardLine = document.getElementById("line-count");

  // スクリーンに表示
  scoreBoardLevel.innerHTML = `LEVEL : ${level}`;
  scoreBoardCount.innerHTML = `SCORE : ${scoreCount}`;
  scoreBoardLine.innerHTML = `DELETE LINE : ${deleteLine}`;

}


// blockをnoneに変更
function displayNone(ele) {
  ele.style.display = "block";
  ele.style.display = "none";
}

// noneをblockに変更
function displayBlock(ele) {
  ele.style.display = "none";
  ele.style.display = "block";
}

/* --- メインページへの切り替え・ゲームスタート --- */
document.getElementById("gameStart").addEventListener('click', () => {
  displayNone(initial_screen);
  displayBlock(main_screen);
  BGM_OPENING.pause();

  if (vol_flag) {
    soundPlay();
  }
  // フィールドの初期化
  init();
  // テトロミノを落下させる
  dropTetro();
}, false);



/* --- インターバルをクリア --- */
const onClearInterval = () => {
  clearInterval(interval);
}

/* --- インターバルをセット --- */
const onSetInterval = () => {
  interval = setInterval(dropTetro, game_speed);
}



// ストップ or リスタート フラグ
let moveOn = true;

/* --- ゲームリスタート・ストップ --- */
let onStopBtn = document.getElementById("onStopBtn");
onStopBtn.addEventListener("click", () => {
  onStopButton();
}, false)

const onStopButton = () => {
  if (vol_flag) {
    SOUND_SELECT.pause();
    SOUND_SELECT.play();
  }

  if (moveOn == true) {
    onClearInterval();
    soundPause();
    document.getElementById("onStopBtn").innerHTML = "RESTART";
    moveOn = false;
  }
  else {
    onClearInterval();
    onSetInterval();
    document.getElementById("onStopBtn").innerHTML = "PAUSE";
    moveOn = true;
    if (vol_flag) {
      soundPlay();
    }
  }
}




/* --- リセット --- */
let resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", (e) => {
  soundPause();
  SOUND_SELECT.pause();
  SOUND_SELECT.play();
  resetButton(e.target);
}, false);

const resetButton = (e) => {
  // pauseしていなければ一旦pauseする
  if (e.classList.contains("pause")) {
    onClearInterval();
  }

  // リセットの再確認
  let res = confirm("本当に中断しますか？？");
  if (res) {
    // リセット
    window.location.reload();
  } else {
    // ゲームリスタート
    onClearInterval();
    onSetInterval();
    if (vol_flag) {
      SOUND_SELECT.pause();
      SOUND_SELECT.play();
      soundPlay();
    }
  }
}



/* --- メイン画面 BGM On・Off --- */
const main_vol = document.getElementById("main-vol");
const mute_img = document.getElementById("mute-img");

main_vol.addEventListener("click", () => {
  if(vol_flag){
    SOUND_SELECT.play();
  }

  if (vol_flag) {
    soundPause();
    vol_flag = false;
  } else {
    soundPlay();
    vol_flag = true;
  }
  toggleVolume(main_vol);
  changeVolImg(mute_img);
  main_vol.append(mute_img);
}, false);



/* --- 初期化 --- */
function init() {
  // フィールドをクリア
  for (let y = 0; y < FIELD_ROW; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_COL; x++) {
      field[y][x] = 0;
    }
  }

  // 次のテトロタイプのインデックスを生成
  tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
  setTetro();
  drawAll();
  interval = setInterval(dropTetro, game_speed);
}


/* --- テトロミノの準備 --- */
function setTetro() {
  // 次のテトロタイプのインデックス
  tetro_t = tetro_n;
  // テトロタイプからテトロミノの2次元配列を取得
  tetro = TETRO_TYPES[tetro_t];
  // 次のテトロタイプのインデックスを生成
  tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
  // テトロミノの落下地点の座標
  tetro_x = START_X;
  tetro_y = START_Y;
  // 次のテトロミノをサブスクリーンに描画
  drawAllSubScreen();
}

/* --- テトリミノを生成 --- */
function drawBlock(x, y, c) {
  // ブロックサイズを代入
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  context.fillStyle = TETRO_COLORS[c];
  context.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

  context.strokeStyle = "#f1faee";
  context.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}


/* --- フィールドの描画 --- */
function drawAll() {
  // フィールドをクリアにする
  context.clearRect(0, 0, SCREEN_W, SCREEN_H);

  /* --- フィールド全体の描画 --- */
  for (let y = 0; y < FIELD_ROW; y++) {
    for (let x = 0; x < FIELD_COL; x++) {
      // フィールド上を全て確認して存在するテトロミノを描画
      if (field[y][x]) {
        // テトロミノが存在する座標 x, y と、テトロミノのタイプのインデックスを渡す
        drawBlock(x, y, field[y][x]);
      }
    }
  }

  // 着地点の計算
  let plus = 0;
  while (checkMove(0, plus + 1)) plus++;

  // テトロミノを描画
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        // 着地点
        drawBlock(tetro_x + x, tetro_y + y + plus, 0);
        // 本体
        drawBlock(tetro_x + x, tetro_y + y, tetro_t);
      }
    }
  }

  // Game over時の設定
  if (over) {
    let s = "GAME OVER";
    context.font = "40px 'MSゴシック'";
    let w = context.measureText(s).width;
    let x = SCREEN_W / 2 - w / 2;
    let y = SCREEN_H / 2 - 20;
    context.lineWidth = 4;
    context.strokeText(s, x, y);
    context.fillStyle = "red";
    context.fillText(s, x, y);

    soundPause();
    SOUND_GAME_OVER.play();

    setTimeout(() => {
      let res = confirm("ゲームを終了しますか？？");
      if (res) {
        // リセット
        window.location.reload();
      }
    }, 4000);
  }
}


/* --- ネクストテトロの表示 --- */
function drawBlockNext(x, y, c) {
  // ブロックサイズを代入
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  screen_con.fillStyle = TETRO_COLORS[c];
  screen_con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

  screen_con.strokeStyle = "#f1faee";
  screen_con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

/* --- サブスクリーンの描画 --- */
function drawAllSubScreen() {
  // サブスクリーンをクリア
  screen_con.clearRect(0, 0, SUB_SCREEN, SUB_SCREEN);
  // ネクストテトロのインデックスをテトロタイプに渡し、2次元配列を取得
  let tetro_n_type = TETRO_TYPES[tetro_n];

  // テトロミノを描画
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro_n_type[y][x]) {
        drawBlockNext(x, y, tetro_n);
      }
    }
  }
}

/* --- ブロック衝突判定 --- */
function checkMove(mx, my, newTetro) {

  if (newTetro === undefined) newTetro = tetro;

  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      let nx = tetro_x + mx + x;
      let ny = tetro_y + my + y;

      if (newTetro[y][x]) {
        if (
          ny < 0 ||
          nx < 0 ||
          ny >= FIELD_ROW ||
          nx >= FIELD_COL ||
          field[ny][nx]
        ) {
          return false
        };
      }
    }
  }
  return true;
}

/* --- テトロミノ回転 --- */
function rotate() {
  let ntetro = [];
  for (let y = 0; y < TETRO_SIZE; y++) {
    ntetro[y] = [];
    for (let x = 0; x < TETRO_SIZE; x++) {
      ntetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
    }
  }
  return ntetro;
}

/* --- 最下部に到達時点でテトロミノ固定 --- */
function fixTetro() {
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        field[tetro_y + y][tetro_x + x] = tetro_t;
      }
    }
  }
}


/* --- ラインが揃ったかチェックして消す --- */
function checkLine() {
  // ラインを消した数をカウント(スコアの計算)
  let lineCount = 0;
  // 全てのラインを上からチェック
  for (let y = 0; y < FIELD_ROW; y++) {
    let flag = true;
    for (let x = 0; x < FIELD_COL; x++) {
      // 0があればfalse(揃ってないということなので即loopを抜ける)
      if (!field[y][x]) {
        flag = false;
        break;
      }
    }

    // 全てtrye(ラインが揃ってるなら)
    if (flag) {
      // ラインを消した数
      lineCount++;

      // ラインを消す作業(ラインのブロックを一段下げる処理)
      for (let ny = y; ny > 0; ny--) {
        for (let nx = 0; nx < FIELD_COL; nx++) {
          // 上の行からlineを持ってくる
          field[ny][nx] = field[ny - 1][nx];
        }
      }
    }
  }

  // ライン削除された場合
  if (lineCount) {
    // lineを消した数をcount
    deleteLine += lineCount;
    // scoreの計算
    scoreCount += scoreList[lineCount];
    if (vol_flag) {
      SOUND_DELETE_BLOCK.play();
    }
    // score-displayの更新
    screenTransition();
  }

}



/* --- テトロミノの落下処理 --- */
function dropTetro() {

  if (over) return;

  if (checkMove(0, 1)) tetro_y++;
  else {
    // 一番下の行にテトロミノが付いた時点でその場に固定
    fixTetro();

    // テトロミノのラインが揃ったかチェック
    checkLine();

    // 次のテトロミノの準備
    setTetro();

    if (!checkMove(0, 0)) over = true;
  }
  drawAll();
}


/* --- 画面スクロール禁止 --- */
function handleTouchMove(event) {
  event.preventDefault();
}

document.addEventListener('touchmove', handleTouchMove, { passive: false });


/* --- ボタンによる入力 (レスポンシブ対応) --- */
document.getElementById("arrow-left").addEventListener("click", function () {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
});
document.getElementById("arrow-right").addEventListener("click", function () {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
});
document.getElementById("arrow-down").addEventListener("click", function () {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
});
document.getElementById("arrow-up").addEventListener("click", function () {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
});
document.getElementById("rotate-center").addEventListener("click", function () {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
});


/* --- PCによるキーポジション --- */
document.addEventListener("keydown", (e) => {
  // GameOver時はreturn
  if (over) return;

  // Pause時キーボード操作無効
  if (!moveOn) {
    e.preventDefault();
    // スペースの挙動がおかしいため使用不可に設定
    if (e.key == " ") onStopButton();
    return;
  }

  switch (e.key) {
    // 左
    case "ArrowLeft":
      if (checkMove(-1, 0)) tetro_x--;
      break;
    // 右
    case "ArrowRight":
      if (checkMove(1, 0)) tetro_x++;
      break;
    // 最下部まで一気に落下
    case "ArrowUp":
      while (checkMove(0, 1)) tetro_y++;
      if (vol_flag) {
        SOUND_STACK.play();
      }
      break;
    // 下
    case "ArrowDown":
      if (checkMove(0, 1)) tetro_y++;
      break;
    // 回転
    case "r":
    case "R":
      let newTetro = rotate();
      if (checkMove(0, 0, newTetro)) tetro = newTetro;
      if (vol_flag) {
        SOUND_ROTATE.pause();
        SOUND_ROTATE.play();
      }
      break;
  }
  // 全体表示
  drawAll();
}, false);


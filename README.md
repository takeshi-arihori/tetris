# Tetris
HTML・CSS・JavaScriptを使ってテトリスを作成しました。  

<p align="left">
  <a href="https://github.com/takeshi-arihori/Tetris/">
    <img src="https://komarev.com/ghpvc/?username=takeshi-arihori" alt="takeshi-arihori" />
  </a>
</p>

#### プレイはこちらから

[Tetris](https://tetris20230212.firebaseapp.com/)
  
<img width="700" height="500" alt="テトリスオープニング画像" src="https://user-images.githubusercontent.com/83809409/219990097-b3df0faf-8a8b-4d28-8b2a-507b33f17d0d.png">   
  
## プレイ動画  

https://user-images.githubusercontent.com/83809409/224547418-149b7143-ad1e-4a52-a790-e191a58cca12.mp4

## プレイ中の動画  

https://user-images.githubusercontent.com/83809409/224547796-b0d86fd7-f43d-4106-a7cf-49537393bb62.mp4

  
  
## 基本ルール

・ 10 × 20 のフィールド  
・ フィールド上部からランダムにテトリミノが落下  
・ テトリミノが埋まったラインは消え、消したライン数でスコアを加算  

| ライン数 | スコア |
| -------- | ------ |
| 1        | 40     |
| 2        | 100    |
| 3        | 400    |
| 4        | 1200   |

  
## テトロミノの速度

・ スコアに応じてテトロミノの落下速度が早くなる  
  

| レベル | スコア        | 落下速度(1ライン) |
| ------ | ------------- | ----------------- |
| 1      | 0 ~ 3000      | 0.9s              |
| 2      | 3000 ~ 6000   | 0.8s              |
| 3      | 600 ~ 9000    | 0.7s              |
| 4      | 9000 ~ 12000  | 0.6s              |
| 5      | 12000 ~ 15000 | 0.5s              |
| 6      | 15000 ~ 18000 | 0.4s              |
| 7      | 18000 ~ 21000 | 0.3s              |
| 8      | 21000 ~ 24000 | 0.2s              |
| 9      | 24000 ~       | 0.1s              |
  
  
## 操作
  
| 操作           | キー | 説明                                                                                                                                                   |
| -------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 左移動         | ←    | テトリミノを左に移動させます。    フィールドの左端または移動先に配置済みのテトリスミノがある場合は移動できません。                                     |
| 右移動         | →    | テトリミノを右に移動させます。    フィールドの右端または移動先に配置済みのテトリスミノがある場合は移動できません。                                     |
| ソフトドロップ | ↓    | テトリミノを下に移動させます。    フィールドの下側に配置済みのテトリスミノがある場合は移動できません。                                                 |
| ハードドロップ | ↑    | テトリミノを真下に配置させます。    配置後は移動できません。                                                                                           |
| 回転           | R    | テトリミノを90度反時計回りに回転させます。 回転後にテトリミノがフィールド外またはブロックに衝突する場合は回転できません。Tスピンには対応していません。 |


## 種類  
| 種類           | 使用技術       |
| -------------- | -------------- |
| フロントエンド | JavaScript     |
| デプロイ       | Vercel         |
| CI/CD          | GitHub Actions |

## デプロイ方法

### Vercelでのデプロイ

1. **Vercel CLIのインストール**
   ```bash
   npm install -g vercel
   ```

2. **プロジェクトのデプロイ**
   ```bash
   vercel
   ```

3. **本番環境へのデプロイ**
   ```bash
   vercel --prod
   ```

### 手動デプロイ

1. [Vercel](https://vercel.com)にアクセス
2. GitHubリポジトリをインポート
3. 自動的にデプロイが開始されます

### 環境変数

このプロジェクトは静的サイトのため、特別な環境変数は不要です。


## BGM
・ オープニング : [ゲームボーイ版テトリスBGMメドレー](https://youtu.be/rAsxs6PBa0U)  
・ レベル1-2 : [Korobushka (A-Type)](https://youtu.be/NGnUbUMD4N0)  
・ レベル3-4 : [Technotris](https://youtu.be/gdjXo59DNb4)  
・ レベル5-7 : [Tetris Theme(Tetris 99 Ver.)](https://youtu.be/y2ambwiuPWs)  
・ レベル8 : [魔王魂 無料で使える森田交一の音楽](https://maou.audio/)  
・ レベル9 : [魔王魂 無料で使える森田交一の音楽](https://maou.audio/)  

## Sound Effect
・ [効果音ラボ](https://soundeffect-lab.info/sound/button/)  
・ [甘茶の音楽工房](https://amachamusic.chagasi.com/music_retrogamecenter.html)  

## IMAGE
#### オープニング画面
・ ロゴ [ピクセルフォント](https://fontmeme.com/ja/font-pixel-style/)  
・ 背景 [illustAC](https://www.ac-illust.com/)  

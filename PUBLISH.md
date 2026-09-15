# GitHub Pages 公開手順 — v218

対象リポジトリ: `inaryu070/m1-koc-database`
公開URL: https://inaryu070.github.io/m1-koc-database/

## 1. ルートへアップロード
このフォルダ内の次のファイルを、ZIPのままではなく**展開してリポジトリ直下**へアップロードしてください。

- `index.html`（既存を置換）
- `db.js`
- `core.js`
- `patches.js`
- `ogp.png`
- `robots.txt`
- `sitemap.xml`
- `.nojekyll`
- `README.md`
- `PUBLISH.md`

コミットメッセージ例: `Publish v218 top agency navigation`

## 2. 旧重複ファイルを削除
新サイトの表示確認後、ルートに残っている `index.html.html` を削除してください。

## 3. 公開確認
GitHub Pagesの反映後、以下を確認します。

- トップページが表示される
- `ogp.png` が直接開ける
- 検索・フィルタ・ランキングが動く
- AGENCY POWER / AGENCY EVOLUTION が表示される
- POWER CSV / 通常CSVが保存できる
- スマホ表示で横スクロールが発生しない
- X等へURLを貼った際にOGP画像が表示される

## v218 ローカル監査結果
- DB: 1,747 units
- data release: v218
- JavaScript syntax: PASS (`db.js`, `core.js`, `patches.js`)
- Runtime exceptions: 0
- Desktop rendering: PASS
- Mobile 390px: horizontal overflow 0
- Agency dashboard: PASS
- Agency evolution: PASS
- 2026 KOC current panel: PASS
- Correction/report link: PASS
- OGP: 1200×630 PNG

※ 本サイトはM-1グランプリ／キングオブコントの公式サイトではありません。

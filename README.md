## v252
- 扉の操作を ENTER DATABASE の1ボタンに統一
- ページ内ナビゲーションの参照先を修正
- 扉表示中の db.js / core.js preload を廃止して初期負荷を軽減
- light UI metadata・dialog accessibility・M-1予測注記を監査修正
- メインコピー「面白いを、可視化する。」と承認済み説明文は変更なし

# M-1 × KOC 戦績データベース — GitHub Pages v252

**面白いを、可視化する。**  
M-1グランプリとキングオブコントの主要戦績を横断検索・分析する非公式データベースです。

公開URL: https://inaryu070.github.io/m1-koc-database/

## v218
- 1,747ユニット収録
- M-1 / KOC横断スコア・ランキング・検索
- NEXT STAR FINDER
- AGENCY POWER / AGENCY EVOLUTION
- 年代別・年度別の事務所勢力分析
- 事務所COLOR（漫才特化〜コント特化）
- CSV出力
- KOC 2026（9/10発表分）反映
- SNS共有用OGP、SEO、訂正窓口を整備

## 公開ファイル
- `index.html` — UI / SEO / static HTML
- `db.js` — 戦績データ本体
- `core.js` — 検索・集計・CSV・表示ロジック
- `patches.js` — 後段監査・所属補正・事務所POWER・2026更新
- `ogp.png` — SNS共有画像（1200×630）
- `robots.txt` / `sitemap.xml` — 検索エンジン向け
- `.nojekyll` — GitHub Pages向け
- `PUBLISH.md` — 公開・差し替え手順

データの訂正・誤表記はGitHub Issuesから報告できます。

> `index.html.html` は旧重複ファイルです。v218公開確認後に削除してください。

## v220
- AGENCY ANALYSIS に TOURNAMENT タブを追加。
- M-1/KOC × 年度で事務所別 AVG / TOTAL / n / SF+率 / POINT SHARE / TOP TEAM を比較。
- 平均ランキングは n>=5 を標準。n>=3 / 5 / 10 切替、最低n未満も参考表示。
- QUALITY × VOLUME（平均点 × 出場組数）散布図とCSV出力を追加。


## v220
- AGENCY ANALYSIS に INSIGHTS タブを追加
- 自動ARCHETYPE分類（大型層厚型 / 少数精鋭型 / 新星供給型 / 安定供給型 / エース牽引型 / バランス型）
- DNA分類（漫才特化 / コント特化 / 二刀流）
- DEPTH / TOP1依存度 / BREAKTHROUGH / RETENTION / CROSSOVER を追加
- n>=3 / 5 / 10 切替、CSV出力対応

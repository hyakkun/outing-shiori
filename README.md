# outing-shiori 🗺️

AIが旅行プランを提案し、タイムライン形式のしおりとして表示・共有できるWebアプリです。

## 機能
- 出発地・日程・予算・人数・移動手段・旅スタイルを入力するとAIが旅行プランを提案
- タイムライン形式のしおりUI（日別区切り・カテゴリ別カラー）
- スポットの地図表示（OpenStreetMap + Nominatim）
- 概算費用の表示
- URLによるプラン共有

## 技術スタック
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4
- Claude API（Anthropic）
- Leaflet.js / react-leaflet
- Vercel / Vercel Functions

## ローカル開発
1. リポジトリをクローン
2. 依存関係をインストール: `npm install`
3. `.env.local` を作成し `ANTHROPIC_API_KEY` を設定（`.env.example` を参照）
4. `vercel dev` で起動（Vercel CLIが必要）

## 注意事項
- 本アプリはAIが生成した旅行プランを提示するものです
- 掲載情報の正確性は保証されません。実際の訪問前に公式情報をご確認ください
- 本サービスは個人の技術学習を目的として作成されています

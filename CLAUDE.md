# outing-shiori

## プロジェクト概要
日程・予算・出発地・人数・移動手段・旅スタイルを入力するとAIが旅行プランを提案し、
タイムライン形式の「旅のしおり」として表示。地図でスポットを確認でき、URLで共有できるWebアプリ。

## 技術スタック
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4（`@tailwindcss/vite` プラグイン方式、設定ファイル不要）
- AI提案: Claude API（Vercel Serverless Function経由）
- 地図: Leaflet + react-leaflet v5（Nominatim APIでジオコーディング）
- 共有機能: Base64 URLエンコード
- デプロイ: Vercel

## プロジェクト構成
```
api/
  generate.ts          # Vercel Serverless Function（Claude API プロキシ）
src/
  App.tsx              # メインコンポーネント（状態管理・レイアウト）
  index.css            # グローバルスタイル（カスタム背景色定義）
  components/
    PlanForm.tsx       # 入力フォーム（出発地・日程・予算・人数・移動手段・旅スタイル）
    PlanResult.tsx     # しおり表示（タイムライン・費用・共有ボタン）
    PlanMap.tsx         # Leaflet地図（スポットピン表示・ポップアップ）
  lib/
    generatePlan.ts    # API呼び出し + TravelPlan型定義 + バリデーション
    geocode.ts         # Nominatimジオコーディング（日本国内フィルタ付き）
    sharePlan.ts       # URL共有（Base64エンコード/デコード、後方互換対応）
```

## 開発ルール
- コミットメッセージは英語で記述し、gitmojiを先頭に付ける
- Co-Authored-By を末尾に付与する

## 主要な型
- `FormValues`: 入力フォームの値（departure, schedule, budget, groupSize, transport, styles）
- `ScheduleItem`: スケジュール1項目（day, time, spot, address?, description, estimatedCost, category）
- `TravelPlan`: プラン全体（destination, description, totalEstimatedCost, schedule）

## API仕様（api/generate.ts）
- POST `/api/generate`
- バリデーション: 出発地（必須・50文字以内）、日程・予算・人数・移動手段（定数リスト）、旅スタイル（最大5つ）
- レートリミット: 1IPあたり10リクエスト/分（インメモリ）
- レスポンス検証: `isValidPlan()` で構造チェック
- 費用は1人あたり金額

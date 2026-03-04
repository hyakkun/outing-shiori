# outing-shiori

## プロジェクト概要
日程・予算・出発地・人数・移動手段・旅スタイルを入力するとAIが旅行プランを提案し、
タイムライン形式の「旅のしおり」として表示。地図でスポットを確認でき、URLで共有できるWebアプリ。

## 技術スタック
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4（`@tailwindcss/vite` プラグイン方式、設定ファイル不要）
- AI提案: Claude API（Vercel Serverless Function経由）
- 地図: Leaflet + react-leaflet v5（Nominatim APIでジオコーディング）
- データ保存・共有: Supabase（plans テーブル）
- ルーティング: react-router-dom
- デプロイ: Vercel

## プロジェクト構成
```
api/
  generate.ts          # Vercel Serverless Function（Claude API プロキシ）
  save-plan.ts         # プラン保存 API（POST /api/save-plan）
  get-plan.ts          # プラン取得 API（GET /api/get-plan?id=uuid）
  supabase.ts          # Supabase クライアント初期化（サーバーサイド専用）
src/
  App.tsx              # ルーティング定義（/ と /plan/:id）・共通レイアウト
  main.tsx             # エントリポイント（BrowserRouter）
  index.css            # グローバルスタイル（カスタム背景色定義）
  components/
    PlanForm.tsx       # 入力フォーム（出発地・日程・予算・人数・移動手段・旅スタイル）
    PlanResult.tsx     # しおり表示（タイムライン・費用・共有ボタン）
    PlanMap.tsx         # Leaflet地図（スポットピン表示・ポップアップ）
  lib/
    generatePlan.ts    # API呼び出し + TravelPlan型定義 + バリデーション
    geocode.ts         # Nominatimジオコーディング（日本国内フィルタ付き）
  pages/
    SharedPlanPage.tsx # 保存済みプラン表示ページ（/plan/:id）
```

## 開発ルール
- コミットメッセージは英語で記述し、gitmojiを先頭に付ける
- Co-Authored-By を末尾に付与する

## 主要な型
- `FormValues`: 入力フォームの値（departure, schedule, budget, groupSize, transport, styles）
- `ScheduleItem`: スケジュール1項目（day, time, spot, address?, description, estimatedCost, category）
- `TravelPlan`: プラン全体（destination, description, totalEstimatedCost, schedule）

## API仕様
### POST `/api/generate`（ai/generate.ts）
- バリデーション: 出発地（必須・50文字以内）、日程・予算・人数・移動手段（定数リスト）、旅スタイル（最大5つ）
- レートリミット: 1IPあたり10リクエスト/分（インメモリ）
- レスポンス検証: `isValidPlan()` で構造チェック
- 費用は1人あたり金額

### POST `/api/save-plan`（api/save-plan.ts）
- リクエスト: `{ planData, formValues }`
- レスポンス: `{ id: uuid }`
- バリデーション: planData.destination が文字列、planData.schedule が配列

### GET `/api/get-plan`（api/get-plan.ts）
- クエリ: `?id=uuid`
- レスポンス: `{ planData, formValues }`
- UUID形式チェック、404対応

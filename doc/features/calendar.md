# カレンダー画面

## 概要

達成履歴を月単位のカレンダーで可視化する画面。

## 機能

- 月単位のカレンダー表示（7列グリッド）
- 達成した日のセルを緑色でハイライト
- 今日の日付にアンダーライン表示
- 前月・次月へのナビゲーション

## 構成

| レイヤー | ファイル | 役割 |
|---|---|---|
| Service | `src/services/achievementService.ts` | `getAchievementsByMonth` で指定月の達成日をFirestoreから取得 |
| Hook | `src/hooks/useCalendar.ts` | 年月の状態管理・月ナビゲーション・データフェッチ |
| Screen | `src/screens/CalendarScreen.tsx` | カレンダーUIの描画 |

## Firestoreクエリ

- コレクション: `users/{uid}/achievements`
- ドキュメントID: `YYYY-MM-DD`
- 月フィルタ: `documentId() >= YYYY-MM-01` かつ `documentId() <= YYYY-MM-31`

## Props（CalendarScreen）

| prop | 型 | 説明 |
|---|---|---|
| year | number | 表示年 |
| month | number | 表示月（1〜12） |
| achievedDates | Set\<string\> | 達成済み日付のセット（`YYYY-MM-DD`形式） |
| loading | boolean | データ取得中フラグ |
| onPrevMonth | () => void | 前月に移動 |
| onNextMonth | () => void | 次月に移動 |

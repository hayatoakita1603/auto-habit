# 設定画面 仕様書

## 概要

習慣名と通知時刻を変更できる画面。ボトムタブナビゲーションの「設定」タブから遷移する。

## 仕様

### 変更できる項目

| 項目 | 保存先 | 備考 |
|---|---|---|
| 習慣名 | Firestore | 最大50文字 |
| 通知時刻 | Firestore | 変更後に通知を即時再スケジュール |

### 制約

- 習慣名が空の場合は保存ボタンを無効化する
- 写真はオンボーディング時のみ設定可能（MVP時点では変更不可）

### 保存時の動作

1. Firestoreの習慣ドキュメントを更新する（`updateHabit`）
2. ローカルの写真パスを取得して通知を再スケジュールする（`scheduleHabitNotification`）

通知の再スケジュールをSettingsScreen内で直接行う理由：App.tsxのhabit状態は別の`useHabit`インスタンスが管理しており、SettingsScreenでの更新がApp.tsxの`useNotification`に反映されないため。

## 実装コンポーネント

### Service

- `habitService.ts` — `updateHabit(uid, habitId, input)` を追加

### Hook

- `useHabit.ts` — `updateHabit(input)` を追加（Firestore更新 + ローカル状態更新）

### Screen

- `SettingsScreen.tsx` — 設定画面UI

### Navigation

- `AppNavigator.tsx` — 設定タブを追加

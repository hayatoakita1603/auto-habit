# 通知機能 仕様書

## 概要

毎日決まった時刻に習慣リマインダー通知をiOSに送る。
通知にはランダムなメッセージと（設定していれば）ランダムな写真を付与する。

## 仕様

### 通知トリガー

- 毎日固定時刻（オンボーディングで設定した時刻）
- ローカル通知（Expo Notifications）

### メッセージテンプレート（3種類・ランダム選択）

1. `${habitName}の時間です!`
2. `${habitName}をやりましょう!`
3. `今日も${habitName}、一緒に頑張りましょう!`

### 写真

- オンボーディング時に最大5枚まで任意設定
- 通知ごとにランダムで1枚を添付
- 写真未設定の場合はテキストのみの通知

### 通知タップ時の動作

- アプリが開き、習慣の記録画面（HomeScreen）が表示される

## データ設計

| データ | 保存先 | キー |
|---|---|---|
| 写真ファイル | アプリドキュメントディレクトリ | `habit-photos/{filename}` |
| 写真ファイルパス（最大5件） | AsyncStorage | `habit_photo_paths_{userId}` |
| 習慣名・通知時刻 | Firestore | 既存スキーマ（変更なし） |

写真はデバイス固有のローカル通知用データのため、Firebaseには保存しない。

## 実装コンポーネント

### Services

- `notificationService.ts`
  - `scheduleHabitNotification(habit, photoPaths)` — 毎日の通知をスケジュール
  - `cancelAllNotifications()` — 既存の通知をキャンセル
  - `getRandomMessage(habitName)` — ランダムメッセージ生成（テスト容易性のため分離）

- `photoService.ts`
  - `savePhotos(userId, uris)` — 選択した写真をドキュメントディレクトリにコピーし、パスをAsyncStorageに保存
  - `loadPhotoPaths(userId)` — 保存済み写真パスを取得
  - `deletePhotos(userId)` — 保存済み写真を削除

### Hooks

- `useNotification.ts`
  - 通知のスケジュール・キャンセルを管理

### UI変更

- `OnboardingScreen.tsx` — ステップ3に写真選択を追加

```
ステップ1: 習慣名入力
ステップ2: 通知時刻設定
ステップ3: 写真を選択（任意・最大5枚）← 新規追加
ステップ4: 通知許可リクエスト（既存）
```

### App.tsx 変更

- 習慣作成後または起動時に `scheduleHabitNotification` を呼び出す

## 追加ライブラリ

- `expo-image-picker` — 写真ライブラリからの選択
- `expo-file-system` — ファイルのドキュメントディレクトリへのコピー
- `@react-native-async-storage/async-storage` — 写真パスの永続化

## 制約

- iOS専用（Android対応は対象外）
- 通知許可が拒否された場合は通知しない（再要求しない）
- 写真設定はオンボーディング時のみ（MVP時点では設定変更不可）

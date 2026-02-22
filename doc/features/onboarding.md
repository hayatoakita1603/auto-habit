# オンボーディング機能仕様

## 概要

アプリ初回利用時（習慣が未設定のとき）に表示される導入フロー。
習慣名と通知時刻を設定し、iOS通知許可を取得する。

## 表示条件

Firestoreの `users/{uid}/habits` コレクションにドキュメントが存在しない場合のみ表示する。

## 画面フロー

```
Step 1: 習慣名入力
  └─ 自由テキスト入力（例：「毎朝ランニング」）
  └─ 未入力時は「次へ」を無効化

Step 2: 通知時刻設定
  └─ 毎日固定（スケジュール種別の選択なし）
  └─ iOSネイティブの時刻ピッカーで選択

Step 3: 通知説明 + 許可リクエスト
  └─ 設定内容のサマリーを表示
  └─ ボタンタップでiOS通知許可ダイアログを表示
  └─ 許可後にFirestoreへ習慣データを保存して完了
```

## データモデル

```
Firestore: users/{uid}/habits/{habitId}
  - name: string          // 習慣名
  - schedule: DailySchedule  // 通知スケジュール
  - createdAt: Timestamp
```

```typescript
type DailySchedule = {
  type: 'daily';
  hour: number;   // 0-23
  minute: number; // 0-59
};
```

## MVP制約

- 通知スケジュールは「毎日X時」のみ（X日おき・曜日指定は設定画面で後から追加）
- 習慣は1件のみ登録可能（複数習慣は将来対応）

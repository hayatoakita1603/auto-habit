# CLAUDE.md

## プロジェクト概要

アプリ名：勝手に習慣化!!（仮）
モチベーション維持のためのiOSアプリ。毎日写真付き通知を送り、達成記録をつける。

## リポジトリ構成

```
auto-habit/
├── app/      # React Native + Expo（プロダクトコード）
├── infra/    # Terraform（Firebase / GCP）
└── doc/      # ドキュメント
```

## 技術スタック

- React Native + Expo（iOS専用）
- Firebase（Auth / Firestore / Storage）
- Expo Notifications（ローカル通知）
- Google AdMob（広告）
- Terraform（インフラ管理）

## 実装ルール

### コーディング方針
- 言語：TypeScript
- 関数はアロー関数で統一する
- `app/` 配下のコードのみ編集する
- `infra/` は Terraform ファイルのみ、アプリコードは含めない
- Firebase認証情報（`google-services.json` / `GoogleService-Info.plist`）はgit管理しない
- `infra/*.tfvars` はgit管理しない
- ロジックとUIを分離する（ビジネスロジックはhooks・servicesに集める）
- 将来の特化版アプリへの転用を意識してコンポーネント・ロジックを汎用的に設計する
- コメントは「何をしているか」ではなく「なぜそうしているか」を書く

### 開発フロー（TDD）
テストフレームワーク：Jest

以下の順序で実装する：
1. テスト作成
2. プロダクトコード実装
3. テスト実行
4. リファクタ
5. 実装完了

### 回答・実装スタンス(重要)
- 根拠に基づいて会話・回答・実装する
- 不確かな場合は「確認が必要」「わからない」と明示する
- 謙虚にふるまい、断定的な表現を避ける
- 無駄なコード・設定は書かない
- ミニマムな実装を心がける
- 必要になってから追加する（先回りして実装しない）
- 1回の実装は1機能のみとする
- 実装後は必ずユーザーに確認を取り、承認を得てから次の機能に進む
- 複数機能を一度に実装しない

### ドキュメント
- 機能の追加・変更を行った場合は必ず `doc/` 配下の該当ドキュメントを更新する
- 新機能を追加する場合は `doc/features/` に仕様書を作成する
- 要件が変わった場合は `requirements.md` を修正する

### Terraform
- クラウドリソースを追加・変更する場合は `infra/` 配下のTerraformファイルに反映する
- プロダクトコードがある程度完成してからまとめて実装する

## 開発環境

- devcontainer（VSCode）でNode・Terraformのバージョンを統一
- iOSビルドはローカルmacで実行（コンテナ外）
- ローカル検証はdev環境（Firebase）に直接通信する
- エミュレータは使用しない
- 実機確認はExpo GoアプリをiPhoneにインストールして行う

## CI/CD

### CI（GitHub Actions）- MVP時点で構築
- pushまたはPR作成時に自動実行
- Jest（テスト実行）
- terraform fmt / validate（インフラ構文チェック）

### CD - 後フェーズ
- ローカルmacでExpoビルド
- TestFlight（staging確認）
- App Store申請



MVP開発中（Phase 1）

実装順序：
1. プロジェクト立ち上げ
2. Firebase接続・匿名認証
3. オンボーディング画面
4. ホーム画面
5. 通知機能
6. カレンダー画面
7. 設定画面
8. Terraform構築（Firebaseリソース）
9. AdMob組み込み
10. App Store申請

## 環境構成

| 環境 | 用途 | インフラ構築方法 |
|---|---|---|
| dev | 開発・動作確認 | FirebaseコンソールのUIから手動構築 |
| staging | 検証・Terraform導入 | Terraformで構築 |
| prd | 本番 | Terraformで構築 |
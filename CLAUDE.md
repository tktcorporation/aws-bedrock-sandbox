# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

GenU (Generative AI Use Cases) - Amazon Bedrockをベースに構築された、ビジネスオペレーションで生成AIを実装するための包括的なAWSベースのプラットフォーム。マルチモーダル機能（テキスト、画像、動画、音声）を備えています。

## 必須コマンド

### タスク完了時の必須チェック

**重要**: 機能実装やバグ修正などのタスクを完了する際は、必ず以下のコマンドを実行してコード品質を確認してください：

```bash
npm run lint                  # リントチェックを実行
npm run web:build             # ビルドが成功することを確認
```

これらのコマンドが正常に完了することを確認してから、タスクを完了としてマークしてください。

### 開発

```bash
# 初期セットアップ（初回のみ必要）
npm ci
npm run cdk:deploy            # AWSインフラをまずデプロイ
npm run setup-env             # AWS環境変数を取得
npm run web:devw              # AWS統合付きで開発サーバーを起動

# クイック開発
npm run web:devw              # Linux/Mac AWS統合付き
npm run web:devww             # Windows PowerShell AWS統合付き
npm run web:dev               # 手動環境設定（.env.localが必要）
```

### テストと品質

```bash
npm run test                  # 全テストを実行
npm run lint                  # 全リンターを実行
npm run web:test             # フロントエンドテストのみ
npm run cdk:test             # CDKインフラストラクチャテスト
npm run cdk:test:update-snapshot  # CDKスナップショットを更新
```

### デプロイメント

```bash
npm run cdk:deploy            # チェック付きフルデプロイメント
npm run cdk:deploy:quick      # 事前チェックなしの高速デプロイメント
npm run web:build             # 本番用フロントエンドをビルド
```

### ドキュメント

```bash
npm run docs:dev              # ローカルドキュメントサーバー
npm run docs:build            # ドキュメントをビルド
npm run docs:gh-deploy        # GitHub Pagesにデプロイ
```

## アーキテクチャと構造

### モノレポパッケージ構造

- **packages/web**: Reactフロントエンド (Vite, TypeScript, Tailwind CSS, Zustand)
- **packages/cdk**: AWS CDKインフラストラクチャコード
- **packages/types**: 共有TypeScript型定義
- **packages/common**: 共有ユーティリティ関数
- **browser-extension**: Webコンテンツ抽出用Chrome/Edge拡張機能

### 主要AWSサービス

- **Amazon Bedrock**: 全AI操作のコアLLMサービス
- **Lambda + API Gateway**: WebSocketサポート付きサーバーレスバックエンド
- **Cognito**: 認証（SAML、セルフサインアップ対応）
- **S3 + CloudFront**: 静的ホスティングとCDN
- **Kendra/Knowledge Base**: RAG実装
- **Transcribe/Polly**: 音声機能

### フロントエンドアーキテクチャ

- TypeScriptストリクトモード付きReact 18
- ビルドツールとしてのVite
- 状態管理にZustand
- 認証コンポーネントにAWS Amplify UI
- 国際化にi18next（EN, JA, KO, TH, VI, ZH）
- WebSocket経由のリアルタイムストリーミング

### バックエンドアーキテクチャ

- TypeScriptのLambda関数
- チャットインターフェース用ストリーミングレスポンス
- マルチモーダルサポート（テキスト、画像、動画、音声）
- エージェント拡張用MCP（Model Context Protocol）
- WebSocket接続によるイベント駆動

## 開発ワークフロー

1. **環境設定**: CDKを使用してまずAWSにデプロイし、その後`setup-env.sh`を実行してCloudFormation出力を取得
2. **ローカル開発**: http://localhost:5173でホットリロード付きで実行
3. **マルチ環境**: CDKコンテキスト経由でdev/staging/prodデプロイメントをサポート
4. **プリコミットフック**: Huskyがステージングファイルでリンターを実行
5. **テスト**: ユニットテストにJest、インフラストラクチャにCDKスナップショットテスト

## 重要な設定ファイル

- **packages/cdk/cdk.json**: CDK設定と機能フラグ
- **packages/web/.env.local**: フロントエンド環境変数（setup-env.shで自動生成）
- **.mise.toml**: 開発ツールバージョン（Node 24）
- **mkdocs.yml**: ドキュメント設定

## コアユースケース

プラットフォームは15以上の組み込みユースケースを提供：チャット、テキスト生成、要約、翻訳、画像/動画生成、RAGチャット、Web検索付きエージェントチャット、カスタムユースケースビルダー。各ユースケースはモジュラーなLambdaハンドラーとフロントエンドコンポーネントを持っています。

## 個別コンポーネントのテスト

```bash
# 特定パッケージのテスト
cd packages/web && npm test
cd packages/cdk && npm test

# 特定テストファイルの実行
npm test -- path/to/test.spec.ts

# スナップショットの更新
npm run cdk:test:update-snapshot
```

## 国際化

すべてのユーザー向け文字列はi18nextを使用する必要があります。翻訳ファイルは`packages/web/src/i18n/*.yml`にあります。カスタムESLintルールがハードコードされた文字列を防ぐためにこのパターンを強制します。

# Upstream Repository Tracking

このドキュメントは、元のリポジトリ（aws-samples/generative-ai-use-cases）との差分を追跡する方法を説明します。

## セットアップ（完了済み）

```bash
# 元のリポジトリをupstreamとして追加
git remote add upstream https://github.com/aws-samples/generative-ai-use-cases.git
```

## 差分の確認方法

### 1. 最新情報の取得

```bash
# upstreamの最新情報を取得
git fetch upstream
```

### 2. 差分の確認

```bash
# upstream/mainと現在のブランチの差分を確認（コミット一覧）
git log --oneline --graph --decorate upstream/main..HEAD

# 逆に、upstream/mainの新しいコミットを確認
git log --oneline --graph --decorate HEAD..upstream/main

# ファイルレベルでの差分を確認
git diff upstream/main

# 統計情報付きで差分を確認
git diff --stat upstream/main

# 特定のファイルの差分を確認
git diff upstream/main -- path/to/file
```

### 3. マージベースの確認

```bash
# 共通の祖先コミットを確認
git merge-base HEAD upstream/main
```

### 4. upstreamの更新を取り込む場合

```bash
# マージする場合（マージコミットが作成される）
git merge upstream/main

# リベースする場合（履歴が線形になる）
git rebase upstream/main
```

## 便利なエイリアス

`.gitconfig`に以下を追加すると便利です：

```bash
# ~/.gitconfig または .git/config に追加
[alias]
    # upstreamとの差分を確認
    upstream-diff = diff upstream/main
    upstream-log = log --oneline --graph --decorate upstream/main..HEAD
    upstream-new = log --oneline --graph --decorate HEAD..upstream/main
```

## 注意事項

- このリポジトリは独自の変更を含んでいるため、upstreamの更新を取り込む際はコンフリクトが発生する可能性があります
- 大きな更新がある場合は、別ブランチで試してから本番ブランチに適用することを推奨します
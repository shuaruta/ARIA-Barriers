# ローカル開発環境

ローカル環境は [GitHub Actions の Jekyll ワークフロー](../.github/workflows/jekyll.yml) と同じバージョン・手順に揃えます。

## バージョン（CI と共通）

| ツール | バージョン | CI での指定 |
|--------|------------|-------------|
| Ruby | **3.2.2** | `ruby-version: '3.2.2'` |
| Bundler | **2.5.18** | `Gemfile.lock` の `BUNDLED WITH` |
| Node.js | **20** | `node-version: '20'` |

リポジトリ直下の次のファイルが同じ内容を指します。

- `.ruby-version` … rbenv / chruby / mise / asdf など
- `.nvmrc` / `.node-version` … nvm / fnm / mise など
- `.tool-versions` … mise / asdf

## 初回セットアップ

### 1. Ruby 3.2.2

**rbenv（例）**

```shell
brew install rbenv ruby-build
rbenv install 3.2.2   # 未インストールの場合
cd /path/to/ARIA-Barriers
rbenv local 3.2.2     # .ruby-version を読む
ruby -v               # ruby 3.2.2 であること
```

**mise（例）**

```shell
mise install          # .tool-versions を読む
ruby -v
```

Homebrew の `ruby`（3.4 系など）だけを使っている場合、`bundle install` で Ruby バージョン不一致の警告が出ます。上記のいずれかで **3.2.2** に切り替えてください。

### 2. Ruby 依存関係

```shell
gem install bundler -v 2.5.18   # 初回のみ（Gemfile.lock に合わせる）
bundle install
```

CI では `ruby/setup-ruby` の `bundler-cache: true` により、同じく `bundle install` が実行されます。

### 3. Node.js 20 と npm 依存関係

```shell
# nvm の例
nvm install    # .nvmrc を読む
nvm use

npm install    # CI と同じコマンド（npm i でも可）
```

## 日常のコマンド

### 開発サーバー（プレビュー）

```shell
bundle exec jekyll serve --host 0.0.0.0
```

ブラウザ: **http://localhost:4000/**

VS Code では **実行とデバッグ** → **Jekyll: serve**（`.vscode/launch.json`）でも同じコマンドを起動できます。

### CI と同じビルド（ローカル確認）

PR を出す前に、Actions と同様のビルドを試す場合:

```shell
export JEKYLL_ENV=production
bundle exec jekyll build --trace
```

または:

```shell
./bin/ci-build
```

成果物は `_site/` に出力されます。

**CI との違い:** GitHub Pages デプロイ時は `jekyll build` に `--baseurl` が付きます（`actions/configure-pages` の出力）。ローカルプレビューでは通常 `--baseurl` は不要です。

## トラブルシュート

### `cannot load such file -- .../bundler-2.5.18/exe/bundle`

Bundler の gem 実体とスタブがずれているときに起きます。

```shell
gem uninstall bundler -v 2.5.18
gem install bundler -v 2.5.18
bundle install
```

### `Your Ruby version is X, but your Gemfile specified 3.2.2`

`.ruby-version` のとおり **Ruby 3.2.2** に切り替えてから `bundle install` をやり直してください。

### PostCSS / Tailwind が効かない

`npm install` を忘れていないか確認してください。CI でも `npm install` の後に Jekyll ビルドが走ります。

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| [`.github/workflows/jekyll.yml`](../.github/workflows/jekyll.yml) | CI/CD（ビルド・Pages デプロイ） |
| [`Gemfile`](../Gemfile) / [`Gemfile.lock`](../Gemfile.lock) | Ruby 依存関係 |
| [`package.json`](../package.json) | PostCSS / Tailwind |
| [`.vscode/launch.json`](../.vscode/launch.json) | VS Code から開発サーバー起動 |

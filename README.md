# ARIA-Barriers

## 開発環境

**Ruby 3.2.2** と **Node.js 20** で揃えます（[GitHub Actions](.github/workflows/jekyll.yml) と同じ）。

詳しい手順・トラブルシュートは **[docs/development.md](docs/development.md)** を参照してください。

### クイックスタート

```shell
# Ruby 3.2.2 / Node 20 に切り替えたうえで
bundle install
npm install
bundle exec jekyll serve --host 0.0.0.0
```

### CI と同じビルド

```shell
./bin/ci-build
```

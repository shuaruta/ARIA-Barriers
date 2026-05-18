---
title: プログレスバーのビープ音が aria-valuemax を無視する問題 — NVDA の仕様とワークアラウンド
layout: default
---

この記事は[24motz](https://x.com/24motz) が執筆しました。

NVDA のプログレスバー報告機能は、徐々に高くなるビープ音で進捗を伝えます。特徴的なこの動作は、日本のユーザーに「仮装大賞の効果音のようだ」と言われることもある、よく知られた機能です。

この機能は、もともと Windows デスクトップアプリケーションのプログレスバーを対象に実装されました。Windows のアクセシビリティ API（MSAA）では、プログレスバーは常にパーセンテージ（0%〜100%）で値を返す前提でした。一方、ウェブにプログレスバーに相当するアクセシビリティ API が整備されたのは、WAI-ARIA 1.0（2014年）で `progressbar` ロールが登場してからです。

この歴史的な経緯が、現在の Web プログレスバーと NVDA の間に残る「ずれ」の背景にあります。具体的には、`aria-valuemax` が 100 以外に設定されたプログレスバーで、NVDA が誤った音の高さのビープ音を鳴らす問題が知られています。

## 問題の概要

ARIA の `progressbar` ロールでは、進捗範囲を `aria-valuemin` と `aria-valuemax` で定義し、現在値を `aria-valuenow` で指定します。仕様上、支援技術はこれらからパーセンテージを計算すべきとされています。

しかし NVDA は、ブラウザがアクセシビリティツリーに渡す値（通常は正規化されたパーセンテージ）をそのまま使ってビープ音の高さを決定します。`aria-valuemax` が明示的に 100 以外に設定されている場合でも、ブラウザ側の正規化が不十分だと、`aria-valuenow` の値がそのままパーセンテージとして扱われ、誤った音の高さでビープ音が鳴ります。

**具体例:** `aria-valuemax="3"` `aria-valuenow="1"` の場合

- 期待される動作: 33% の進捗として、やや低めのビープ音
- 実際の動作: 1% の進捗として、非常に低いビープ音（または進捗開始直後の音）

### デモ

<div role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="1" style="width:200px;height:20px;background:#eee;border:1px solid #999;border-radius:4px;overflow:hidden;margin:1em 0;">
  <div style="width:33%;height:100%;background:#4a90d9;transition:width 0.3s;"></div>
</div>

<p><button onclick="updateDemo()">進捗を進める</button> <span id="demo-status" aria-live="polite">1 / 3 (33%)</span></p>
<script>
let demoVal = 1;
function updateDemo() {
  demoVal = demoVal >= 3 ? 1 : demoVal + 1;
  const bar = document.querySelector('[role="progressbar"]');
  bar.setAttribute('aria-valuenow', demoVal);
  bar.querySelector('div').style.width = (demoVal/3*100) + '%';
  document.getElementById('demo-status').textContent = demoVal + ' / 3 (' + Math.round(demoVal/3*100) + '%)';
}
</script>

```html
<div role="progressbar"
  aria-valuemin="0" aria-valuemax="3" aria-valuenow="1"
  style="width:200px;height:20px;background:#eee;border:1px solid #999;border-radius:4px;overflow:hidden;margin:1em 0;">
  <div style="width:33%;height:100%;background:#4a90d9;transition:width 0.3s;"></div>
</div>
```

比較のために `aria-valuemax="100"` で、見た目は同じ 3 段階（33%・66%・100%）になるデモも用意しました。

<div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="33" style="width:200px;height:20px;background:#eee;border:1px solid #999;border-radius:4px;overflow:hidden;margin:1em 0;">
  <div style="width:33%;height:100%;background:#4a90d9;transition:width 0.3s;"></div>
</div>

<p><button onclick="updateDemo100()">進捗を進める</button> <span id="demo-status-100" aria-live="polite">33 / 100 (33%)</span></p>
<script>
const demoSteps100 = [33, 66, 100];
let demoStep100 = 0;
function updateDemo100() {
  demoStep100 = (demoStep100 + 1) % demoSteps100.length;
  const demoVal100 = demoSteps100[demoStep100];
  const bars = document.querySelectorAll('[role="progressbar"]');
  const bar = bars[1];
  bar.setAttribute('aria-valuenow', demoVal100);
  bar.querySelector('div').style.width = demoVal100 + '%';
  document.getElementById('demo-status-100').textContent = demoVal100 + ' / 100 (' + demoVal100 + '%)';
}
</script>

NVDA で各プログレスバーにフォーカスし、ボタンで段階を進めたときのビープ音を比べてください。上のバー（`aria-valuemax="3"`）では `aria-valuenow` が 1 の段階で 1% 相当の低い音になることがあります。下のバー（`aria-valuemax="100"`）では同じ見た目の段階で 33% 相当の音になることが多いです。実際の動作はブラウザと NVDA のバージョンに依存します。

NVDA の設定「オブジェクト表示」の「プログレスバー出力」は「オフ」「読み上げ」「ビープ音」「ビープ音と読み上げ」のいずれかに設定できます。ビープ音の比較では「ビープ音」または「ビープ音と読み上げ」を選んでください。

## NVDA が valuemax を考慮しない理由

### ARIA 仕様と「SHOULD」の構造

W3C の ARIA 仕様は、`aria-valuenow` の扱いについて次のように定めています。

- コンテンツ作者は `aria-valuenow` とともに `aria-valuemin` / `aria-valuemax` を提供すべき（SHOULD）
- ブラウザはこれらの値をアクセシビリティ API に渡すべき（SHOULD）
- 支援技術は `aria-valuenow` を min/max から計算したパーセンテージとして表示すべき（SHOULD）

ここで重要なのは、3 層すべてが「SHOULD（強く推奨）」であり、**MUST（絶対要件）ではない**ことです。誰かが SHOULD を守らなくても仕様違反にはなりません。しかも、「誰がパーセンテージ計算の責任を負うのか」は ARIA 仕様本体・Core-AAM（API マッピング仕様）・APG（実装ガイド）に分散して記述されており、統合的な線引きはありません。

### ブラウザ実装とスクリーンリーダー実装の依存関係

実際の動作は、ブラウザとスクリーンリーダーの 2 段階の実装に依存します。

1. **ブラウザがアクセシビリティ API に何を渡すか** — ブラウザによっては `aria-valuenow` の生の値をそのまま渡し、正規化（min/max からのパーセンテージ計算）を行わないものもあります。
2. **スクリーンリーダーがその値をどう解釈するか** — ここで 2つのアプローチに分かれます。
   - **ブラウザを信頼する実装**: アクセシビリティ API から受け取った値はすでにパーセンテージに正規化されていると前提し、そのまま使う。NVDA はこちら。
   - **ブラウザを信頼しない実装**: 受け取った値に加えて DOM の `aria-valuemax` を直接参照し、独自にパーセンテージを再計算する。他のスクリーンリーダーにはこのアプローチを取るものもあります。

NVDA の「ブラウザを信頼する」アプローチは、パフォーマンス面では合理的です。プログレスバーは短い間隔で頻繁に更新されるため、更新のたびに DOM を読みに行くとオーバーヘッドが大きくなります。しかし、ブラウザが正規化していない値を渡してきた場合、誤ったビープ音が鳴るという副作用があります。

この問題は 2017年に Issue として報告されています。

- **Issue:** [NVDA not using aria-valuemax (nvaccess/nvda#6906)](https://github.com/nvaccess/nvda/issues/6906)
  - 2017年2月に報告され、最終的に「not planned」としてクローズ

議論の中で示された主な理由:

1. **ビープ音の高さの計算が複雑化する** — 現在の実装では、ブラウザから渡された単一の数値（パーセンテージ）をそのまま音の高さにマッピングしています。`aria-valuemax` を毎回参照して独自にパーセンテージを再計算するには、内部の処理を大幅に変更する必要があります。

2. **既存の正常動作へのリスク** — すでに正しく動いている大多数のプログレスバー（valuemax=100 のケース）に、修正によって副作用が出る可能性があります。

3. **ブラウザ側の責任という見解** — W3C 仕様では、`aria-valuemin` と `aria-valuemax` からパーセンテージを計算してアクセシビリティツリーに渡すのはブラウザの役割とされています。NVDA 側で毎回 DOM 属性を直接参照するのは責務の重複になります。

4. **パフォーマンスへの懸念** — プログレスバーは短い間隔で頻繁に更新されるため、更新のたびに DOM 属性を読みに行くとパフォーマンス低下を招きます。ブラウザがアクセシビリティツリー経由で渡す値に依存する方が効率的です。

5. **aria-valuetext の推奨** — 数値計算に頼らず、`aria-valuetext` で明示的にテキスト表現を提供することが推奨されています。

## Windows ネイティブと Web、分離した 2つのモデル

この問題の背景には、プログレスバーをめぐる Windows と Web の設計の違いがあります。

Windows の MSAA（Microsoft Active Accessibility）は、プログレスバー（`ROLE_SYSTEM_PROGRESSBAR`）の値変更イベントを特にフィルターせず、そのまま支援技術に渡していました。これにより、NVDA は値の変化を検知してビープ音を鳴らす機能を実装できたのです。値は常にパーセンテージ（0%〜100%）だったため、その前提で音の高さを決める仕組みが作られました。NVDA+U でビープ／音声／両方／オフを切り替えられる、現在も使われている仕組みです。

一方、Web の ARIA はこの機能を **2つに分離** しました。

- **`role="progressbar"`**: 値のセマンティクス（min/max/now）を提供するが、**ライブリージョンではない**。つまり値が変わっても自動通知されない
- **`aria-live`**: 動的な更新をユーザーに通知する。WCAG テクニック ARIA25 がこの併用を求めている

つまり、Windows では MSAA が値を素通ししていたから NVDA がビープ音を実装できたのに対し、Web では「プログレスバー（意味）」と「ライブリージョン（通知）」が明確に分離されたのです。

NVDA のビープ音機能は、この分離を前提としていません。`role="progressbar"` を見つけると Windows ネイティブと同じようにビープ音を鳴らそうとしますが、値の解釈はブラウザのアクセシビリティ API マッピングに依存します。ここで valuemax のずれが生じるのです。

なお、Windows のスライダー UI（UIA の `RangeValuePattern`）にもよく似た値解釈の問題がありました。こちらは別の記事で詳しく取り上げる予定です。

## 関連する既知の問題

プログレスバー周辺には、他にも以下のような問題が報告されています。

### aria-valuetext がビープ音を抑制する

- **Issue:** [aria-valuetext for progress bars not working (nvaccess/nvda#913)](https://github.com/nvaccess/nvda/issues/913)
  - 2010年から報告されている古い問題です
  - `aria-valuetext` を設定すると、NVDA がビープ音を出さなくなります。これは `aria-valuetext` が数値の `aria-valuenow` を上書きしてしまい、ビープ音の計算に必要な数値が取れなくなるためです

### ラベルが読み上げられない

- **Issue:** [NVDA ignores progressbar elements with no text content (nvaccess/nvda#13904)](https://github.com/nvaccess/nvda/issues/13904)
  - `aria-label` で名前が付けられたプログレスバーがブラウズモードで無視されます

- **Issue:** [Label of ARIA progress bar not reported in browse mode if labelled by inner content (nvaccess/nvda#16204)](https://github.com/nvaccess/nvda/issues/16204)
  - 内部コンテンツでラベル付けされたプログレスバーの名前がブラウズモードで報告されません

### 幅0・高さ0のプログレスバー

- **Issue:** [NVDA skips elements with zero width or height (nvaccess/nvda#13897)](https://github.com/nvaccess/nvda/issues/13897)
  - 値が 0 で CSS 幅も 0 のプログレスバーが NVDA の出力から完全に除外されます
  - この問題は [NVDA 2026.1 で修正済み](https://aria-barriers.shuaruta.com/2026/02/15/nvda-zero-size-controls-browse-mode.html)（Firefox のブラウズモード）

### meter 要素の値範囲

- **Issue:** [Min and max value not read out for \u003cmeter\u003e element (nvaccess/nvda#16678)](https://github.com/nvaccess/nvda/issues/16678)
  - `<meter>` 要素（および `role="meter"`）でも min/max 値が読み上げられません

## 実装者向けワークアラウンド

WCAG のテクニック ARIA25 も、「プログレスバーの値を伝えるために aria-live リージョンを使うこと」を達成方法として挙げています。仕様策定側も、progressbar ロール単体では動的な値の伝達に限界があることを認識しているのです。

NVDA の現在の挙動を前提に、プログレスバーをアクセシブルに実装する方法です。

### 1. aria-valuetext を数値と併用する

`aria-valuenow` に加えて `aria-valuetext` を設定することで、ビープ音の誤動作を防ぎつつ、正しいテキスト情報を提供できます。ただし Issue #913 にあるように、`aria-valuetext` がビープ音自体を抑制する場合があるため、NVDA のバージョンとブラウザの組み合わせでテストが必要です。

```html
<div role="progressbar"
     aria-valuemin="0"
     aria-valuemax="3"
     aria-valuenow="1"
     aria-valuetext="ステップ 1/3 (33%)"
     aria-label="処理の進捗">
</div>
```

### 2. aria-live リージョンを併用する

`progressbar` ロール自体はライブリージョンではないため、値の変化が自動的には読み上げられません。別途 `aria-live` リージョンを用意し、進捗更新時にテキストを挿入する方法が最も確実です。

```html
<div role="progressbar"
     aria-valuemin="0"
     aria-valuemax="3"
     aria-valuenow="1"
     aria-label="処理の進捗">
</div>
<div aria-live="polite" class="sr-only">
  <!-- 進捗更新時にここにテキストを挿入 -->
  ステップ 1/3 完了 (33%)
</div>
```

### 3. valuemax を 100 に正規化する

可能であれば、`aria-valuemax` を 100 に固定し、表示上の値（例: 1/3 → 33）を `aria-valuenow` に設定します。これにより NVDA のビープ音が正しく動作します。

### 4. ネイティブの `<progress>` 要素を使う

ブラウザが適切にアクセシビリティ情報を提供するため、カスタム実装よりも `<progress>` 要素の使用が推奨されます。

```html
<label for="upload-progress">ファイルアップロード:</label>
<progress id="upload-progress" max="3" value="1"></progress>
```

## まとめ

- **NVDA の valuemax 無視**: 仕様バグではなく設計上の制約。「not planned」
- **責任の所在**: ブラウザが正規化すべき（W3C仕様）
- **現実的な対応**: aria-valuetext + aria-live の併用
- **長期展望**: ブラウザ側の改善が進めば自然解決

Web のプログレスバーのアクセシビリティは、ARIA 仕様・ブラウザ実装・スクリーンリーダー実装の 3 層が絡む複雑な問題です。仕様上「ブラウザがやるべき」とされていても、実際には各層で実装の差があるため、開発者側でのワークアラウンドが現実的な対策になります。`aria-valuetext` や `aria-live` リージョンの併用によって、現状の NVDA でも適切なフィードバックを提供することが可能です。

## 参考

- [NVDA not using aria-valuemax (nvaccess/nvda#6906)](https://github.com/nvaccess/nvda/issues/6906)
- [aria-valuetext for progress bars not working (nvaccess/nvda#913)](https://github.com/nvaccess/nvda/issues/913)
- [NVDA ignores progressbar elements with no text content (nvaccess/nvda#13904)](https://github.com/nvaccess/nvda/issues/13904)
- [Label of ARIA progress bar not reported in browse mode (nvaccess/nvda#16204)](https://github.com/nvaccess/nvda/issues/16204)
- [NVDA skips elements with zero width or height (nvaccess/nvda#13897)](https://github.com/nvaccess/nvda/issues/13897)
- [Min and max value not read for meter element (nvaccess/nvda#16678)](https://github.com/nvaccess/nvda/issues/16678)
- [MDN: ARIA progressbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role)

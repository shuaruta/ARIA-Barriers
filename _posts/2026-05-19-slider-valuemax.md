---
title: スライダー UI の値が 0-100 として読み上げられる問題 — MSAA・UIA の歴史と NVDA の対応
layout: default
---

この記事は[24motz](https://x.com/24motz) が執筆しました。

[前回の記事](https://aria-barriers.shuaruta.com/2026/05/18/progress-bar-beep.html)では、Web のプログレスバーで `aria-valuemax` が無視され、NVDA のビープ音が誤った高さで鳴る問題を取り上げました。この問題の背景には、Windows のアクセシビリティ API に根付いた「範囲コントロールの値は常に 0-100 である」という前提があります。

今回は、この前提が **スライダー UI** にどのような問題を引き起こしてきたのか、そして NVDA がどのように対応したのかを見ていきます。

## HTML のスライダーと ARIA の slider ロール

HTML にはネイティブのスライダー要素として `<input type="range">` が用意されています。

```html
<label for="volume">音量:</label>
<input type="range" id="volume" min="0" max="100" value="50">
```

ブラウザはこの要素に暗黙的に `role="slider"` を付与し、`min`/`max`/`value` 属性をアクセシビリティ API にマッピングします。構造は `<progress>` 要素や `role="progressbar"` とほぼ同じで、min/max/value の 3 属性で範囲を表現します。

違いは、スライダーは**ユーザーが操作できる**ことです。キーボードの矢印キーで値を増減でき、スクリーンリーダーはその都度新しい値を読み上げます。

### デモ

<div>
  <label for="demo-slider">評価（1〜5）:</label>
  <input type="range" id="demo-slider" min="1" max="5" value="3" step="1" style="width:200px;">
  <output id="demo-value" for="demo-slider">3</output>
</div>
<script>
document.getElementById('demo-slider').addEventListener('input', function() {
  document.getElementById('demo-value').textContent = this.value;
});
</script>

```html
<label for="demo-slider">評価（1〜5）:</label>
<input type="range" id="demo-slider" min="1" max="5" value="3" step="1">
<output id="demo-value" for="demo-slider">3</output>
<script>
document.getElementById('demo-slider').addEventListener('input', function() {
  document.getElementById('demo-value').textContent = this.value;
});
</script>
```

NVDA でこのスライダーを操作すると、値の読み上げが min/max を考慮せず「3%」のようにパーセンテージで読まれることがあります。本来は「3」または「5段階中3」と読み上げられるべきです。

## Windows ネイティブのスライダー問題

この「値が常にパーセンテージ化される」問題は、Web よりも先に Windows ネイティブアプリケーションで顕在化していました。

### Issue #1535: Slider control value always in 0-100 range（2011年）

- **Issue:** [Slider control value always in 0-100 range (nvaccess/nvda#1535)](https://github.com/nvaccess/nvda/issues/1535)
  - 2011年に報告。WPF アプリケーションで `Slider.Maximum` と `Slider.Minimum` を任意の値に設定しても、NVDA は常に 0-100 の範囲で値を読み上げていました。
  - 報告者は「これはバグか？それとも Microsoft のアクセシビリティガイドライン通りの正しい動作か？」と質問しています。

### Issue #9669: UAC スライダーで値変更時に沈黙（2019年）

- **Issue:** [NVDA Doesn't Read As the Value of Certain Sliders Change (nvaccess/nvda#9669)](https://github.com/nvaccess/nvda/issues/9669)
  - UAC（ユーザーアカウント制御）の通知レベルスライダーで、矢印キーで値を変えても NVDA が完全に沈黙する問題。
  - 原因は、UIA の `ValuePattern` と `RangeValuePattern` の両方を実装しているコントロールで、NVDA がどちらの値を使うべきか判断できなかったことです。

これらの問題の根底にあるのは、MSAA（Microsoft Active Accessibility）以来の設計前提です。MSAA の範囲コントロールは、値を常にパーセンテージとして返すことが一般的でした。この前提が UIA に移行した後も、互換性のために残り続けていたのです。

## NVDA 2023.3 での修正

NVDA 2023.3 で、UIA スライダーの値解釈が改善されました。

**変更内容:** UIA 要素が `ValuePattern` と `RangeValuePattern` の両方を実装している場合、`ValuePattern` を優先するようになりました。これにより、アプリケーションが明示的に提供する文字列値（例: 「中」や「80%」）がそのまま読み上げられます。

**解決したこと:**
- UAC スライダーの沈黙問題
- WPF アプリケーションのスライダーで任意の min/max 範囲が正しく読み上げられるように

**残っていること:**
- この修正は **UIA を直接使うネイティブアプリケーション**が対象です
- Web の ARIA `slider` は、ブラウザが ARIA 属性を UIA（または IAccessible2）にマッピングするレイヤーを経由するため、同じ問題が別の形で残っています

## Web のスライダーでの valuemax 問題

前回の記事で詳しく見たように、NVDA はブラウザがアクセシビリティ API に渡す値を「すでに正規化されたパーセンテージ」と前提して扱います。この前提はプログレスバーでもスライダーでも同じです。

`<input type="range" min="1" max="5" value="3">` のようなスライダーで、NVDA が値をパーセンテージとして読み上げる問題は、まさにこの前提に由来します。

**回避策:**
- min/max を 0-100 の範囲に正規化し、表示上の値は別途 `<output>` 要素などで伝える
- `aria-valuetext` で明示的なテキスト表現を提供する

```html
<input type="range" min="0" max="100" value="50"
       aria-valuetext="3（5段階中）"
       aria-label="評価">
<output>3 / 5</output>
```

この `aria-valuetext` による回避策は、実は [APG の Rating Slider 例](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-rating/)でも採用されています。APG の実装は、初期化時とフォーカス喪失時に「3 of 5 stars」のように最大値を含む文字列を `aria-valuetext` で提供しており、値変更のたびに最大値を繰り返す煩わしさを避ける工夫も施されています。APG が `aria-valuetext` を積極的に使っているのは、まさに「ブラウザ経由で valuemax がスクリーンリーダーに正しく伝わらない」という現実への対応と言えるでしょう。

## まとめ

- **MSAA 由来の 0-100 前提**: 設計上の制約で、後方互換性のために残り続けている
- **NVDA の UIA スライダー修正**: 2023.3 で改善され、ValuePattern が優先されるように
- **Web スライダーの valuemax 問題**: ブラウザの API マッピングに依存し、未解決
- **実装者の現実解**: min/max を 0-100 に正規化するか、aria-valuetext を併用する

プログレスバーとスライダーに共通するこの問題は、Windows アクセシビリティ API の歴史的な設計判断と、後から整備された Web 標準（ARIA）の間の「ずれ」に起因しています。仕様や実装が完全に一致する日を待つよりも、この「ずれ」を理解した上で、確実に動く実装を選ぶことが現実的な対応です。

## 参考

- [Slider control value always in 0-100 range (nvaccess/nvda#1535)](https://github.com/nvaccess/nvda/issues/1535)
- [NVDA Doesn't Read As the Value of Certain Sliders Change (nvaccess/nvda#9669)](https://github.com/nvaccess/nvda/issues/9669)
- [NVDA 2023.3 変更履歴](https://download.nvaccess.org/releases/2023.3/documentation/changes.html)
- [WAI-ARIA Authoring Practices: Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- [APG: Range-related Properties](https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/)
- [APG Rating Slider Example](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-rating/)
- [MDN: input type="range"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range)
- [MDN: ARIA slider role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/slider_role)

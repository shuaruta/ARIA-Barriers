---
title: NVDA のブラウズモードで「幅0・高さ0」のコントロールが一貫して読めるようになる変更
layout: default
---

この記事は[24motz](https://x.com/24motz) が執筆しました。

スクリーンリーダー NVDA 2026.1 以降では、ウェブブラウザのブラウズモードにおいて、**視覚的な幅または高さが 0 のコントロールを、もう「非表示」として扱わない**ようになります。

この変更により、スクリーンリーダー向けにだけ見せたい（視覚的には隠したい）コンテンツを、幅0・高さ0で実装しているサイトでも、NVDA のブラウズモードでアクセスできるようになります。

**このページには、NVDA で実際に操作できるデモがあります。** 以下の「体験コーナー」で、ブラウズモードの挙動を試してみてください。変更の対象は **Firefox** のブラウズモード（gecko_ia2）です。

## 変更の概要

- **Issue:** [NVDA skips elements with zero width or height (nvaccess/nvda#13897)](https://github.com/nvaccess/nvda/issues/13897)
- **修正 PR:** [gecko_ia2 vbuf: Don't treat controls with 0 width or height as invisible (nvaccess/nvda#19146)](https://github.com/nvaccess/nvda/pull/19146)
- **対象:** ブラウズモード（Firefox の gecko_ia2 仮想バッファ）。2026.1 マイルストーンでマージ済み。

## これまで何が起きていたか

これまでの NVDA では、ウェブページ上で「アクセシビリティツリーには出ているが、描画上の幅または高さが 0 で、かつ子要素がない」ようなコントロールを、**非表示**とみなしてブラウズモードの仮想バッファから除外していました。

一方で、多くのサイトでは次のような実装が使われています。

- カスタムのラジオボタン・チェックボックス（見た目用の要素は表示し、実際のフォームコントロールは `width: 0; height: 0` などで視覚的に隠す）
- スクリーンリーダー専用の「名前の代わりに入力」ボタン（署名欄の横にオフスクリーンで配置されるなど）
- プログレスバーで値が 0 のとき、CSS で幅 0 になっている要素にセマンティクスを載せているパターン

ブラウザはこうした要素もアクセシビリティツリーに載せており、JAWS など他スクリーンリーダーでは読めていました。NVDA だけが「幅0・高さ0」を理由に除外していたため、**他では動くコンテンツが NVDA ではブラウズモードでアクセスできない**という相互運用性の問題が起きていました。

PR の説明にもあるとおり、この挙動は「ウェブがずっとシンプルだった昔」に実装されたもので、今日では「ブラウザが明示的にツリーに載せたものを信頼する」方向に寄せることが、NVDA ユーザー全体の利益になると判断されての変更です。

## 体験コーナー

以下は、いずれも**視覚的には幅0・高さ0**（またはオフスクリーン）で配置されたコントロールです。**Firefox** でこのページを開き、**NVDA のブラウズモード**で下矢印キーを押しながら進んでみてください。

- **NVDA 2026.1 以降:** ラジオボタン・ボタン・プログレスバーがブラウズモードで読まれます（ラジオボタンとボタンは操作できます）。
- **それより前の NVDA:** これらのコントロールはブラウズモードでは飛ばされ、フォーカスモード（Tab でフォーカスを移す）でないと操作できないことがあります。

---

### デモ1: 幅0・高さ0のラジオボタン（カスタムUIでよくあるパターン）

見た目用のラベルだけ表示し、実際のラジオボタンは `width: 0; height: 0` で隠しています。ブラウズモードで「オプション A」「オプション B」「オプション C」のラジオボタンとして読めるか、選択できるかを試してください。

<div role="group" aria-labelledby="zerodemo-group-label" class="my-6 p-4 border border-gray-300 rounded">
  <p id="zerodemo-group-label" class="font-bold mb-2">メンテナンスドローンを選択</p>
  <div class="flex flex-wrap gap-4">
    <span style="display:inline-block;">
      <input type="radio" name="zerodemo-drone" id="zerodemo-r1" value="a" style="width:0;height:0;margin:0;padding:0;border:0;position:absolute;clip:rect(0,0,0,0);" aria-label="オプション A">
      <label for="zerodemo-r1">オプション A</label>
    </span>
    <span style="display:inline-block;">
      <input type="radio" name="zerodemo-drone" id="zerodemo-r2" value="b" style="width:0;height:0;margin:0;padding:0;border:0;position:absolute;clip:rect(0,0,0,0);" aria-label="オプション B">
      <label for="zerodemo-r2">オプション B</label>
    </span>
    <span style="display:inline-block;">
      <input type="radio" name="zerodemo-drone" id="zerodemo-r3" value="c" style="width:0;height:0;margin:0;padding:0;border:0;position:absolute;clip:rect(0,0,0,0);" aria-label="オプション C">
      <label for="zerodemo-r3">オプション C</label>
    </span>
  </div>
</div>

```html
<div role="group" aria-labelledby="zerodemo-group-label">
  <p id="zerodemo-group-label">メンテナンスドローンを選択</p>
  <span>
    <input type="radio" name="zerodemo-drone" id="zerodemo-r1" value="a"
      style="width:0;height:0;margin:0;padding:0;border:0;
             position:absolute;clip:rect(0,0,0,0);"
      aria-label="オプション A">
    <label for="zerodemo-r1">オプション A</label>
  </span>
  <!-- オプション B, C も同様 -->
</div>
```

---

### デモ2: スクリーンリーダー専用の「名前の代わりに入力」ボタン

署名欄などでよくある「描画の代わりに名前を入力」するための、視覚的に隠したボタンです。ブラウズモードで探して Enter で押してみてください。押すとメッセージが表示されます。

<div class="my-6 p-4 border border-gray-300 rounded" style="position:relative;">
  <p class="mb-2">署名（キャンバス）の代わりに:</p>
  <button type="button" id="zerodemo-sr-only-btn" style="width:0;height:0;margin:0;padding:0;border:0;position:absolute;clip:rect(0,0,0,0);overflow:hidden;display:block;" aria-label="名前を入力する">名前を入力する</button>
  <span aria-hidden="true">（画面では見えません）</span>
</div>

```html
<button type="button"
  style="width:0;height:0;margin:0;padding:0;border:0;
         position:absolute;clip:rect(0,0,0,0);
         overflow:hidden;display:block;"
  aria-label="名前を入力する">名前を入力する</button>
```

<script>
(function() {
  var btn = document.getElementById('zerodemo-sr-only-btn');
  if (btn) btn.addEventListener('click', function() { alert('スクリーンリーダー用の「名前を入力する」ボタンが押されました。'); });
})();
</script>

---

### デモ3: 値が 0 のプログレスバー（幅0）

進捗 0% のため、CSS で幅 0 になっているプログレスバーです。ブラウズモードで「プログレスバー、0%」のように読まれるか試してください。

<div class="my-6 p-4 border border-gray-300 rounded">
  <p id="zerodemo-pb-label" class="mb-2">読み込み中（0%）</p>
  <div role="progressbar" aria-labelledby="zerodemo-pb-label" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%; height:8px; background:#333; border-radius:4px;"></div>
</div>

```html
<div role="progressbar"
  aria-labelledby="zerodemo-pb-label"
  aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
  style="width:0%; height:8px; background:#333; border-radius:4px;">
</div>
```

## 検証時の読み上げ例

### NVDA 2026.1 日本語ベータ版 + Firefox

2026年2月に、Firefox でこのページを開き、NVDA 2026.1 日本語ベータ版（ブラウズモード）で下矢印キーを押しながら取得した読み上げの一例です。いずれも幅0・高さ0のコントロールがブラウズモードで読まれています。

- **デモ1（ラジオボタン）:** 「グループ メンテナンスドローンを選択」「ラジオボタン チェックなし クリック可能 オプション A」「ラジオボタン チェックなし クリック可能 オプション B」「ラジオボタン チェックなし クリック可能 オプション C」「グループの外」
- **デモ2（名前を入力するボタン）:** 「ボタン 名前を入力する」
- **デモ3（プログレスバー）:** 「読み込み中 0 パーセント」「プログレスバー 0」

環境: Windows 11、Mozilla Firefox (147.0.3)、NVDA 2026.1 日本語ベータ（260211s ポータブル）、ブラウズモードで下矢印のみ使用。

### NVDA 2025.3.2 日本語版 + Firefox

同じページを NVDA 2025.3.2jp（ポータブル）で検証した結果です。

- **デモ1（ラジオボタン）:** ブラウズモードで読まれた。読み上げは「グループ メンテナンスドローンを選択」「クリック可能 オプション A」「クリック可能 オプション B」「クリック可能 オプション C」「グループの外」。2026 では各ラジオボタンに「ラジオボタン チェックなし」も含まれるが、2025 では読まれていない。
- **デモ2（名前を入力するボタン）:** 「署名 (キャンバス) の代わりに コロン」の直後に「区切り」が読まれ、**「ボタン 名前を入力する」は読まれなかった**（飛ばされた）。
- **デモ3（プログレスバー）:** 「読み込み中 (0 パーセント)」は読まれたが、**「プログレスバー 0」の要素は読まれず**、次に「区切り」が読まれた（飛ばされた）。

## デモ1で「飛ばされない」理由の考察

NVDA が従来「非表示」とみなして除外する条件は、記事にあるとおり **「描画上の幅または高さが 0 で、かつ子要素がない」** コントロールです。デモ2・デモ3は 2025 で飛ばされた一方、デモ1のラジオボタンだけは 2025 でもブラウズモードで読めました。考えられる理由は次のとおりです。

- **Firefox（Gecko）のアクセシビリティツリーの差:** 同じ「幅0・高さ0」でも、ブラウザが IA2 でどうノードを出すかは要素によって異なります。ラジオボタン（`<input type="radio" aria-label="オプション A">`）は、Gecko 上で**アクセシブル名を子のテキストノードとして持つ**ように見える実装になっている可能性があります。その場合、「子要素がない」が偽になり、除外対象にならないと考えられます。
- **デモ2のボタン・デモ3のプログレスバー:** `<button aria-label="名前を入力する">` や `<div role="progressbar">` は、名前や値が属性としてだけ付いており、**子ノードとしてテキストを持たない**形でツリーに出ているとすると、「幅0・高さ0 かつ 子なし」を満たし、従来どおり飛ばされると説明できます。
- **Chrome との違い:** issue #13897 では「Firefox ではブラウズモードで読めるが Chrome では読めない」という報告があり、ブラウザごとにツリーの出し方が違うことが、デモ1のような「再現の差」の一因とも考えられます。

いずれにしても、**同じ「幅0・高さ0」のコントロールでも、ブラウザの a11y ツリーの構造次第で飛ばされる／飛ばされないが変わる**ため、2026.1 以降は「幅0・高さ0を非表示扱いしない」方針に統一することで、デモ2・デモ3のようなケースも含めて一貫して読めるようになります。

Firefox の開発者ツールのアクセシビリティパネルでデモ1のラジオボタン（オプション A）を確認すると、`radio:` ノードの直下に **`label:`** と **`text leaf:`** が子としてあり、いずれも「オプション A」を持っていることが分かります。この「子ノードがある」構造のため、従来の「子要素がない」条件を満たさず、2025 でも飛ばされなかったと説明できます。

---

## 関連する話題：aria-hidden と「フォーカス時の修復」

issue #13897 のスレッドでは、**aria-hidden の「修復」**にも言及されています。

- [issue 13897 のコメント（aria-hidden と Edge の挙動）](https://github.com/nvaccess/nvda/issues/13897#issuecomment-3445291777)

開発者が `aria-hidden="true"` を付けた場合でも、**ユーザーがフォーカスした要素**については、ブラウザがその属性を無視してアクセシビリティツリーに曝す実装が、Chromium 系（Edge など）にはあります。この「フォーカスされた要素に対する aria-hidden の無視」は、WAI-ARIA 1.2 仕様で明示的に規定されている動きです。

その結果、「視覚的には隠れている（あるいは幅0・高さ0の）要素」を、スクリーンリーダー側で安易に「非表示」として除外しないことが、仕様やブラウザの実装と整合的になってきています。今回の「幅0・高さ0を非表示扱いしない」変更は、その流れに沿ったものとも言えます。

## 開発者への示唆：「スクリーンリーダーだけに読ませる」実装のリスク

今回の NVDA の変更は、`width: 0; height: 0` で隠した要素を「読める」ようにするものですが、そもそも**スクリーンリーダーにだけ読ませることを前提にした実装は、検証漏れやバグの温床になりやすい**点にも触れておきます。

- **`width: 0; height: 0` は非推奨のハック**です。この記事のデモがまさにそうですが、スクリーンリーダーごと・ブラウザごとに挙動が異なり、今回のように「NVDA だけ読めない」といった問題が起きます。視覚的に隠す必要がある場合は、**画面外（off-screen）に配置する手法**（`position: absolute; left: -10000px` や、Bootstrap・Tailwind の `.sr-only` / `.visually-hidden` クラスが採用している `clip-path` + `1px × 1px` のパターン）のほうが、スクリーンリーダーの対応状況が安定しています。
- **「スクリーンリーダー専用コンテンツ」を作ること自体が、テストの負担を増やします。** 視覚的に見えないものは目視レビューで検出できず、スクリーンリーダーでの動作確認を全ブラウザ・全 AT で行わないと品質を担保できません。可能であれば、すべてのユーザーに同じ情報を同じ方法で提供する設計が、もっとも堅牢です。

## まとめ

- NVDA は 2026.1 以降、ブラウズモードで「幅0・高さ0のコントロール」を非表示として扱わず、他スクリーンリーダーと同様にアクセス可能にします。
- 視覚的に隠したスクリーンリーダー向けコントロールに依存するコンテンツが増えているいま、この変更は NVDA ユーザーの実害を減らし、相互運用性を高めるものです。
- ただし、スクリーンリーダー専用の隠し要素に頼る実装そのものがリスクを伴います。`width: 0; height: 0` ではなく確立された off-screen 手法を使うこと、そしてそもそも隠し要素に頼らない設計を検討することが、より根本的な解決策です。
- あわせて、aria-hidden とフォーカスに関する仕様・ブラウザの「修復」の文脈も知っておくと、なぜ「見えない要素」をスクリーンリーダーが隠さない方がよいかが理解しやすくなります。

詳細や経緯は上記の issue と PR を参照してください。

## 追記

この記事は Cursor や Claude Code などの AI を使って執筆しました。

途中で行った実験は、いま私が開発している「NVDAを MCP (Model Context Protocol) 経由で AI エージェントから操作する」ツールの検証を兼ねて行いました。

この仮称 nvda-remote-mcp は、こういう技術検証をもうしばらく行い、完成度が上がった段階で紹介したいと考えています。

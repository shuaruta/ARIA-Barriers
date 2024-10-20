---
title: 混合状態のチェックボックス
layout: default
---

[@nishimotz](https://github.com/nishimotz) です。

混合状態(部分的にチェック済み)のチェックボックスは、あるオプションが複数のサブオプションを統括しているような場合に便利な UI 要素です。

しかし、アクセシビリティを確保するためには、適切な実装が必要だとされています。

さて、どうしたらいいのでしょうか。

## APGの実装

ARIA Authoring Practices Guide (APG)
[Checkbox Example (Mixed-State)](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/) の実装を見てみましょう。

テキストだけ日本語に翻訳しました。

```html
<fieldset class="checkbox-mixed">
  <legend>
    サンドイッチの具材
  </legend>
  <div role="checkbox"
       class="group_checkbox"
       aria-checked="mixed"
       aria-controls="cond1 cond2 cond3 cond4"
       tabindex="0">
    すべての具材
  </div>
  <ul class="checkboxes">
    <li>
      <label>
        <input type="checkbox" id="cond1">
        レタス
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox"
               id="cond2"
               checked="">
        トマト
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" id="cond3">
        マスタード
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" id="cond4">
        ブロッコリー
      </label>
    </li>
  </ul>
</fieldset>
```

APGの実装で重要なARIA属性は以下の通りです。

- `role="checkbox"`: 要素がチェックボックスであることを示します。
- `tabindex="0"`: キーボードフォーカスを受け取れるようにします。
- `aria-checked="mixed"`: チェックボックスが部分的にチェックされた状態を示します。
- `aria-controls`: 制御する子チェックボックスのIDを指定します。

JavaScriptでは、チェックボックスの状態を管理し、aria-checked属性を適切に更新する必要があります。状態は以下の通りです。

- false: 「チェックなし」
- true: 「すべてチェック」
- mixed: 「部分的にチェック」

以下のキーボード操作に対応しています。

- `Tab` キー: チェックボックス間を移動
- `スペースキー`: チェックボックスの状態を切り替え

APGの実装では、OSのハイコントラストモードを考慮してCSSでカスタマイズを行っています。
ここでは深入りしません。

## ちょっとアレンジしてみる

混合状態のチェックボックスを、div 要素ではなく、input 要素で実装してみます。

```html
<fieldset class="checkbox-mixed">
  <legend>
    サンドイッチの具材
  </legend>
  <label>
    <input 
      type="checkbox"
      role="checkbox"
      class="group_checkbox"
      aria-checked="mixed"
      aria-controls="cond1 cond2 cond3 cond4"
      tabindex="0">
    すべての具材
  </label>
  <!-- 省略 -->
</fieldset>
```

なんとなく、このほうがよさそうだな、と思いましたか？

どうして APG はこうしなかったのでしょう？

もうすこしよく考えてみましょう。

## 強いネイティブセマンティクス

HTML標準のチェックボックス (input) 要素には、以下の値があります。

- `checked` プロパティ
- `indeterminate` プロパティ

もちろん div 要素にはこれらの属性はありません。

checked プロパティはチェックの有無を表します。値は true または false となり、JavaScript からは boolean 値を代入できます。HTML では checked 属性が存在する場合に true となります。このコードでは true の意味で `checked=""` と書かれています。

indeterminate プロパティは混合状態を表します。 aria-checked 属性の mixed に相当する場合に true となり、それ以外の場合に false となります。HTML としては indeterminate 属性は存在しません。

checked 属性や indeterminate 属性は「強いネイティブセマンティクス」を持つとされ、aria-checked 属性よりも優先されます。

[role 属性とは、aria-* 属性とは、WAI-ARIA とは、いったい何なのか、いつ使うべきなのか](https://qiita.com/ymrl/items/6c9c059208ea11e6d7bc)

だから div 要素にはただ

- aria-checked: mixed

とするだけで混合状態を表現できたのですが、input 要素の場合は

- aria-checked: mixed
- indeterminate: true

にしなくてはなりません。

JavaScript を直さないといけませんね。

あれ、 HTML でもともと混合状態がサポートされているのであれば、もしかして WAI-ARIA はいらないのでは？

## 標準的な要素を使用した実装

標準的なチェックボックス要素を使用しつつ、混合状態を表現する方法を考えてみましょう。

MDNの[input 要素の checkbox 型](https://developer.mozilla.org/ja/docs/Web/HTML/Element/input/checkbox)には「未決定状態のチェックボックス」として説明されています。

```html
<fieldset class="checkbox-mixed">
  <legend>サンドイッチの具材</legend>
  <label>
    <input type="checkbox"
           class="group_checkbox"
           id="all-ingredients"
           aria-controls="cond1 cond2 cond3 cond4">
    すべての具材
  </label>
  <ul>
    <li>
      <label>
        <input type="checkbox" id="cond1" name="ingredient">
        レタス
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" id="cond2" name="ingredient" checked="">
        トマト
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" id="cond3" name="ingredient">
        マスタード
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" id="cond4" name="ingredient">
        スプラウト
      </label>
    </li>
  </ul>
</fieldset>
```

```javascript
const allCheckbox = document.getElementById('all-ingredients');
const ingredientCheckboxes = document.querySelectorAll('input[name="ingredient"]');

function updateAllCheckbox() {
  const checkedCount = document.querySelectorAll('input[name="ingredient"]:checked').length;
  if (checkedCount === 0) {
    allCheckbox.checked = false;
    allCheckbox.indeterminate = false;
  } else if (checkedCount === ingredientCheckboxes.length) {
    allCheckbox.checked = true;
    allCheckbox.indeterminate = false;
  } else {
    allCheckbox.checked = false;
    allCheckbox.indeterminate = true;
  }
}

allCheckbox.addEventListener('change', () => {
  ingredientCheckboxes.forEach(cb => cb.checked = allCheckbox.checked);
  updateAllCheckbox();
});

ingredientCheckboxes.forEach(cb => {
  cb.addEventListener('change', updateAllCheckbox);
});

// 初期状態の設定
updateAllCheckbox();
```

## aria-controls 属性

ところで `aria-controls`属性がスクリーンリーダーによって適切にサポートされている場合、以下が期待されます。

- `aria-controls`で指定された要素に直接ジャンプする機能により、ユーザーは関連する子チェックボックスにすばやくアクセスできると期待されます。
- 「このチェックボックスは他の4つの要素を制御しています」のような追加情報を提供できると期待されます。

ただし、例えば[NVDAは aria-controls 属性をまだサポートしていません](https://github.com/nvaccess/nvda/issues/8983)。

aria-controls 属性はアクセシビリティ サポーテッドではないかも知れないですね。

## やっぱり less ARIA is better

APG の実装例は、なにげなく書かれているようで、実はちょっとアレンジしただけで前提が成り立たなくなることがあると気づきました。注意が必要です。

さらに言えば、APG の実装例は WAI-ARIA をあえて使っている例ばかりです。可能であれば「WAI-ARIA を使用しない」ほうがよいはずです。

HTML の要素そのものを正しく理解し、HTML を適切に使用し、不要な WAI-ARIA 属性は削除することをお勧めします。

---
title: aria-expandedの理想的な使い方 -- 名前と状態は適切に区別したほうが良い
layout: default
---

[@yncat](https://yncat.net) です。


近頃のAIとの対話は本当に楽しいです。今回の記事でも、具体例のコードや、考えの整理のために大いに役立ってくれています。技術者としては、新しいツールのネイティブになっていかないと、すぐにおいて行かれるなと思って、精進する毎日です。

## aria-expanded と aria-label 重複はよくないという意見

先日、 [こういう意見をGithubに送りました](https://github.com/orgs/community/discussions/152878) 。

内容を簡単に要約します。 [GitHubのマイページ](https://github.com/yncat) で、自分の行ったコミットやpull requestの実績が出るところで、 [aria-expanded](https://developer.mozilla.org/ja/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded) で状態が示されている項目に対して collapse や expand などの [aria-label](https://developer.mozilla.org/ja/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) がついているのが不要だという主張です。

これは、 WAI-ARIA を利用してアクセシビリティを実装しているウェブサイトでたびたび見られる、典型的な誤用であると私は考えています。

## どういうものか
以下のボタンをスクリーン・リーダーで操作してみてください。

### yokunai site

<button id="badButton" aria-expanded="false" aria-label="Expand Menu">
  Menu
</button>

<script>
const badButton = document.getElementById('badButton');

badButton.addEventListener('click', () => {
  const expanded = badButton.getAttribute('aria-expanded') === 'true';
  badButton.setAttribute('aria-expanded', (!expanded).toString());
  if (expanded) {
    badButton.setAttribute('aria-label', 'Expand Menu');
  } else {
    badButton.setAttribute('aria-label', 'Collapse Menu');
  }
});
</script>

## ソースコード
``` html
<button id="badButton" aria-expanded="false" aria-label="Expand Menu">
  Menu
</button>

<script>
// ボタン要素を取得
const badButton = document.getElementById('badButton');

// ボタンクリック時に状態を切り替える
badButton.addEventListener('click', () => {
  const expanded = badButton.getAttribute('aria-expanded') === 'true';
  
  // aria-expanded をトグル
  badButton.setAttribute('aria-expanded', (!expanded).toString());
  
  // aria-label も変えてしまう（ダメな例）
  if (expanded) {
    badButton.setAttribute('aria-label', 'Expand Menu');
  } else {
    badButton.setAttribute('aria-label', 'Collapse Menu');
  }
});
</script>
```

## 誤用だと考える理由

まずは理論的な話をします。

「menu」というのは、ボタンの名前です。これはメニューボタンだからです。

「menu」ボタンには、メニューが開いているか閉じているかという「状態」があります。これが、 collapsed (閉じている) または expanded (開いている) ということです。

「名前」と「状態」は、それぞれを表現するための適切な場所があります。

今回の例でいえば、「名前」がラベルであり、「状態」は副次的なもの、 aria-expanded で表現されるべきものです。

先ほどの悪い例では、これら2つがごちゃ混ぜになって、 aria-label に流出しています。しかも、「状態」は、 aria-label と aria-expanded で完全に重複して表現されています。

次に、スクリーン・リーダーのユーザーとしてこれを触った時の正直な話をします。

皆さんもスクリーン・リーダーで実際に押してみてほしいのですが。メニューが閉じているときには、こうやって読まれます。

Expand menu、折り畳み

逆に、メニューが開いているときは、こうやって読まれます。

Collapse menu、展開

……え？ Collapseなの？ Expandなの？どっちなの？

メニューの aria-label が日本語になったとしましょう。脳内シミュレーションするとこうなります。

メニューが閉じているとき: メニューを展開、折り畳み

メニューが開いているとき: メニューを折り畳む、展開

普通にややこしすぎませんか？「今の状態」と「押したらおこる捜査」が両方読み上げられるので、よく考えないとわからなくなるのです。これは普通に使いにくいと言わざるを得ません。

## じゃあどうすればよいのか？

WAI-ARIA の誤用に関しては、明確な答えがないものも多いです。ですが、個人的には、この問題にはある程度の最適解があると考えています。

- 文字ボタンであれば、ボタンの名前に aria-label を使わない
- 状態は aria-expanded だけで表現する

それがこちらです。

## 大丈夫なボタン

### daijoubu site

<button id="goodButton" aria-expanded="false">
  Menu
</button>

<script>
const goodButton = document.getElementById('goodButton');

goodButton.addEventListener('click', () => {
  const expanded = goodButton.getAttribute('aria-expanded') === 'true';
  goodButton.setAttribute('aria-expanded', (!expanded).toString());
});
</script>

## ソースコード

``` html
<button id="goodButton" aria-expanded="false">
  Menu
</button>

<script>
const goodButton = document.getElementById('goodButton');

goodButton.addEventListener('click', () => {
  const expanded = goodButton.getAttribute('aria-expanded') === 'true';
  goodButton.setAttribute('aria-expanded', (!expanded).toString());
  // ここでaria-labelを変えない！というか、そもそもついてない！
});
</script>
```

## よくなったと思いませんか？

上のボタンと下のボタンを両方読み上げさせて、操作して、比べてみてください。混乱がなくなったと思いませんか？

ついでに、 if 分岐を使ってラベルをどうこうする必要もなくなりました。エンジニアの皆さんは if を１つでも減らしたいと思っているでしょうから、これは朗報です。

## 「過剰な親切」は事故の元

WAI-ARIAは、正しく使えば本当に強力な武器になります。

ですが、むやみやたらに使いすぎてしまうと、逆にユーザーを混乱させたり、情報過多になったりします。

- ボタンの名前は、その対象をシンプルに説明する
- ボタンの状態は、属性（aria-expandedなど）で伝える

これを意識するだけで、ボタンの操作性はアップするはずです。

そして何より大事なのは、スクリーン・リーダーで実際に試してみることです。

## 番外編: マイクのミュートボタンはどうなのか？

私が思いつく限り、１つだけ例外があります。それは、マイクのミュートボタンです。

マイクのミュートがオンになっているということは、自分の声が相手に届く機能はオフになっているということです。この場合、マイクのミュートボタンに対する aria-pressed または aria-selected って、どっちの状態を示すのでしょうか？

これはおそらく、人によって解釈が分かれるのではないでしょうか。人によって解釈が分かれるということは、利用者の解釈だけではなく、開発者の解釈も分かれるということです。つまり、マイクのミュートが aria-pressed や aria-selected (またはそれに相当する機能) で作られているアプリは、両方の仕様が存在していて、やってみるまでどっちかわからないということです！

上記の理由から、マイクのミュートボタンに関してだけは、「マイクをオンにする」や、「マイクをオフにする」のように、 aria-label でボタン名としての表現をしてくれたほうが直感的になると思っています。

世の中、常に正しい理論というのはなかなか存在しないものですね。だからこそ、実際のユーザーテストが重要になってくると、私は信じています。

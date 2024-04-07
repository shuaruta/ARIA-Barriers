---
title: aria-hidden によって、サイト自体が閲覧できなくなることもある
layout: default
---

この記事は [cat](https://twitter.com/nyanchan2013) が執筆しました。

### お願い

このページは意図的に不適切に WAI-ARIA （Accessible Rich Internet Applications）技術を使って実装しています。
詳細は後述します。

閲覧に支障がある場合は GitHub で[この記事のMarkdown版](https://github.com/shuaruta/ARIA-Barriers/blob/main/_posts/2024-04-05-evil-aria-hidden.md)をご利用ください。

### この記事を書いた人

「猫」や「cat」、「yncat」等の名前で活動している全盲のコーダーです。

[個人サイト](https://nyanchangames.com/) や [ACT Laboratory](https://actlab.org/) でソフトウェア開発をしていたり、 [GitHub](https://github.com/yncat) で時折 OSS Contributor として活動しています。

### ２０２４年元旦のエピソード

２０２４年の元旦に、とある面白そうな AI サービスを見つけたので、早速登録しようとしました。このときの私は、登録を完了するまでの道のりがあんなに険しいものになるということなど、まったく想像していませんでした。

トップページから入って、 "Sign up" をクリックします。すると突然、 NVDA が何も読み上げしない、どこを押しても「ブランク」としか言わないページが表示されてしまいました！

本当になにも読まないので、まったく先に進むことができません。これは本当にウェブサイトなんでしょうか！！？！？

### 原因を調査していく

一般的には、この状況に陥ると、  Web の知識を持っている技術者でないかぎり、スクリーンリーダーの使用者がこれより先に進むことは不可能です。ですので、こういう現象が起きるサービスに「アクセスできる」とは決して言えません。

さて、なぜ、 Web という技術を使っているのにもかかわらず、ここまで「アクセスできない」ページができてしまったのでしょうか。ブラウザの「開発者ツール」を開いて調査していきます。

開発者ツールで、 DOM ツリーを確認します。すると、 body タグの下にあるあらゆるタグに対して、 aria-hidden という属性が使用されていることが分かります。たとえばこれです。分かりやすいようにちょっと整形しています。

```
<div
  data-theme="dark"
  class="css-fhtuey"
  data-floating-ui-inert
  aria-hidden="true"
>
  …
</div>
```

これだけでなく、 body の配下にあるほとんどの要素が `aria-hidden="true"` とマークアップされてしまっています。ずばり原因はこれです！！！

### aria-hidden の本来の目的

aria-hidden の [公式の定義](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden) は以下のようになっています。

> Indicates whether the element is exposed to an accessibility API.

これだけだと表現がメタすぎて分からないのですが、下のほうに読み進めると、こう書いてあります。

> User agents determine an element's hidden status based on whether it is rendered, and the rendering is usually controlled by CSS.

これを解釈すると、 css によってコントロールされる表示状態を、 accessibility API (今回は、ニアリーイコールでスクリーンリーダー)に伝達するために使用されるという想定があると考えることができます。

### aria-hidden があるときのスクリーンリーダーの挙動

一言で言えば、 aria-hidden を持つ要素、およびその中にある全ての子要素は、スクリーンリーダーから完全に無視されます！詰まり、絶対にアクセスできなくなります！

まさかそんなと思うかもしれませんが、たとえば body 要素に aria-hidden をつけたら、そのページ全体をまったくスクリーンリーダーでアクセスできないように作ることができてしまいます！

今回の例では、 body に直接ではありませんでしたが、その１つ下の要素にほぼ全部 aria-hidden が付いていましたので、まったくなにも読み上げられなくなってしまったということになります。

### 実験コーナー

この下に「登録！」というボタンがあります。ボタンを押すとテストメッセージが表示されます。マウスでは普通に押せると思いますが、スクリーンリーダーはどのように動作するでしょうか？試してみてください。

<div align="center" aria-hidden="true">
    <button style="height:50px; width:100px;" type="button" onclick="alert('登録ありがとうございますというテスト');">登録！</button>
</div>

え？ボタンがなかったって？画面にはちゃんとありますよ？まさか、貴方、スクリーンリーダーを使っているんですか？

↑と、こういうことになります。

ソースコードはこちらです。

``` html
<div align="center" aria-hidden="true">
    <button style="height:50px; width:100px;" type="button" onclick="alert('登録ありがとうございますというテスト');">登録！</button>
</div>
```

### aria-hidden の間違った使い方に関する警告がある

先ほど紹介した W3C のページには、このような悲しい事故を避けられるよう、警告が書かれています。

> NOTE

> Authors are advised to use extreme caution and consider a wide range of disabilities when hiding visibly rendered content from assistive technologies. For example, a sighted, dexterity-impaired individual may use voice-controlled assistive technologies to access a visual interface. If an author hides visible link text "Go to checkout" and exposes similar, yet non-identical link text "Check out now" to the accessibility API, the user may be unable to access the interface they perceive using voice control. Similar problems may also arise for screen reader users. For example, a sighted telephone support technician may attempt to have the blind screen reader user click the "Go to checkout" link, which they may be unable to find using a type-ahead item search ("Go to…").

とまぁ色々具体例を交えて書かれているわけですが、こんな生易しい事例を通り越して、ページ全体を aria-hidden にされてしまい、なにもできなくなってしまったわけです。まさに、 WAI-ARIA の機能によって、 ARIA-Barrier ができてしまった残念な事例と言えるでしょう。

### 余談

ちなみに、これは私の推測ですが、こんなふうに aria-hidden がついたのは、製作者の意図通りではないのだと思います。この「Sign Up」のダイアログ、モーダルダイアログとして表示されるのですが、おそらくはモーダルダイアログを出すために使っているライブラリの使い方が間違っているために発生した事象ではないかと推察しています。

モーダルダイアログが表示されるとき、見た目的には、モーダルダイアログ以外のコンテンツは非表示になります。ただ、それを非表示にするために css のクラスの付け替えのようなテクニックを使っていると、スクリーンリーダーだけがモーダルダイアログの外側の要素にアクセスできてしまうという事象が発生します。これを回避するとともに、画面を見ているユーザーとそうでないユーザーの体験を同じにするために、モーダルダイアログ以外の要素に aria-hidden を意図的に付与するライブラリが普及しています。

この手のライブラリは、「モーダルダイアログの要素」と「メインのアプリケーション要素」を分離するための何らかの仕組みを持っています。たとえば、 [React-modalのリファレンス](https://reactcommunity.org/react-modal/accessibility/#app-element) では、以下のような仕組みによってモーダルダイアログの内側と外側を識別していることが書かれています。

- AppElement という概念がある
- AppElement は、アプリケーションのメインの要素への参照を保持する(つまりモーダルダイアログの外側と識別される)
- AppElement は、通常、 React.render でルートコンポーネントを描画する対象の要素を指す
- モーダルダイアログの内側の要素は、自動的に body タグの直下に追加されるように作られているので、 appElement の子要素とならない
- モーダルダイアログが表示されるとき、 React-modal は AppElement に aria-hidden を付与し、ダイアログが閉じたときにそれを元に戻す
- モーダルダイアログの内側の要素は、 AppElement の子要素でないので、結果として、ダイアログの内側の要素だけをスクリーンリーダーに見せることができる

これは、スクリーンリーダーの挙動が分かっていないと理解するのが超絶難しいと思います。難しいのですが、実装者がこの意味を深く理解しないまま AppElement を適当に body とかに設定してしまう事例があります。その結果、

> please ensure that your app element is set correctly. The app element should not be a parent of the modal, to prevent modal content from being hidden to screenreaders while it is open.

という [公式からのお達し](https://reactcommunity.org/react-modal/) が破られてしまい、これだけでそのWebアプリケーションはアクセシブルではなくなってしまうわけです。

今回遭遇したサービスは、別の UI フレームワークを用いて作成されているようですので、ライブラリは React-modal ではないと思いますが、おそらくは似たような事例なんじゃないかなと思っています。

### じつは「お節介な aria を全て解除する拡張機能」まで作られてしまっている

だまされたと思って、このリポジトリを見てみてください。

[ogomez92/hammertools: AccessHAmmer for Chromium Browsers](https://github.com/ogomez92/hammertools)

こんな説明が書いてあります。

> aria-hidden allows authors to specify that something should be invisible for accessibility purposes. Unfortunately, this is sometimes misused by authors, potentially hiding huge parts of a page or even the entire page! This is particularly common after closing a dialog. Or it could be as small (yet critical) as a checkout button which has been accidentally hidden for accessibility, as I saw on Robins Kitchen.

> This tool removes aria-hidden from everything. If you suspect that something on a page has been hidden from your assistive technology, give this tool a try.

ほかにもいくつかの ARIA-Barrier を強引に除去する機能が搭載されていることがわかります。

悲しいことに、この拡張機能は、実際に ARIA-Barrier によって被害を受けてしまったスクリーンリーダーのユーザーによって書かれたものです。 WAI-ARIA は、本来その人を助けるはずでしたが、残念ながら逆効果となってしまい、こんな拡張機能まで生み出させてしまったということです。

### おわりに

せっかくあるのですから、 WAI-ARIA はできるかぎり、元々の意図通りに、計画的に利用したいし、利用してほしいものです。

今後も、 WAI-ARIA の失敗例を、できるだけ分かりやすく紹介していきたいと思います。どなたかの参考になれば幸いです。

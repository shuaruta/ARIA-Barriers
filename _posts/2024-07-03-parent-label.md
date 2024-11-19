---
title: ラベルにも副作用がある
layout: default
---

再び、[ACTLab](https://actlab.org/)代表の吹雪です。


### そこにあるのに押せないボタン

ある日、とあるウェブサイトを閲覧しているとき、目で見て検索ボタンらしきものを見つけました。
虫眼鏡のアイコンが描かれていました。

私の限られた視力で見ただけではしばしば見間違いや勘違いを起こすので、そこにマウスポインタをもっていきます。
ひとまずマウスポインタが手の形に変化したので、そこはクリックできるようです。
その後いつものように読み上げを確認したのですが、何も読みません。
大変残念ではありますが、たまにあることです。

仕方がないので少し手前のエディットボックスにフォーカスを当て、そこからスクリーンリーダーのキーボード操作で外套のボタンを探します。
目で見るとそこにボタンがあり、マウスポインタが手の形に変化したので、下の２つの動作のいずれかの動作を期待していました。

- 検索ボタンであると正しく読み上げる
- 何のボタンかはわからずとも、ただ「ボタン」と読み上げる
	- button要素内にaltタグのない画像を設置したり、CSSで中にアイコンを描画したり、ariaを不適切に使ったりした場合に発生します

しかし、実際にはどちらでもなく、何の読み上げもされませんでした。
そこには何もないかのように、さらに下の要素へとカーソルが移っていきました。

最終手段として開発者ツールを開くと、ようやく底にある者がiタグであることがわかりました。


ということで、今回はアイコンフォントを中心に、imgタグ以外で描画される非テキストコンテンツと、その説明に用いられるaria-labelについて扱います。


### 正しいマークアップと文字でのラベル付けは、視覚障害者への配慮の基本

視覚障害者へのウェブアクセシビリティの話をするとき、img要素で作られた画像にaltタグを正しく付けることと、HTMLのルールをきちんと守ることの２点が真っ先に言われるのではないでしょうか。
これらには絶大な効果がありますし、基本的に副作用はありません。
同時にマシンリーダブルにもなって検索性も高まります。
世のウェブ開発者の皆様に、これだけでもぜひお願いしたいところです。


### 画像以外にもラベリングが必要

ひと昔前までであれば、ここまででもかなりの部分でアクセシビリティの確保ができていました。
しかし、ウェブでの表現が豊かになる中で、img要素以外の方法で描画される非テキストコンテンツが増えてきました。
一例をあげると、下記のようなものです。

- アイコンフォント
	- ハンバーガーアイコンでメニューを開く、虫眼鏡マークで検索機能を呼び出すなど
- CSSでのアイコン表示
	- ハンバーガーメニュー程度であれば、div要素などに対してCSSで描画することもできます

これらの表現方法には、alt属性のような標準のラベリング手段が用意されていないという共通点があります。


### そもそも、アイコンのみで何かを表すことは非推奨

この記事をお読みの方であれば、非テキストコンテンツのみでウェブページを構成することの有害性については十分認識していただいているかと思います。
念のために挙げておくと、下記のような点がよく指摘されているかと思います。

- マシンリーダブルでなく、SEOやAIでの学習などで不利になる
- スクリーンリーダーで読み取れない
- 学習障害等で、画像のみでは意味の理解が困難な閲覧者がいる
- 古いブラウザやテキストブラウザなどで画像が正しく表示されなかった場合に、内容が伝わらない

著名なウェブアクセシビリティガイドラインであるWeb Content Accessibility Guidelines (WCAG) 2.1においても、利用者に提示されるすべての非テキストコンテンツには、同等の目的を果たすテキストによる代替を提供することを求めています。


### 文字として描画される非テキストコンテンツ




下記は、i要素とアイコンフォントを用いて作った検索アイコンの例です。
スクリーンリーダーでは、存在を知ることすらできません。


### 最終手段としてのaria-label

非推奨とは言っても、デザインを優先して画像のみの表示をしたいという需要がなくならないのもまた事実です。
そのため、最終手段としてaria-labelを用いたアクセシビリティの確保が試みられることとなります。

下記は、i要素を用いて作った検索アイコンにaria-labelを適用した例です。



アクセシビリティに配慮していただけることは非常にありがたいのですが、一方で様々な副作用を引き起こしていることもあります。


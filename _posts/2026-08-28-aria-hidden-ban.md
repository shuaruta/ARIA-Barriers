---
title: 正しく使えないなら禁止するしかない — aria-hidden と「見えない仕様」の苛立ち
layout: default
author:
  name: 24motz
  url: https://x.com/24motz
---

2026年8月、X で `aria-hidden` を「禁止してしまえばいいのでは」という議論が盛り上がりました。2年前に[「aria-hidden によって、サイト自体が閲覧できなくなることもある」](https://aria-barriers.shuaruta.com/2024/04/05/evil-aria-hidden.html)という記事を書いた身としては、また同じ話が巡ってきたか、という思いです。

このサイト [ARIA-Barriers](https://aria-barriers.shuaruta.com/) は、そんな現場の失敗を、実際に操作できる形で発信するために作りました。間違った実装は世に溢れていますが、どこのサイトが壊れているかと指摘すると、実在のサイトに迷惑がかかりますし、いまどきのウェブ技術はコードがトランスパイルされていて、どう直せばいいか私にも正しく指摘することが難しくなっています。だから、わざと壊れた実装をこのサイトの中に作り、読者自身に「こうなるのか」と気づいてもらう。それが、このサイトのやり方です。

あえて Jekyll を使っているのも、フロントエンドのコードを意図通りに書きたいからです。最近は Astro や htmx が好みになっていますが、このサイトではまだまだ Jekyll で頑張っています。

でも、今回は少し違う角度から考えたいと思います。なぜ `aria-hidden` は、これほどまでに誤用され続けるのか。そして「禁止するしかない」という苛立ちの正体は何なのか。

## 「禁止したい」という声

発端は、[ゆうてん🖖](https://x.com/cloud10designs) さん（[@cloud10designs](https://x.com/cloud10designs)）のポストでした。ゆうてんさんは HTML リンター [markuplint](https://markuplint.dev/ja/) の開発者でもあります。

> だれか教えて。aria-hidden じゃないと絶対にダメなケースが思い浮かばない。どんなにがんばって考えても代替案が考えつける。aria-hidden 禁止にして大丈夫かな？

この問いには、実は深い洞察が含まれています。`aria-hidden` の「正しい使い方」を説明する記事は山ほどあります。しかし「これだけは `aria-hidden` でないと実現できない」という、揺るぎないユースケースを即答できる人は、意外と少ないのです。

装飾的なアイコンの重複読み上げを防ぐ、モーダルダイアログの背景を支援技術から隠す——どれも、よく考えると代替手段があります。アイコンは `role="presentation"` や `alt=""` で済む場合が多い。モーダルの背景は、近年では `inert` 属性でより安全に扱えます。

「禁止して大丈夫かな」という問いは、単なる極論ではなく、「正しく使うのが難しいなら、いっそ使わない方がマシではないか」という、現場の実感から出てきた言葉なのです。

## なぜ正しく使えないのか

私は、この問題の根っこには一つの構造的な理由があると考えています。

**`aria-hidden` は、支援技術にしか影響を与えない。**

これがすべてです。`aria-hidden="true"` を付けても、画面の見た目は何も変わりません。晴眼の開発者がブラウザで確認しても、何も起きていないように見えます。マウスでクリックしても、キーボードで Tab を押しても、要素は普通に操作できます。

つまり、**誤用しても、作った本人には絶対に気づけない**のです。バグは「見えない」ところにだけ発生します。スクリーンリーダーを使う人だけが、そのバグに遭遇します。

一般的なバグは、作った本人が自分の目で確認して気づけます。レイアウトが崩れていれば見えます。ボタンが動かなければクリックして気づけます。しかし `aria-hidden` の誤用は、晴眼の開発者にとっては「存在しないバグ」です。フィードバックループが、そもそも成立していないのです。

### デモ: 閉じたはずのダイアログ

この構造を、実際に体験してみてください。下のボタンでダイアログを開き、閉じてみてください。

<div class="my-6 p-5 border border-gray-300 rounded-lg shadow-sm bg-stone-50">
  <p id="demo1-main" class="mb-3">ここはメインコンテンツです。この文章はスクリーンリーダーで読めるはずです。</p>
  <button type="button" id="demo1-open" class="px-4 py-2.5 min-h-[44px] bg-blue-700 text-white rounded shadow-sm">ダイアログを開く</button>
  <div id="demo1-dialog" role="dialog" aria-labelledby="demo1-title" hidden class="mt-4 p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
    <p id="demo1-title" class="font-bold mb-2">設定ダイアログ</p>
    <p class="mb-3">ここはダイアログの中身です。</p>
    <button type="button" id="demo1-close" class="px-4 py-2.5 min-h-[44px] bg-gray-700 text-white rounded shadow-sm">閉じる</button>
  </div>
</div>

<p class="text-sm text-gray-600 my-4"><strong>体験後は</strong> <button type="button" id="demo1-reset" class="px-3 py-2 min-h-[44px] bg-white border border-gray-400 text-gray-800 rounded text-sm shadow-sm">状態をリセット</button> を押すか、ページをリロードしてください。</p>

<script>
(function () {
  var main = document.getElementById('demo1-main');
  var openBtn = document.getElementById('demo1-open');
  var dialog = document.getElementById('demo1-dialog');
  var closeBtn = document.getElementById('demo1-close');
  var resetBtn = document.getElementById('demo1-reset');

  openBtn.addEventListener('click', function () {
    dialog.hidden = false;
    // 背景を隠す（ここまでは正しい）
    main.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-hidden', 'true');
  });

  closeBtn.addEventListener('click', function () {
    dialog.hidden = true;
    // ここで aria-hidden を外し忘れている！
    // main.removeAttribute('aria-hidden');
    // openBtn.removeAttribute('aria-hidden');
  });

  resetBtn.addEventListener('click', function () {
    dialog.hidden = true;
    main.removeAttribute('aria-hidden');
    openBtn.removeAttribute('aria-hidden');
  });
})();
</script>

```html
<button id="open">ダイアログを開く</button>
<p id="main">ここはメインコンテンツです。</p>
<div id="dialog" role="dialog" hidden>…</div>
<script>
open.addEventListener('click', () => {
  dialog.hidden = false;
  main.setAttribute('aria-hidden', 'true'); // 背景を隠す
});
close.addEventListener('click', () => {
  dialog.hidden = true;
  // aria-hidden を外し忘れている！
});
</script>
```

ダイアログを閉じた後、スクリーンリーダーでこのページを読んでみてください。メインコンテンツが読めなくなっているはずです。**画面には普通に表示されているのに**。

作った本人は、ダイアログを開いて閉じて、見た目が元に戻ったことを確認して「完成」とします。しかし支援技術の世界では、メインコンテンツは `aria-hidden` に閉じ込められたままです。このバグに気づけるのは、スクリーンリーダーを使う人だけです。

### デモ: 見えているのに読まれないボタン

もう一つ、よくあるパターンです。`aria-hidden` の中に、フォーカス可能な要素を置いてしまうケース。

<div class="my-6 p-5 border border-gray-300 rounded-lg shadow-sm bg-stone-50">
  <p class="mb-3">下のボタンは、画面には表示されています。Tab キーでもフォーカスが当たります。しかしスクリーンリーダーでは読まれません。</p>
  <p class="text-sm text-gray-500 mb-3">（この枠内の div には <code>aria-hidden="true"</code> が設定されています）</p>
  <div aria-hidden="true">
    <button type="button" class="ghost-focus-btn px-4 py-2.5 min-h-[44px] bg-white border-2 border-stone-400 text-stone-800 rounded shadow-sm font-medium hover:bg-stone-50">見えているのに読まれないボタン</button>
  </div>
</div>

```html
<div aria-hidden="true">
  <button>見えているのに読まれないボタン</button>
</div>
```

WAI-ARIA の仕様は、`aria-hidden="true"` を付けた要素の中にフォーカス可能な要素を置くことを明確に禁じています。しかし、これもまた「見た目には何も起きない」ので、作った本人は気づけません。Tab キーでフォーカスが当たるのに、スクリーンリーダーは「ブランク」としか言わない——晴眼の開発者には、この「幽霊フォーカス」を体験する手段がありません。

## 見えないものを見えるようにする試み

この「支援技術にしか見えない世界」を、晴眼の開発者にも見えるようにしようという試みがあります。

[ymrl](https://github.com/ymrl) さんが作った [Accessibility Visualizer](https://github.com/ymrl/a11y-visualizer) は、まさにそのためのブラウザ拡張機能です。スクリーンリーダーなどの支援技術のユーザーが知覚している情報——アクセシブルネーム、ロール、`aria-hidden` の状態、ライブリージョンなど——を、Chrome や Firefox の画面上に注釈として重ねて表示してくれます。

これは素晴らしいツールです。`aria-hidden` がどこに付いているか、その中にフォーカス可能な要素が紛れ込んでいないか、といった「見えない問題」を、目で確認できるようになります。意図的に問題を含むテストページまで同梱されていて、学習にも使えます。

別のアプローチとして、機械的に検出する試みもあります。先ほど紹介したゆうてんさんが開発する [markuplint](https://markuplint.dev/ja/) は、HTML や WAI-ARIA の仕様に基づいてマークアップを検査するリンターです。たとえば、プロジェクトで「`aria-hidden` は原則使わない」というルールを決めれば、違反を自動的に検出できます。Astro や htmx などのテンプレートエンジンにも対応しているので、いまどきの開発現場にも入りやすいでしょう。

しかし、ここに一つの壁があります。

**このツールをインストールする人は、すでにアクセシビリティに関心がある人だけです。**

`aria-hidden` を誤用してしまう開発者は、そもそも「支援技術にしか見えない世界」の存在を知りません。知らないから、見ようとも思わない。見ようと思わないから、可視化ツールにもたどり着かない。可視化ツールは、すでに「見たい」と思っている人にしか届かないのです。

これは、ymrl さんのツールの限界ではなく、この問題の構造そのものです。どんなに優れた可視化ツールを作っても、「関心のない人」には届かない。だから `aria-hidden` の誤用は、なくならない。

## 「禁止する」という選択肢の意味

ここまで考えると、「禁止してしまえばいい」という声の意味が、少し違って見えてきます。

それは「`aria-hidden` という機能が悪い」という主張ではありません。むしろ、「**正しく使えるかどうかを、作った本人が検証できない機能は、現場では正しく運用されない**」という、現実的な諦めに近いのです。

`aria-hidden` に限らず、支援技術にしか影響を与えない仕様は、すべて同じ構造を抱えています。`aria-live` も、`aria-expanded` も、`role` も。見た目に影響しないから、テストされない。テストされないから、壊れても気づかれない。壊れても気づかれないから、放置される。

「禁止する」は、この構造に対する一つの回答です。使わなければ、誤用も起きない。理屈は通っています。

しかし、私は「禁止」で終わらせたくないとも思います。`aria-hidden` を禁止したところで、次の「見えない仕様」が同じ問題を起こすだけだからです。問題は `aria-hidden` という特定の属性にあるのではなく、「支援技術にしか影響を与えない仕様」という構造そのものにあるのですから。

## では、どうするのか

ここで、私自身のことを少し書かせてください。

実は、この問題に対して「もっと過激な答え」を考えたことがあります。`aria` を無視することで、かえってユーザーを支援するスクリーンリーダーを作る、という選択肢です。`aria-hidden` が誤用されているなら、いっそ `aria` を信じない。DOM の構造と見た目から、実際に読むべきものを判断する。状況は、そういうものを作れるところまで来ていると思います。

ただ、それは大人気ない。`aria` を無視するスクリーンリーダーが普及したら、今度は「正しく `aria` を書いている」サイトまで巻き添えになります。問題の解決ではなく、問題の放棄です。

そこで私が作っているのが、「スクリーンリーダーと同じ制約で動く AI エージェント」です。それが [nuime.net](https://nuime.net) です。

Nuime は、NVDA と連携して動作するツール群です。「AI に優しい GUI は、スクリーンリーダーにも優しい GUI」という考え方を出発点にしています。スクリーンリーダーが実際に読み上げる内容を手がかりに、AI が操作を代行したり、検証を自動化したりします。`aria` を無視するのではなく、`aria` が実際にどう読まれるのかを、AI がスクリーンリーダーと同じ制約の中で確かめる。そういう道具です。

私の答えは、シンプルです。

**「見えない」なら、実際に支援技術で試すしかない。**

機械的なチェックツールは、`aria-hidden` の中にフォーカス可能な要素があるか、といった静的な問題は検出できます。しかし「ダイアログを閉じた後に `aria-hidden` が残っているか」のような、**状態遷移に依存する問題**は、実際に操作してみないと分かりません。そして「スクリーンリーダーでどう読まれるか」は、ブラウザと支援技術の組み合わせによって変わります。

この「実際に支援技術で試して、結果を記録する」という作業を、体系的に、誰でも参加できる形でやっているのが、ウェブアクセシビリティ基盤委員会（WAIC）の「アクセシビリティ サポーテッド（AS）情報」です。

WCAG の達成方法が、実際に今のブラウザや支援技術で有効かどうかを検証し、その結果を公開しています。`aria-hidden` のような「見えない仕様」が、実際にどう振る舞うのか——それを確かめるための、まさにその作業です。

そして、この検証作業を体験できるイベントがあります。

## アクセシビリティ サポーテッド（AS）テスト体験会

- **日時:** 2026年9月17日（木）15:00〜17:00
- **場所:** オンライン（Zoom）
- **参加費:** 無料（先着30名）
- **申し込み:** [connpass イベントページ](https://waic.connpass.com/event/402906/)
- **主催:** ウェブアクセシビリティ基盤委員会（WAIC）WG2

この体験会では、ASテストに基づいた検証作業の方法と、検証結果の提出方法を学び、実際に検証作業を体験できます。普段お使いのブラウザや支援技術を使って、どなたでも参加できます。字幕（UDトーク等）や Zoom の文字起こしも提供されます。

「見えない仕様」を、自分の手で確かめる。`aria-hidden` の誤用に苛立ちを感じている人にこそ、ぜひ参加してほしいイベントです。

## おわりに

`aria-hidden` を「禁止するしかない」と思う気持ちは、私も同じです。でも、その苛立ちの正体は、属性そのものではなく、「**支援技術にしか影響を与えない仕様は、作った本人にフィードバックが返らない**」という構造にあります。

だから、答えは禁止ではなく「確かめる」ことです。AS テスト体験会で、その一歩を踏み出してみてください。

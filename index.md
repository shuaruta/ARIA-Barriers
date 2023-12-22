---
layout: default
title: Home
---

ウェブアクセシビリティの失敗事例を発信します。

<img src="{{ site.baseurl }}/assets/images/a11ydarkpatterns.png" alt="アクセシビリティのダークパターンのイメージ" style="display: block; margin-left: auto; margin-right: auto;">

<ul style="list-style-type: none;" class="ml-0">
  {% for post in site.posts %}
    <li>
      <a href="{{ site.baseurl }}{{ post.url }}">{{ post.date | date: "%Y年%m月%d日"}} : {{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

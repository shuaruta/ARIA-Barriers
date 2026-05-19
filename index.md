---
layout: default
title: Home
---

<div class="home-intro">
  <p class="home-intro__lead">ウェブアクセシビリティの失敗事例を発信します。</p>
  <img
    src="{{ site.baseurl }}/assets/images/a11ydarkpatterns.png"
    alt="アクセシビリティのダークパターンのイメージ"
    class="home-intro__image"
  >
</div>

<section class="post-list-section" aria-labelledby="post-list-heading">
  <h2 id="post-list-heading" class="post-list__heading">記事一覧</h2>
  <ul class="post-list">
    {% for post in site.posts %}
      <li class="post-list__item">
        <a class="post-list__link" href="{{ site.baseurl }}{{ post.url }}">
          <span class="post-list__title">{{ post.title }}</span>
          <time class="post-list__date" datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%Y年%m月%d日" }}</time>
        </a>
      </li>
    {% endfor %}
  </ul>
</section>

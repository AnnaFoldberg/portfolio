---
layout: collection
title: "Projects"
collection: projects
entries_layout: grid
---

<h2>Mini Projects</h2>
<ul>
{% assign minis = site.projects 
    | where_exp: "p", "p.tags contains 'mini'" 
    | where: "lang", site.active_lang %}
{% for p in minis %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
{% endfor %}
</ul>

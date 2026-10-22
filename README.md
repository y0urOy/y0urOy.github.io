# y0urOy.github.io

Source of https://y0urOy.github.io/, the homepage of Yonghao Yu. Plain static files: no framework, no build step, no external JavaScript. GitHub Pages serves the repository root as is (`.nojekyll`).

```
index.html            the whole site (one page)
404.html              not-found page (root-absolute paths, follows the stored language)
cv.pdf                CV linked from the header, hero and footer
assets/css/site.css   all styles (tokens at the top)
assets/js/site.js     theme and language toggles, news "More", BibTeX panels and copy buttons
assets/img/           publication thumbnails (400x250 WebP, 16:10) and og.png (social card)
favicon.svg  robots.txt  sitemap.xml  .nojekyll
```

## Editing

Every translatable text appears twice, side by side, as siblings marked `data-lang-en` and `data-lang-zh`. Edit both lines together:

```html
<li class="news-item">
  <time datetime="2026-10">2026.10</time>
  <p data-lang-en>EditHero ... is on <a href="https://arxiv.org/abs/2610.02298">arXiv</a>.</p>
  <p data-lang-zh>EditHero ... 已发布在 <a href="https://arxiv.org/abs/2610.02298">arXiv</a>。</p>
</li>
```

- **News.** Newest first. The first six items are visible; give older items the class `news-item news-item--more` so they sit behind the "More" button.
- **Publications.** "Selected Publications" (`#publications`) lists the four selected works newest first, each with a 400x250 WebP thumbnail in `assets/img/`. "Publications" (`#more-publications`) is the full list, including the selected works again, as compact rows (`<li class="pub pub--compact">`, no thumbnail) under year labels, newest first. A repeated entry needs its own BibTeX id (the timeline copies use `bib-SLUG-all`). Paper titles, author names, venue badges and BibTeX stay in English and carry `lang="en"` and `translate="no"` (so browser machine translation leaves them alone). The owner's name is `<span class="me">`; author marks are `<sup>*</sup>` (equal contribution) and `<sup>†</sup>` (corresponding author). Each BibTeX entry is a `<details class="pub__bib" id="bib-SLUG">` plus a `<button class="bib-btn" aria-controls="bib-SLUG">` in the links row.
- **Venue badge tones.** `venue venue--pub` for accepted or published papers, plain `venue` for preprints, `venue venue--proj` for project releases.
- **Labels that live in attributes** (button names, tooltips, page title, meta description) keep both languages in `data-*` attributes next to the element (`data-label-en` / `data-label-zh`, `data-title-en` / `data-title-zh`, `<title data-zh>`).
- Avoid em dashes; use an en dash only in date ranges (`2024.10 – present`).

## Behaviour

- **Language.** English by default for every visitor (no browser detection). The 中 / EN button switches the whole page; the choice is stored in `localStorage` (`lang`). `?lang=zh` or `?lang=en` overrides it. An inline script in `<head>` applies the language before the first paint and sets `<html lang>` to `en` or `zh-Hans`. Noto Sans SC is requested only when Chinese is shown. Without JavaScript the page is English only.
- **Theme.** Follows `prefers-color-scheme` until the visitor uses the toggle (stored as `theme`). Without JavaScript the system setting still applies.

## CV

`cv.pdf` is built from `tools/cv/cv.tex` (public version, no phone number). The CJK font for the name line is downloaded separately and is not committed:

```sh
cd tools/cv
mkdir -p fonts
curl -L -o fonts/NotoSerifJP-Regular.otf https://github.com/notofonts/noto-cjk/raw/main/Serif/SubsetOTF/JP/NotoSerifJP-Regular.otf
xelatex cv.tex && cp cv.pdf ../../cv.pdf
```

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Deploying

Push the files above to the root of the `y0urOy/y0urOy.github.io` repository. Do not publish the working folders `_qa/` and `_work/` if they are present.

Design family: [shokuno5.github.io](https://shokuno5.github.io/) (IBM Plex Mono, 640px column), re-implemented from its documented values. Hugging Face glyph from Simple Icons (CC0-1.0).

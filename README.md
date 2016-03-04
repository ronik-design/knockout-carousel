# knockout-carousel
An efficient, configurable carousel for knockout.js.

# Usage (minimal)
```html
<div class="carousel" data-bind="carousel">
  <div class="carousel__buttons">
    <div class="carousel__button" data-carousel-prev>Prev</div>
    <div class="carousel__button" data-carousel-next>Next</div>
  </div>
  <ul class="carousel-items" data-carousel-wrap>
    <li class="carousel-item" data-carousel-item>Foo</li>
    <li class="carousel-item" data-carousel-item>Bar</li>
    <li class="carousel-item" data-carousel-item>Baz</li>
  </ul>
</div>
```

# Usage (maximal)
```html
<div data-bind="with: foo">
  <div class="carousel" data-bind="carousel: { index: bar, wrapSelector: '.carousel-items', prevSelector: '.carousel__button--prev', nextSelector: '.carousel__button-next', itemSelector: '.carousel-item' }">
    <div class="carousel__buttons">
      <div class="carousel__button--prev">Prev</div>
      <div class="carousel__button--next">Next</div>
    </div>
    <ul class="carousel-items">
      <li class="carousel-item">Foo</li>
      <li class="carousel-item">Bar</li>
      <li class="carousel-item">Baz</li>
    </ul>
  </div>
</div>
```

# Installation

This is how I use it with a Webpack bundled project. Your setup may be different.

```sh
$ npm install knockout-carousel --save-dev
```

```js
import ko from "knockout"; // defined as a plugin
import $ from "jquery"; // defined as an external
import carousel from "knockout-carousel";

ko.bindingHandlers.carousel = carousel(ko, $);
```

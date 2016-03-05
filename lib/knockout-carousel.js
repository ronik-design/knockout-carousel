/* eslint max-statements:0 */

import "jquery.event.move";
import "jquery.event.swipe";

const INCREMENT = 1;

const DEFAULTS = {
  swipeClass: "is-swiping",
  activeClass: "is-active",
  disabledClass: "is-disabled",
  currentAttribute: "data-carousel-current",
  wrapSelector: "[data-carousel-wrap]",
  itemSelector: "[data-carousel-item]",
  prevSelector: "[data-carousel-prev]",
  nextSelector: "[data-carousel-next]",
  pageSelector: "[data-carousel-page]",
  firstIndex: 1
};

const AUTOADVANCE_SECONDS_DEFAULT = 5;

const THOUSAND = 1000;
const HUNDRED = 100;

const touchTest = function () {
  return "ontouchstart" in window || navigator.maxTouchPoints;
};

const autoadvance = function (seconds, nextFn) {

  let timer;

  seconds = seconds === true ? AUTOADVANCE_SECONDS_DEFAULT : seconds;

  return () => {

    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    timer = setTimeout(() => nextFn({ loop: true }), seconds * THOUSAND);
  };
};

const toggleSetClass = function ($set, index, className) {

  $set.each((idx, el) => {
    el.classList.remove(className);
  });

  if ($set[index]) {
    $set[index].classList.add(className);
  }
};

const binding = function (ko, $, opt = {}) {

  ko = ko || window.ko;
  $ = $ || window.$ || window.jQuery;

  const isTouchDevice = opt.touchTest || touchTest;

  const init = function (element, valueAccessor) {

    const value = valueAccessor();
    const obj = value || {};
    const index = ko.isObservable(obj.index) || ko.observable();

    const {
      swipeClass,
      activeClass,
      disabledClass,
      currentAttribute,
      wrapSelector,
      itemSelector,
      prevSelector,
      nextSelector,
      pageSelector,
      firstIndex
    } = Object.assign(DEFAULTS, obj);

    const $element = $(element);
    const $wrap = $(wrapSelector);
    const $prev = $(prevSelector);
    const $next = $(nextSelector);
    const $items = $wrap.find(itemSelector);
    const $pages = $(pageSelector);

    const width = $wrap[0].offsetWidth;
    const total = $items.length;

    const goToPage = (num, options = {}) => {

      if ($next.length) {
        if (num >= total && !options.loop) {
          $next[0].classList.add(disabledClass);
          if ($next[0].tagName === "BUTTON") {
            $next[0].disabled = true;
          }
        } else {
          $next[0].classList.remove(disabledClass);
          if ($next[0].tagName === "BUTTON") {
            $next[0].disabled = false;
          }
        }
      }

      if ($prev.length) {
        if (num <= firstIndex && !options.loop) {
          $prev[0].classList.add(disabledClass);
          if ($prev[0].tagName === "BUTTON") {
            $prev[0].disabled = true;
          }
        } else {
          $prev[0].classList.remove(disabledClass);
          if ($prev[0].tagName === "BUTTON") {
            $prev[0].disabled = false;
          }
        }
      }

      index(num);
    };

    const onPrev = (options = {}) => {
      const currIndex = index();
      if (options.loop && currIndex <= firstIndex) {
        goToPage(total, options);
      } else {
        goToPage(currIndex - INCREMENT, options);
      }
    };

    const onNext = (options = {}) => {
      const currIndex = index();
      if (options.loop && currIndex >= total) {
        goToPage(firstIndex, options);
      } else {
        goToPage(currIndex + INCREMENT, options);
      }
    };

    let resetAutoadvance = obj.autoadvance ? autoadvance(obj.autoadvance, onNext) : null;

    if ($prev.length) {
      $prev.on("click", (event) => {
        event.preventDefault();
        onPrev({ loop: true });
      });
    }

    if ($next.length) {
      $next.on("click", (event) => {
        event.preventDefault();
        onNext({ loop: true });
      });
    }

    if ($pages.length) {
      $pages.each((i, page) => {
        $(page).on("click", (event) => {
          event.preventDefault();
          toggleSetClass($pages, i, activeClass);
          goToPage(i + 1);
        });
      });
    }

    if (isTouchDevice()) {

      resetAutoadvance = null;

      $element
        .on("swiperight", () => {
          onPrev();
        })
        .on("swipeleft", () => {
          onNext();
        })
        .on("movestart", (event) => {

          if (event.distX > event.distY && event.distX < -event.distY ||
              event.distX < event.distY && event.distX > -event.distY) {
            event.preventDefault();
            return;
          }

          $wrap[0].classList.add(swipeClass);
        })
        .on("move", (e) => {

          const base = (index() - 1) * -HUNDRED;
          const left = HUNDRED * e.distX / width;

          if (e.distX < 0) {
            $items[0].style.marginLeft = `${base + left}%`;
          }

          if (e.distX > 0) {
            $items[0].style.marginLeft = `${base + left}%`;
          }
        })
        .on("moveend", () => {

          $wrap[0].classList.remove(swipeClass);
          $items[0].style.marginLeft = "";
        });
    }

    index.subscribe((i) => {

      if (resetAutoadvance) {
        resetAutoadvance();
      }

      $element[0].setAttribute(currentAttribute, i);
      toggleSetClass($items, i - 1, activeClass);
    });

    $element[0].setAttribute(currentAttribute, firstIndex);

    if (resetAutoadvance) {
      resetAutoadvance();
    }

    index(firstIndex);
  };

  return {
    init,
    allowVirtual: true
  };
};

export default binding;


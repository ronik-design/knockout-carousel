/* eslint max-statements:0 */

const INCREMENT = 1;

const DEFAULTS = {
  currentAttribute: "data-carousel-current",
  wrapSelector: "[data-carousel-wrap]",
  itemSelector: "[data-carousel-item]",
  prevSelector: "[data-carousel-prev]",
  nextSelector: "[data-carousel-next]",
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

const binding = function (ko, $, opt) {

  ko = ko || window.ko;
  $ = $ || window.$ || window.jQuery;

  require("jquery.event.move")($);
  require("jquery.event.swipe")($);

  const isTouchDevice = opt.touchTest || touchTest;

  const init = function (element, valueAccessor) {

    const obj = valueAccessor();
    const index = ko.isObservable(obj.index) || ko.observable(0);

    const {
      currentAttribute,
      wrapSelector,
      itemSelector,
      prevSelector,
      nextSelector,
      firstIndex
    } = Object.assign(DEFAULTS, obj);

    const $element = $(element);
    const $wrap = $(wrapSelector);
    const $prev = $(prevSelector);
    const $next = $(nextSelector);
    const $items = $wrap.find(itemSelector);

    const width = $wrap[0].offsetWidth;
    const total = $items.length;

    const onPrev = (options = {}) => {

      $next[0].classList.remove("is-disabled");

      if (options.loop && index() <= firstIndex) {
        index(total);
      } else if (index() <= firstIndex) {
        $prev[0].classList.add("is-disabled");
      } else {
        index(index() - INCREMENT);
      }
    };

    const onNext = (options = {}) => {

      $prev[0].classList.remove("is-disabled");

      if (options.loop && index() >= total) {
        index(firstIndex);
      } else if (index() >= total) {
        $next[0].classList.add("is-disabled");
      } else {
        index(index() + INCREMENT);
      }
    };

    let resetAutoadvance = obj.autoadvance ? autoadvance(obj.autoadvance, onNext) : null;

    $prev.on("click", (event) => {
      event.preventDefault();
      onPrev({ loop: true });
    });

    $next.on("click", (event) => {
      event.preventDefault();
      onNext({ loop: true });
    });

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

          $wrap[0].classList.add("notransition");
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

          $wrap[0].classList.remove("notransition");
          $items[0].style.marginLeft = "";
        });
    }

    index.subscribe((i) => {
      if (resetAutoadvance) {
        resetAutoadvance();
      }
      $element[0].setAttribute(currentAttribute, i);
    });

    $element[0].setAttribute(currentAttribute, firstIndex);

    if (resetAutoadvance) {
      resetAutoadvance();
    }
  };

  return {
    init,
    allowVirtual: true
  };
};

export default binding;


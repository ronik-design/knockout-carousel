'use strict';

/* eslint max-statements:0 */

var INCREMENT = 1;

var DEFAULTS = {
  currentAttribute: "data-carousel-current",
  wrapSelector: "[data-carousel-wrap]",
  itemSelector: "[data-carousel-item]",
  prevSelector: "[data-carousel-prev]",
  nextSelector: "[data-carousel-next]",
  firstIndex: 1
};

var AUTOADVANCE_SECONDS_DEFAULT = 5;

var THOUSAND = 1000;
var HUNDRED = 100;

var touchTest = function touchTest() {
  return "ontouchstart" in window || navigator.maxTouchPoints;
};

var autoadvance = function autoadvance(seconds, nextFn) {

  var timer = undefined;

  seconds = seconds === true ? AUTOADVANCE_SECONDS_DEFAULT : seconds;

  return function () {

    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    timer = setTimeout(function () {
      return nextFn({ loop: true });
    }, seconds * THOUSAND);
  };
};

var binding = function binding(ko, $, opt) {

  ko = ko || window.ko;
  $ = $ || window.$ || window.jQuery;

  require("jquery.event.move")($);
  require("jquery.event.swipe")($);

  var isTouchDevice = opt.touchTest || touchTest;

  var init = function init(element, valueAccessor) {

    var obj = valueAccessor();
    var index = ko.isObservable(obj.index) || ko.observable(0);

    var _Object$assign = Object.assign(DEFAULTS, obj);

    var currentAttribute = _Object$assign.currentAttribute;
    var wrapSelector = _Object$assign.wrapSelector;
    var itemSelector = _Object$assign.itemSelector;
    var prevSelector = _Object$assign.prevSelector;
    var nextSelector = _Object$assign.nextSelector;
    var firstIndex = _Object$assign.firstIndex;


    var $element = $(element);
    var $wrap = $(wrapSelector);
    var $prev = $(prevSelector);
    var $next = $(nextSelector);
    var $items = $wrap.find(itemSelector);

    var width = $wrap[0].offsetWidth;
    var total = $items.length;

    var onPrev = function onPrev() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


      $next[0].classList.remove("is-disabled");

      if (options.loop && index() <= firstIndex) {
        index(total);
      } else if (index() <= firstIndex) {
        $prev[0].classList.add("is-disabled");
      } else {
        index(index() - INCREMENT);
      }
    };

    var onNext = function onNext() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


      $prev[0].classList.remove("is-disabled");

      if (options.loop && index() >= total) {
        index(firstIndex);
      } else if (index() >= total) {
        $next[0].classList.add("is-disabled");
      } else {
        index(index() + INCREMENT);
      }
    };

    var resetAutoadvance = obj.autoadvance ? autoadvance(obj.autoadvance, onNext) : null;

    $prev.on("click", function (event) {
      event.preventDefault();
      onPrev({ loop: true });
    });

    $next.on("click", function (event) {
      event.preventDefault();
      onNext({ loop: true });
    });

    if (isTouchDevice()) {

      resetAutoadvance = null;

      $element.on("swiperight", function () {
        onPrev();
      }).on("swipeleft", function () {
        onNext();
      }).on("movestart", function (event) {

        if (event.distX > event.distY && event.distX < -event.distY || event.distX < event.distY && event.distX > -event.distY) {
          event.preventDefault();
          return;
        }

        $wrap[0].classList.add("notransition");
      }).on("move", function (e) {

        var base = (index() - 1) * -HUNDRED;
        var left = HUNDRED * e.distX / width;

        if (e.distX < 0) {
          $items[0].style.marginLeft = base + left + "%";
        }

        if (e.distX > 0) {
          $items[0].style.marginLeft = base + left + "%";
        }
      }).on("moveend", function () {

        $wrap[0].classList.remove("notransition");
        $items[0].style.marginLeft = "";
      });
    }

    index.subscribe(function (i) {
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
    init: init,
    allowVirtual: true
  };
};

module.exports = binding;
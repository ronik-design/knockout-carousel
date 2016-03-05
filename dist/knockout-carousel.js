'use strict';

var jquery_event_move = require('jquery.event.move');
var jquery_event_swipe = require('jquery.event.swipe');

var INCREMENT = 1;

var DEFAULTS = {
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

var toggleSetClass = function toggleSetClass($set, index, className) {

  $set.each(function (idx, el) {
    el.classList.remove(className);
  });

  if ($set[index]) {
    $set[index].classList.add(className);
  }
};

var binding = function binding(ko, $) {
  var opt = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


  ko = ko || window.ko;
  $ = $ || window.$ || window.jQuery;

  var isTouchDevice = opt.touchTest || touchTest;

  var init = function init(element, valueAccessor) {

    var value = valueAccessor();
    var obj = value || {};
    var index = ko.isObservable(obj.index) || ko.observable();

    var _Object$assign = Object.assign(DEFAULTS, obj);

    var swipeClass = _Object$assign.swipeClass;
    var activeClass = _Object$assign.activeClass;
    var disabledClass = _Object$assign.disabledClass;
    var currentAttribute = _Object$assign.currentAttribute;
    var wrapSelector = _Object$assign.wrapSelector;
    var itemSelector = _Object$assign.itemSelector;
    var prevSelector = _Object$assign.prevSelector;
    var nextSelector = _Object$assign.nextSelector;
    var pageSelector = _Object$assign.pageSelector;
    var firstIndex = _Object$assign.firstIndex;


    var $element = $(element);
    var $wrap = $(wrapSelector);
    var $prev = $(prevSelector);
    var $next = $(nextSelector);
    var $items = $wrap.find(itemSelector);
    var $pages = $(pageSelector);

    var width = $wrap[0].offsetWidth;
    var total = $items.length;

    var goToPage = function goToPage(num) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


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

    var onPrev = function onPrev() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var currIndex = index();
      if (options.loop && currIndex <= firstIndex) {
        goToPage(total, options);
      } else {
        goToPage(currIndex - INCREMENT, options);
      }
    };

    var onNext = function onNext() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var currIndex = index();
      if (options.loop && currIndex >= total) {
        goToPage(firstIndex, options);
      } else {
        goToPage(currIndex + INCREMENT, options);
      }
    };

    var resetAutoadvance = obj.autoadvance ? autoadvance(obj.autoadvance, onNext) : null;

    if ($prev.length) {
      $prev.on("click", function (event) {
        event.preventDefault();
        onPrev({ loop: true });
      });
    }

    if ($next.length) {
      $next.on("click", function (event) {
        event.preventDefault();
        onNext({ loop: true });
      });
    }

    if ($pages.length) {
      $pages.each(function (i, page) {
        $(page).on("click", function (event) {
          event.preventDefault();
          toggleSetClass($pages, i, activeClass);
          goToPage(i + 1);
        });
      });
    }

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

        $wrap[0].classList.add(swipeClass);
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

        $wrap[0].classList.remove(swipeClass);
        $items[0].style.marginLeft = "";
      });
    }

    index.subscribe(function (i) {

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
    init: init,
    allowVirtual: true
  };
};

module.exports = binding;
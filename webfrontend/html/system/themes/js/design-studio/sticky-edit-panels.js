// LoxBerry CSS Studio - Version: 4.0.1.1


(function (global) {
  'use strict';

  var EDGE_GAP = 12;
  var MIN_VIEWPORT_WIDTH = 761;
  var MIN_VIEWPORT_HEIGHT = 480;
  var CENTERING_SCROLL_DISTANCE = 220;
  var STATUS_COLLISION_GAP = 16;
  var MAX_SHIFT_STEP = 22;

  var workbench = null;
  var tabPanel = null;
  var page = null;
  var palette = null;
  var preview = null;
  var statusBar = null;
  var frameId = 0;
  var settleTimer = 0;
  var resizeObserver = null;
  var mutationObserver = null;

  function scrollingElement() {
    return document.scrollingElement || document.documentElement || document.body;
  }

  function scrollTop() {
    var root = scrollingElement();
    return Math.max(
      0,
      global.pageYOffset || global.scrollY || (root && root.scrollTop) || 0
    );
  }

  function viewportHeight() {
    return Math.max(
      document.documentElement.clientHeight || 0,
      global.innerHeight || 0
    );
  }

  function isVisible(element) {
    if (!element || element.hidden) return false;
    var style = global.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function currentShift(element) {
    var value = parseFloat(element.dataset.cfwScrollFollowY || '0');
    return Number.isFinite(value) ? value : 0;
  }

  function setShift(element, value) {
    var rounded = Math.round(value * 10) / 10;
    element.dataset.cfwScrollFollowY = String(rounded);
    element.style.setProperty('--cfw-scroll-follow-y', rounded + 'px');
    element.classList.add('cfw-scroll-follow-target');
  }

  function clearShift(element) {
    if (!element) return;
    element.classList.remove('cfw-scroll-follow-target');
    element.style.removeProperty('--cfw-scroll-follow-y');
    delete element.dataset.cfwScrollFollowY;
  }

  function isTwoColumnWorkbench() {
    if (!workbench || !palette || !preview) return false;

    var workbenchRect = workbench.getBoundingClientRect();
    var paletteRect = palette.getBoundingClientRect();
    var previewRect = preview.getBoundingClientRect();

    return previewRect.left > (workbenchRect.left + 40) &&
      paletteRect.right < (previewRect.left - 4);
  }

  function clampStep(current, target) {
    var delta = target - current;
    if (Math.abs(delta) <= MAX_SHIFT_STEP) return target;
    return current + (delta > 0 ? MAX_SHIFT_STEP : -MAX_SHIFT_STEP);
  }

  function paletteTargetShift(y, viewHeight, workbenchTop, workbenchBottom) {
    var oldShift = currentShift(palette);
    var rect = palette.getBoundingClientRect();
    var elementHeight = palette.offsetHeight || rect.height;

    var naturalTop = rect.top + y - oldShift;
    var availableHeight = Math.max(0, viewHeight - (EDGE_GAP * 2));
    var visibleHeight = Math.min(elementHeight, availableHeight);
    var viewportTop = Math.max(EDGE_GAP, Math.round((viewHeight - visibleHeight) / 2));

    var requiredShift = Math.max(0, (y + viewportTop) - naturalTop);
    var progress = Math.min(1, Math.max(0, y / CENTERING_SCROLL_DISTANCE));
    var target = requiredShift * progress;

    var maxShift = Math.max(0, workbenchBottom - naturalTop - elementHeight);
    target = Math.min(target, maxShift);

    if (statusBar && isVisible(statusBar)) {
      var statusRect = statusBar.getBoundingClientRect();
      var overlapsHorizontally = rect.right > statusRect.left + 1 &&
        rect.left < statusRect.right - 1;
      if (overlapsHorizontally) {
        var allowedBottom = statusRect.top - STATUS_COLLISION_GAP;
        var collisionMaxShift = allowedBottom - (naturalTop - y + elementHeight);
        var minShift = (workbenchTop + EDGE_GAP) - naturalTop;
        target = Math.max(minShift, Math.min(target, collisionMaxShift));
      }
    }

    return target;
  }

  function update() {
    frameId = 0;

    if (!page || !workbench || !tabPanel || !palette || !preview) return;

    clearShift(preview);
    clearShift(statusBar);

    var viewHeight = viewportHeight();
    var enabled = global.innerWidth >= MIN_VIEWPORT_WIDTH &&
      viewHeight >= MIN_VIEWPORT_HEIGHT &&
      isVisible(workbench) &&
      !page.classList.contains('cfw-liquid-glass-wallpaper-only') &&
      isTwoColumnWorkbench();

    if (!enabled) {
      clearShift(palette);
      return;
    }

    var y = scrollTop();
    var workbenchRect = workbench.getBoundingClientRect();
    var workbenchTop = workbenchRect.top + y;
    var workbenchBottom = workbenchTop + workbench.offsetHeight;
    var current = currentShift(palette);
    var target = paletteTargetShift(y, viewHeight, workbenchTop, workbenchBottom);
    var next = clampStep(current, target);

    setShift(palette, next);

    if (Math.abs(target - next) > 0.2) scheduleUpdate();
  }

  function scheduleUpdate() {
    if (frameId) return;
    frameId = global.requestAnimationFrame(update);
  }

  function scheduleSettledUpdate() {
    scheduleUpdate();
    if (settleTimer) global.clearTimeout(settleTimer);
    settleTimer = global.setTimeout(function () {
      settleTimer = 0;
      scheduleUpdate();
    }, 90);
  }

  function init() {
    page = document.querySelector('.cfw-page.cfw-design-studio');
    tabPanel = document.getElementById('cfwTabWorkbench');
    workbench = document.querySelector('#cfwTabWorkbench .cfw-workbench');
    statusBar = document.getElementById('studioStatusBar');
    palette = document.querySelector('#cfwTabWorkbench .cfw-left-secondary-stack .cfw-palette-panel');
    preview = document.querySelector('#cfwTabWorkbench .cfw-right');

    if (!page || !tabPanel || !workbench || !statusBar || !palette || !preview) return;

    clearShift(preview);
    clearShift(statusBar);

    global.addEventListener('scroll', scheduleSettledUpdate, { passive: true });
    global.addEventListener('wheel', scheduleSettledUpdate, { passive: true });
    global.addEventListener('resize', scheduleUpdate, { passive: true });
    if ('onscrollend' in global) global.addEventListener('scrollend', scheduleUpdate, { passive: true });
    document.addEventListener('scroll', scheduleSettledUpdate, true);
    document.addEventListener('toggle', scheduleUpdate, true);
    document.addEventListener('click', scheduleUpdate, true);
    document.addEventListener('change', scheduleUpdate, true);

    if ('ResizeObserver' in global) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(tabPanel);
      resizeObserver.observe(workbench);
      resizeObserver.observe(document.querySelector('.cfw-left-primary-stack'));
      resizeObserver.observe(palette);
      resizeObserver.observe(preview);
      resizeObserver.observe(statusBar);
    }

    if ('MutationObserver' in global) {
      mutationObserver = new MutationObserver(scheduleUpdate);
      mutationObserver.observe(tabPanel, {
        attributes: true,
        attributeFilter: ['hidden', 'class']
      });
      mutationObserver.observe(page, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    scheduleUpdate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  global.CFWStickyEditPanels = {
    refresh: scheduleUpdate
  };
})(window);

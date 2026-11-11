// LoxBerry CSS Studio Preview - Version: 4.0.1.20
(function () { 'use strict';

  // The browser top layer prevents table overflow and stacking contexts from clipping tooltips.
  document.querySelectorAll('.lb-tooltip-anchor').forEach(function (anchor, index) {
    var tip = anchor.querySelector('.lb-tooltip');
    if (!tip || typeof tip.showPopover !== 'function') return;
    tip.setAttribute('popover', 'manual');
    tip.id = tip.id || 'studio-preview-tooltip-' + index;
    var trigger = anchor.querySelector('button, summary, a, input, [tabindex]') || anchor;
    var describedBy = (trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (describedBy.indexOf(tip.id) < 0) describedBy.push(tip.id);
    trigger.setAttribute('aria-describedby', describedBy.join(' '));
    function position() {
      if (!tip.matches(':popover-open')) return;
      var rect = anchor.getBoundingClientRect(), width = tip.offsetWidth, height = tip.offsetHeight;
      var left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left + rect.width / 2 - width / 2));
      var above = rect.top - height - 10;
      var top = above >= 8 ? above : rect.bottom + 10;
      top = Math.max(8, Math.min(window.innerHeight - height - 8, top));
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
      tip.classList.toggle('cfw-tooltip-below', above < 8);
    }
    function show() { if (!tip.matches(':popover-open')) tip.showPopover(); position(); }
    function hide() {
      if (!anchor.matches(':hover') && !anchor.contains(document.activeElement) && tip.matches(':popover-open')) tip.hidePopover();
    }
    anchor.addEventListener('mouseenter', show);
    anchor.addEventListener('mouseleave', hide);
    anchor.addEventListener('focusin', show);
    anchor.addEventListener('focusout', function () { setTimeout(hide, 0); });
    anchor.addEventListener('keydown', function (event) { if (event.key === 'Escape' && tip.matches(':popover-open')) tip.hidePopover(); });
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
  });

  var dictionary = window.STUDIO_PREVIEW_LANGUAGE || {};
  document.querySelectorAll('[data-i18n]').forEach(function (node) {
    var value = dictionary[node.getAttribute('data-i18n')];
    if (typeof value === 'string') node.textContent = value;
  });
  window.addEventListener('message',function (event) {
    if (event.origin !== window.location.origin || event.source !== window.parent || !event.data || event.data.type !== 'CFW_STUDIO_TOKENS') return;
    var data=event.data, tokens=data.tokens || {};
    var style=document.getElementById('cfwStudioWorkingThemeStyle');
    if (!style) { style=document.createElement('style');style.id='cfwStudioWorkingThemeStyle';document.head.appendChild(style); }
    var declarations=Object.keys(tokens).filter(function (key) { return /^--lb-[a-z0-9-]+$/.test(key) && typeof tokens[key] === 'string' && !/[{};]/.test(tokens[key]); }).map(function (key) { return key+':'+tokens[key]; });
    style.textContent=':root,html,body{'+declarations.join(';')+'}';
    window.dispatchEvent(new Event('cfw:tokens-updated'));
    var wallpaper=data.wallpaper || {}, image=String(wallpaper.image || '');
    if (/^assets\/[A-Za-z0-9_./-]+$/.test(image) && !image.split('/').includes('..')) image='/admin/system/themes/theme-file.cgi/'+image;
    if (!/^(?:https?:\/\/|data:image\/(?:png|jpe?g|webp|gif);base64,|\/admin\/system\/themes\/theme-file\.cgi\/)/i.test(image)) image='';
    document.body.style.setProperty('--cfw-studio-wallpaper-image',wallpaper.enabled && image ? 'url("'+image.replace(/["\\\r\n]/g,'')+'")' : 'none');
    document.body.style.setProperty('--cfw-studio-wallpaper-opacity',String(Math.min(100,Math.max(0,Number(wallpaper.opacity == null ? 100 : wallpaper.opacity)))/100));
    document.body.style.setProperty('--cfw-studio-wallpaper-brightness',String(Math.min(150,Math.max(0,Number(wallpaper.brightness == null ? 100 : wallpaper.brightness)))/100));
  });
}());

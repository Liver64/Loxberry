// LoxBerry CSS Studio - Version: 4.0.1.1
(function (window) {
  'use strict';

  function normalizeDisplayName(name) {
    name = String(name || '').trim();
    name = name.replace(/^loxberry[\s_-]*/i, '').trim();
    return name || 'User Theme';
  }

  function slugify(name) {
    var slug = normalizeDisplayName(name)
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return 'user-' + (slug || 'theme').slice(0, 59).replace(/-+$/, '');
  }

  window.CFWDesignStudioThemeIdentity = Object.freeze({
    normalizeDisplayName: normalizeDisplayName,
    slugify: slugify
  });
}(window));

// LoxBerry CSS Studio - Version: 4.0.1.1
(function (window) { 'use strict';
  function theme(id) { return (window.CFW_USER_THEMES || []).find(function (item) { return item.id === id; }); }
  function isProtected(id) { var item=theme(id); return !!(item && (item.type === 'core' || (item.studio && item.studio.deletable === false))); }
  window.CFWDesignStudioProtectedThemes = Object.freeze({
    isLiquidGlass: function () { return false; }, isReadOnly: function () { return false; }, isProtected: isProtected,
    displayName: function (id) { var item=theme(id); return item ? item.name : id; },
    message: function (id, translate) { return translate('registry.protected', { theme: id }); }
  });
}(window));

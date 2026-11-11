// LoxBerry CSS Studio - Version: 4.0.1.22 (read-only core theme options)
(function () {
  'use strict';

  var colorUtils = window.CFWDesignStudioColorUtils;
  var themeIdentity = window.CFWDesignStudioThemeIdentity;
  var protectedThemes = window.CFWDesignStudioProtectedThemes;
  var wallpaperRange = window.CFWDesignStudioWallpaperRange;
  if (!colorUtils || !themeIdentity || !protectedThemes || !wallpaperRange) {
    throw new Error('Design Studio service modules are missing or loaded in the wrong order.');
  }

  var coreTokens = Object.assign({}, window.CFW_CORE_TOKENS || {});

  var studioContractTokenDefaults = {
    '--lb-active-bg': 'var(--lb-btn-primary-bg, var(--lb-primary))',
    '--lb-active-text': 'var(--lb-btn-primary-text)',
    '--lb-active-border': 'var(--lb-btn-primary-border, var(--lb-primary-hover))',
    '--lb-hover-bg': 'var(--lb-primary-hover)',
    '--lb-switch-on-text': '#f8fafc',
    '--lb-toggle-active-text': '#f8fafc',
    '--lb-switch-off-text': '#111827',
    '--lb-toggle-text': '#111827'
  };
  Object.keys(studioContractTokenDefaults).forEach(function (name) {
    if (coreTokens[name] === undefined) coreTokens[name] = studioContractTokenDefaults[name];
  });
  var coreData = window.CFW_CORE_DATA || {};

  // New drafts start from the active semantic theme, including its missing-role aliases.
  var neutralNewThemeTokens = Object.assign({}, coreTokens || {});
  var userThemes = Array.isArray(window.CFW_USER_THEMES) ? window.CFW_USER_THEMES.filter(function (theme) { return theme.type === 'user'; }) : [];
  var themeState = window.CFWThemeStateManager || null;

  var previewRoot = document.getElementById('previewRoot');
  var liquidGlassWallpaperPreview = document.getElementById('liquidGlassWallpaperPreview');
  var liquidGlassStudioWallpaper = document.getElementById('liquidGlassStudioWallpaper');
  var statusBox = document.getElementById('status');
  var topMessage = document.getElementById('studioTopMessage');
  var topMessageTimer = null;
  var statusModal = document.getElementById('statusModal');
  var statusModalCard = statusModal ? statusModal.querySelector('.cfw-status-modal-card') : null;
  var statusModalTitle = document.getElementById('statusModalTitle');
  var statusModalMessage = document.getElementById('statusModalMessage');
  var statusModalHint = document.getElementById('statusModalHint');
  var statusModalIcon = document.getElementById('statusModalIcon');
  var statusModalBack = document.getElementById('statusModalBack');
  var statusModalActions = document.getElementById('statusModalActions');
  var statusModalTimer = null;
  var unsavedModal = document.getElementById('unsavedChangesModal');
  var unsavedModalCancel = document.getElementById('unsavedChangesCancel');
  var unsavedModalDiscard = document.getElementById('unsavedChangesDiscard');
  var pendingThemeSelection = null;
  var areaSelect = document.getElementById('areaSelect');
  var elementSelect = document.getElementById('elementSelect');
  var colorGroupSelect = document.getElementById('colorGroupSelect');
  var selectedElementTitle = document.getElementById('selectedElementTitle');
  var selectedComponentCard = document.querySelector('.cfw-selected-component-card');
  var selectedElementMeta = document.getElementById('selectedElementMeta');
  var propertyInspector = document.getElementById('propertyInspector');
  var selectedTokenList = document.getElementById('selectedTokenList');
  var affectedTokenSelect = document.getElementById('affectedTokenSelect');
  var affectedTokenDescription = document.getElementById('affectedTokenDescription');
  var paletteGrid = document.getElementById('paletteGrid');
  var monoPreview = document.getElementById('monoPreview');
  var colorPicker = document.getElementById('colorPicker');
  var colorPresetPalette = document.getElementById('colorPresetPalette');
  var alphaRange = document.getElementById('alphaRange');
  var brightnessRange = document.getElementById('brightnessRange');
  var radiusRange = document.getElementById('radiusRange');
  var borderWidthRange = document.getElementById('borderWidthRange');
  var borderWidthValue = document.getElementById('borderWidthValue');
  var borderWidthSetting = document.querySelector('.cfw-border-width-setting');
  var shadowRange = document.getElementById('shadowRange');
  var alphaValue = document.getElementById('alphaValue');
  var brightnessValue = document.getElementById('brightnessValue');
  var radiusValue = document.getElementById('radiusValue');
  var shadowValue = document.getElementById('shadowValue');
  var wallpaperControls = document.getElementById('wallpaperControls');
  var wallpaperAdvancedControls = document.getElementById('wallpaperAdvancedControls');
  var wallpaperEnabled = document.getElementById('wallpaperEnabled');
  var wallpaperImage = document.getElementById('wallpaperImage');
  var wallpaperFile = document.getElementById('wallpaperFile');
  var wallpaperFileButton = document.getElementById('wallpaperFileButton');
  var wallpaperFileName = document.getElementById('wallpaperFileName');
  var wallpaperBrightness = document.getElementById('wallpaperBrightness');
  var wallpaperOpacity = document.getElementById('wallpaperOpacity');
  var wallpaperBrightnessValue = document.getElementById('wallpaperBrightnessValue');
  var wallpaperOpacityValue = document.getElementById('wallpaperOpacityValue');
  var customCss = document.getElementById('customCss');
  var cssImport = document.getElementById('cssImport');
  var cssImportButton = document.getElementById('cssImportButton');
  var cssImportFileName = document.getElementById('cssImportFileName');
  var importSummary = document.getElementById('importSummary');
  var saveModal = document.getElementById('saveModal');
  var themeDirtyIndicator = document.getElementById('themeDirtyIndicator');
  var savedThemeSignature = '';
  var savedThemeSnapshot = null;
  var themeDirty = false;
  var pendingThemeSelectionValue = null;
  var userThemeSelect = document.getElementById('userThemeSelect');
  var deleteThemeButton = document.getElementById('deleteTheme');
  var undoThemeButton = document.getElementById('undoTheme');
  var redoThemeButton = document.getElementById('redoTheme');
  var deleteModal = document.getElementById('deleteModal');
  var cancelDeleteButton = document.getElementById('cancelDelete');
  var confirmDeleteButton = document.getElementById('confirmDelete');
  var pendingDeleteTheme = null;
  var themeId = document.getElementById('themeId');
  var themeName = document.getElementById('themeName');
  var themeVersion = document.getElementById('themeVersion');
  var mappedTokenCount = document.getElementById('mappedTokenCount');
  var previewCaption = document.getElementById('previewCaption');
  var newThemeColorPanel = document.getElementById('newThemeColorPanel');
  var newThemeColorToggle = document.getElementById('newThemeColorToggle');
  var newThemeColorControls = document.getElementById('newThemeColorControls');
  var newThemeColorPalette = document.getElementById('newThemeColorPalette');
  var newThemeColorPicker = document.getElementById('newThemeColorPicker');
  var newThemeColorMode = document.getElementById('newThemeColorMode');
  var newThemeBrightnessValue = document.getElementById('newThemeBrightnessValue');
  var newThemeResolvedModeValue = document.getElementById('newThemeResolvedModeValue');
  var newThemeOnPrimaryValue = document.getElementById('newThemeOnPrimaryValue');
  var newThemeContrastValue = document.getElementById('newThemeContrastValue');
  var applyNewThemeColorButton = document.getElementById('applyNewThemeColor');
  var cancelNewThemeColorButton = document.getElementById('cancelNewThemeColor');
  var workingTokens = {};
  var colorPresetValues = [

    '#ffffff', '#f5ead7', '#111827', '#ef4444', '#f97316', '#facc15', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#a16207', '#78350f', '#6b7280',
    '#000000', '#f8fafc', '#fde68a', '#dc2626', '#16a34a', '#0891b2', '#7c3aed'
  ];

  var colorDirectionPresets = (window.CFWDesignStudioColorDirections || []).slice();
  var importedCss = '';
  var lastImportMeta = null;

  var hasActiveEditorSelection = false;
  var expandedPropertyTokenKeys = {};
  var inspectorSelectionKey = "";
  var activeDirectToken = '';
  var directTokenOverrides = {};

  var forceNeutralNewTheme = false;
  var selectedComponentTarget = null;
  var componentInspector = document.getElementById('componentInspector');
  var componentInspectorTitle = document.getElementById('componentInspectorTitle');
  var componentInspectorMeta = document.getElementById('componentInspectorMeta');
  var previewHoverCard = null;
  var previewHoverTarget = null;
  var appliedPreviewVars = [];
  var wallpaperState = { enabled: false, image: '', brightness: 100, opacity: 100 };

  var liquidGlassPreviewStyle = null;
  var liquidGlassPreviewLoad = null;
  var liquidGlassPreviewTokens = {};

  var i18nLanguage = (window.CFW_LANGUAGE || window.LBLANG || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  var i18nDictionary = (window.LBDesignStudioLangs && (window.LBDesignStudioLangs[i18nLanguage] || window.LBDesignStudioLangs.de || window.LBDesignStudioLangs.en)) || {};

  function i18nGet(path) {
    var key = String(path || '')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
    return typeof i18nDictionary[key] === 'string' ? i18nDictionary[key] : '';
  }

  function t(path, fallback, values) {
    var text = i18nGet(path) || fallback || path || '';
    if (values) {
      Object.keys(values).forEach(function (key) {
        text = text.replace(new RegExp('\\{' + key + '\\}', 'g'), values[key]);
      });
    }
    return text;
  }

  function tx(path, values) {
    return t(path, path, values);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var studioDisplayLabelKeys = {
  "areas": {
    "Input": "LABELS_AREAS_0",
    "Selects": "LABELS_AREAS_1",
    "Checkboxen": "LABELS_AREAS_2",
    "Radio": "LABELS_AREAS_3",
    "Dropdowns": "LABELS_AREAS_4",
    "Slider": "LABELS_AREAS_5",
    "Toggle": "LABELS_AREAS_6",
    "Buttons": "LABELS_AREAS_7",
    "Cards/Notes": "LABELS_AREAS_8",
    "tabellen": "LABELS_AREAS_9",
    "Layout": "LABELS_AREAS_10",
    "hover": "LABELS_AREAS_11",
    "Validation": "LABELS_AREAS_12",
    "Modal": "LABELS_AREAS_13",
    "Background": "LABELS_AREAS_14"
  },
  "elements": {
    "Active Button": "LABELS_ELEMENTS_0",
    "Button Gruppe": "LABELS_ELEMENTS_1",
    "Card Hover": "LABELS_ELEMENTS_2",
    "Checkbox Gruppe": "LABELS_ELEMENTS_3",
    "Compact Slider": "LABELS_ELEMENTS_4",
    "Compact Tabelle": "LABELS_ELEMENTS_5",
    "Dropdown Button": "LABELS_ELEMENTS_6",
    "Dropdown MenÃ¼": "LABELS_ELEMENTS_7",
    "Error": "LABELS_ELEMENTS_8",
    "Glass Background": "LABELS_ELEMENTS_9",
    "Glass Card": "LABELS_ELEMENTS_10",
    "Global Hover": "LABELS_ELEMENTS_11",
    "Header": "LABELS_ELEMENTS_12",
    "Header Buttons": "LABELS_ELEMENTS_13",
    "Input Text": "LABELS_ELEMENTS_14",
    "Input mit Fokus": "LABELS_ELEMENTS_15",
    "Modal Overlay": "LABELS_ELEMENTS_16",
    "Native Select": "LABELS_ELEMENTS_17",
    "Note / Hinweis": "LABELS_ELEMENTS_18",
    "Radio Gruppe": "LABELS_ELEMENTS_19",
    "Seitenlayout": "LABELS_ELEMENTS_20",
    "Select MenÃ¼ offen": "LABELS_ELEMENTS_21",
    "Sidebar": "LABELS_ELEMENTS_22",
    "Sidebar EintrÃ¤ge": "LABELS_ELEMENTS_23",
    "Standard Button": "LABELS_ELEMENTS_24",
    "Standard Card": "LABELS_ELEMENTS_25",
    "Standard Checkbox": "LABELS_ELEMENTS_26",
    "Standard Modal": "LABELS_ELEMENTS_27",
    "Standard Radio": "LABELS_ELEMENTS_28",
    "Standard Select": "LABELS_ELEMENTS_29",
    "Standard Slider": "LABELS_ELEMENTS_30",
    "Standard Tabelle": "LABELS_ELEMENTS_31",
    "Standard Toggle": "LABELS_ELEMENTS_32",
    "Success": "LABELS_ELEMENTS_33",
    "System Hintergrund": "LABELS_ELEMENTS_34",
    "Tabelle mit Buttons": "LABELS_ELEMENTS_35",
    "Tabelle mit Selects": "LABELS_ELEMENTS_36",
    "Table Hover": "LABELS_ELEMENTS_37",
    "Textarea": "LABELS_ELEMENTS_38",
    "Toggle Disabled": "LABELS_ELEMENTS_39",
    "Wallpaper": "LABELS_ELEMENTS_40",
    "Warning": "LABELS_ELEMENTS_41"
  },
  "groups": {
    "Abdunklung": "LABELS_GROUPS_0",
    "Active": "LABELS_GROUPS_1",
    "Active Hover": "LABELS_GROUPS_2",
    "Active Hover Textfarbe": "LABELS_GROUPS_3",
    "Active Textfarbe": "LABELS_GROUPS_4",
    "Button Hover": "LABELS_GROUPS_5",
    "Button Hover Textfarbe": "LABELS_GROUPS_6",
    "Button Rahmen": "LABELS_GROUPS_7",
    "Button-Textfarbe": "LABELS_GROUPS_8",
    "Buttonfarbe": "LABELS_GROUPS_9",
    "Disabled": "LABELS_GROUPS_10",
    "Focus": "LABELS_GROUPS_11",
    "Focus-Ring": "LABELS_GROUPS_12",
    "Grundfarbe": "LABELS_GROUPS_13",
    "Header": "LABELS_GROUPS_14",
    "Header Textfarbe": "LABELS_GROUPS_15",
    "Hintergrund": "LABELS_GROUPS_16",
    "Hover": "LABELS_GROUPS_17",
    "Hover Textfarbe": "LABELS_GROUPS_18",
    "Knopf": "LABELS_GROUPS_19",
    "Knopf Farbe": "LABELS_GROUPS_20",
    "Knopf Hover-Ring": "LABELS_GROUPS_21",
    "Knopf Rahmenfarbe": "LABELS_GROUPS_22",
    "Knopf RahmenstÃ¤rke": "LABELS_GROUPS_23",
    "Knopf Schatten": "LABELS_GROUPS_24",
    "Radius": "LABELS_GROUPS_25",
    "Rahmen": "LABELS_GROUPS_26",
    "RahmenstÃ¤rke": "LABELS_GROUPS_27",
    "Schatten": "LABELS_GROUPS_28",
    "Select Grundfarbe": "LABELS_GROUPS_29",
    "Select Hover": "LABELS_GROUPS_30",
    "Select Rahmen": "LABELS_GROUPS_31",
    "Select Textfarbe": "LABELS_GROUPS_32",
    "Textfarbe": "LABELS_GROUPS_33",
    "Transparenz": "LABELS_GROUPS_34",
    "UnschÃ¤rfe": "LABELS_GROUPS_35",
    "Wert Hintergrund": "LABELS_GROUPS_36",
    "Wert Schriftfarbe": "LABELS_GROUPS_37",
    "__tableCellLineWidth": "LABELS_GROUPS_38",
    "__tableCellLines": "LABELS_GROUPS_39",
    "Active Rahmen": "LABELS_GROUPS_40",
    "Active Symbol": "LABELS_GROUPS_41",
    "Hover Rahmen": "LABELS_GROUPS_42",
    "Option Grundfarbe": "LABELS_GROUPS_43",
    "Option Textfarbe": "LABELS_GROUPS_44",
    "Option Hover": "LABELS_GROUPS_45",
    "Option Hover Textfarbe": "LABELS_GROUPS_46"
  }
};

  function displayStudioLabel(kind, name) {
    var keys = studioDisplayLabelKeys[kind] || {};
    var key = keys[name];
    return key ? tx(key) : name;
  }

  function displayAreaName(name) { return displayStudioLabel('areas', name); }
  function displayElementName(name) { return displayStudioLabel('elements', name); }
  function displayGroupName(name) { return displayStudioLabel('groups', name); }

  function selectionPathLabel(area, element, group) {
    var parts = [displayAreaName(area), displayElementName(element)];
    if (group) parts.push(displayGroupName(group));
    return parts.join(' \u2192 ');
  }

  function localizedServerError(json, fallbackKey, values) {
    var key = json && json.error_key;
    if (key) return t('SERVER_ERRORS_' + key, i18nGet(key) || (json && json.error) || tx(fallbackKey), json.error_values || values || {});
    return tx(fallbackKey, values);
  }

  function applyI18n(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-i18n'), node.textContent || '');
    });
    root.querySelectorAll('[data-i18n-html]').forEach(function (node) {
      node.innerHTML = t(node.getAttribute('data-i18n-html'), node.innerHTML || '');
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(function (node) {
      String(node.getAttribute('data-i18n-attr') || '').split(';').forEach(function (part) {
        var pair = part.split(':');
        if (pair.length !== 2) return;
        var attr = pair[0].trim();
        var key = pair[1].trim();
        if (attr && key) node.setAttribute(attr, t(key, node.getAttribute(attr) || ''));
      });
    });
  }

  var studioModel = {};

  var blockedTokenPatterns = [
    /^--lb-table-status-/,
    /^--lb-(?:success|ok|warning|warn|danger|error|critical|info|notice|alert)(?:-|$)/,
    /^--lb-tooltip-/
  ];

  function isBlockedToken(name) {
    return blockedTokenPatterns.some(function (pattern) { return pattern.test(name); });
  }

  var areas = {
    'Input': {
      'Input Text': {
        'Grundfarbe': ['--lb-input-bg', '--lb-textarea-bg', '--lb-select-bg', '--lb-native-select-bg', '--lb-multiselect-summary-bg'],
        'Textfarbe': ['--lb-input-text', '--lb-textarea-text', '--lb-select-text', '--lb-native-select-text', '--lb-multiselect-text'],
        'Rahmen': ['--lb-input-border', '--lb-textarea-border', '--lb-select-border', '--lb-native-select-border', '--lb-multiselect-border'],
        'Focus': ['--lb-input-focus-border', '--lb-input-focus-shadow'],
        'Disabled': ['--lb-input-disabled-bg', '--lb-input-disabled-text'],
        'Radius': ['--lb-input-radius', '--lb-radius-input', '--lb-textarea-radius', '--lb-select-radius', '--lb-radius-select', '--lb-radius-sm']
      },
      'Textarea': {
        'Grundfarbe': ['--lb-input-bg', '--lb-textarea-bg', '--lb-select-bg', '--lb-native-select-bg', '--lb-multiselect-summary-bg'],
        'Textfarbe': ['--lb-input-text', '--lb-textarea-text', '--lb-select-text', '--lb-native-select-text', '--lb-multiselect-text'],
        'Rahmen': ['--lb-input-border', '--lb-textarea-border', '--lb-select-border', '--lb-native-select-border', '--lb-multiselect-border'],
        'Radius': ['--lb-input-radius', '--lb-radius-input', '--lb-textarea-radius', '--lb-select-radius', '--lb-radius-select', '--lb-radius-sm']
      },
      'Input mit Fokus': {
        'Grundfarbe': ['--lb-input-focus-bg', '--lb-input-bg'],
        'Rahmen': ['--lb-input-focus-border'],
        'Schatten': ['--lb-input-focus-shadow']
      }
    },
    'Selects': {
      'Standard Select': {
        'Grundfarbe': ['--lb-input-bg', '--lb-textarea-bg', '--lb-select-bg', '--lb-native-select-bg', '--lb-multiselect-summary-bg'],
        'Textfarbe': ['--lb-input-text', '--lb-textarea-text', '--lb-select-text', '--lb-native-select-text', '--lb-multiselect-text'],
        'Rahmen': ['--lb-input-border', '--lb-textarea-border', '--lb-select-border', '--lb-native-select-border', '--lb-multiselect-border'],
        'Hover': ['--lb-select-hover-bg'],
        'Hover Textfarbe': ['--lb-select-hover-text'],
        'Hover Rahmen': ['--lb-select-hover-border'],
        'Focus': ['--lb-select-focus-border'],
        'Option Grundfarbe': ['--lb-select-option-bg', '--lb-select-bg'],
        'Option Textfarbe': ['--lb-select-option-text', '--lb-select-text'],
        'Option Hover': ['--lb-select-option-hover-bg', '--lb-select-hover-bg'],
        'Option Hover Textfarbe': ['--lb-select-option-hover-text', '--lb-select-hover-text'],
        'Radius': ['--lb-input-radius', '--lb-radius-input', '--lb-textarea-radius', '--lb-select-radius', '--lb-radius-select', '--lb-radius-sm']
      },
      'Native Select': {
        'Grundfarbe': ['--lb-input-bg', '--lb-textarea-bg', '--lb-select-bg', '--lb-native-select-bg', '--lb-multiselect-summary-bg'],
        'Textfarbe': ['--lb-input-text', '--lb-textarea-text', '--lb-select-text', '--lb-native-select-text', '--lb-multiselect-text'],
        'Rahmen': ['--lb-input-border', '--lb-textarea-border', '--lb-select-border', '--lb-native-select-border', '--lb-multiselect-border'],
        'Radius': ['--lb-input-radius', '--lb-radius-input', '--lb-textarea-radius', '--lb-select-radius', '--lb-radius-select', '--lb-radius-sm']
      },
      'Select MenÃ¼ offen': {
        'Grundfarbe': ['--lb-select-menu-bg'],
        'Textfarbe': ['--lb-select-menu-text'],
        'Hover': ['--lb-select-menu-hover-bg'],
        'Rahmen': ['--lb-select-menu-border']
      }
    },
    'Checkboxen': {
      'Standard Checkbox': {
        'Grundfarbe': ['--lb-checkbox-bg', '--lb-input-bg'],
        'Active': ['--lb-checkbox-checked-bg', '--lb-active-bg', '--lb-primary'],
        'Active Rahmen': ['--lb-checkbox-checked-border', '--lb-checkbox-checked-bg', '--lb-active-bg', '--lb-primary'],
        'Active Symbol': ['--lb-checkbox-checkmark-text', '--lb-active-text', '--lb-btn-primary-text'],
        'Rahmen': ['--lb-checkbox-border', '--lb-input-border', '--lb-border-color'],
        'Textfarbe': ['--lb-checkbox-text', '--lb-text'],
        'Radius': ['--lb-checkbox-radius']
      },
      'Checkbox Gruppe': {
        'Grundfarbe': ['--lb-checkbox-group-bg', '--lb-card-bg'],
        'Rahmen': ['--lb-checkbox-group-border', '--lb-card-border'],
        'Radius': ['--lb-radius-card']
      }
    },
    'Radio': {
      'Standard Radio': {
        'Grundfarbe': ['--lb-radio-bg'],
        'Active': ['--lb-radio-checked-bg', '--lb-active-bg', '--lb-primary'],
        'Active Rahmen': ['--lb-radio-checked-border', '--lb-radio-checked-bg', '--lb-active-bg', '--lb-primary'],
        'Active Punkt': ['--lb-radio-dot-bg', '--lb-active-text', '--lb-btn-primary-text'],
        'Rahmen': ['--lb-radio-border'],
        'Textfarbe': ['--lb-radio-text', '--lb-text']
      },
      'Radio Gruppe': {
        'Grundfarbe': ['--lb-radio-group-bg', '--lb-card-bg'],
        'Rahmen': ['--lb-radio-group-border', '--lb-card-border'],
        'Radius': ['--lb-radius-card']
      }
    },
    'Dropdowns': {
      'Dropdown MenÃ¼': {
        'Grundfarbe': ['--lb-dropdown-menu-bg', '--lb-multiselect-bg'],
        'Textfarbe': ['--lb-dropdown-menu-text', '--lb-multiselect-text'],
        'Hover': ['--lb-multiselect-option-hover-bg', '--lb-tab-popup-item-hover-bg'],
        'Rahmen': ['--lb-multiselect-menu-border', '--lb-multiselect-border'],
        'Schatten': ['--lb-multiselect-shadow']
      },
      'Dropdown Button': {
        'Grundfarbe': ['--lb-input-bg', '--lb-textarea-bg', '--lb-select-bg', '--lb-native-select-bg', '--lb-multiselect-summary-bg'],
        'Textfarbe': ['--lb-input-text', '--lb-textarea-text', '--lb-select-text', '--lb-native-select-text', '--lb-multiselect-text'],
        'Rahmen': ['--lb-input-border', '--lb-textarea-border', '--lb-select-border', '--lb-native-select-border', '--lb-multiselect-border'],
        'Radius': ['--lb-input-radius', '--lb-radius-input', '--lb-textarea-radius', '--lb-select-radius', '--lb-radius-select', '--lb-radius-sm']
      }
    },
    'Slider': {
      'Standard Slider': {
        'Grundfarbe': ['--lb-slider-active-bg', '--lb-slider-fill-bg', '--lb-range-active-bg'],
        'Hintergrund': ['--lb-slider-bg', '--lb-slider-track-bg', '--lb-range-track-bg'],
        'Knopf Farbe': ['--lb-slider-thumb-bg'],
        'Knopf Rahmenfarbe': ['--lb-slider-thumb-border-color', '--lb-slider-thumb-border'],
        'Knopf RahmenstÃ¤rke': ['--lb-slider-thumb-border-width'],
        'Knopf Schatten': ['--lb-slider-thumb-shadow'],
        'Knopf Hover-Ring': ['--lb-slider-thumb-hover-shadow'],
        'Focus-Ring': ['--lb-slider-focus-shadow'],
        'Wert Hintergrund': ['--lb-slider-value-bg'],
        'Wert Schriftfarbe': ['--lb-slider-value-text']
      },
      'Compact Slider': {
        'Grundfarbe': ['--lb-slider-compact-active-bg', '--lb-slider-active-bg', '--lb-slider-fill-bg', '--lb-range-active-bg'],
        'Hintergrund': ['--lb-slider-compact-bg', '--lb-slider-bg', '--lb-slider-track-bg', '--lb-range-track-bg'],
        'Knopf Farbe': ['--lb-slider-compact-thumb-bg', '--lb-slider-thumb-bg'],
        'Knopf Rahmenfarbe': ['--lb-slider-compact-thumb-border', '--lb-slider-thumb-border-color', '--lb-slider-thumb-border'],
        'Knopf RahmenstÃ¤rke': ['--lb-slider-thumb-border-width'],
        'Wert Hintergrund': ['--lb-slider-value-bg'],
        'Wert Schriftfarbe': ['--lb-slider-value-text']
      }
    },
    'Toggle': {
      'Standard Toggle': {
        'Active': ['--lb-switch-on-bg', '--lb-toggle-active-bg', '--lb-active-bg', '--lb-primary'],
        'Active Textfarbe': ['--lb-switch-on-text', '--lb-toggle-active-text'],
        'Hintergrund': ['--lb-switch-off-bg', '--lb-toggle-bg'],
        'Textfarbe': ['--lb-switch-off-text', '--lb-toggle-text'],
        'Rahmen': ['--lb-switch-border', '--lb-toggle-border', '--lb-border-color', '--lb-border'],
        'Knopf': ['--lb-switch-thumb-bg', '--lb-toggle-thumb-bg', '--lb-toggle-knob-bg'],
        'Radius': ['--lb-switch-radius', '--lb-toggle-radius', '--lb-toggle-slider-radius', '--lb-toggle-thumb-radius', '--lb-toggle-knob-radius']
      },
      'Toggle Disabled': {
        'Grundfarbe': ['--lb-switch-disabled-bg'],
        'Knopf': ['--lb-switch-disabled-thumb-bg'],
        'Textfarbe': ['--lb-disabled-text']
      }
    },
    'Buttons': {
      'Standard Button': {
        'Grundfarbe': ['--lb-btn-bg'],
        'Textfarbe': ['--lb-btn-text'],
        'Rahmen': ['--lb-btn-border'],
        'Hover': ['--lb-btn-hover-bg', '--lb-btn-hover-border'],
        'Radius': ['--lb-radius-button', '--lb-btn-radius'],
        'Schatten': ['--lb-btn-shadow']
      },
      'Active Button': {
        'Grundfarbe': ['--lb-active-bg', '--lb-btn-primary-bg'],
        'Textfarbe': ['--lb-active-text', '--lb-btn-primary-text'],
        'Rahmen': ['--lb-active-border', '--lb-btn-primary-border'],
        'Hover': ['--lb-active-hover-bg']
      },
      'Button Gruppe': {
        'Grundfarbe': ['--lb-btn-group-inactive-bg'],
        'Textfarbe': ['--lb-btn-group-inactive-text'],
        'Rahmen': ['--lb-btn-group-border', '--lb-btn-group-inactive-border', '--lb-btn-group-active-border'],
        'Hover': ['--lb-btn-group-hover-bg'],
        'Hover Textfarbe': ['--lb-btn-group-hover-text'],
        'Active': ['--lb-btn-group-active-bg'],
        'Active Textfarbe': ['--lb-btn-group-active-text'],
        'Active Hover': ['--lb-btn-group-active-hover-bg'],
        'Active Hover Textfarbe': ['--lb-btn-group-active-hover-text'],
        'Radius': ['--lb-btn-group-radius', '--lb-btn-group-item-radius', '--lb-btn-radius', '--lb-radius-button']
      },
      'Header Buttons': {
        'Grundfarbe': ['--lb-header-btn-bg'],
        'Textfarbe': ['--lb-header-btn-text'],
        'Hover': ['--lb-header-btn-hover-bg', '--lb-header-btn-hover-text'],
        'Radius': ['--lb-btn-radius'],
        'Rahmen': ['--lb-btn-border']
      }
    },
    'Cards/Notes': {
      'Standard Card': {
        'Grundfarbe': ['--lb-card-bg'],
        'Textfarbe': ['--lb-card-text'],
        'Rahmen': ['--lb-card-border'],
        'Hover': ['--lb-card-hover-bg', '--lb-card-hover-border'],
        'Radius': ['--lb-radius-card', '--lb-card-radius'],
        'Schatten': ['--lb-card-shadow']
      },
      'Note / Hinweis': {
        'Grundfarbe': ['--lb-note-bg', '--lb-card-bg'],
        'Textfarbe': ['--lb-note-text', '--lb-card-text'],
        'Rahmen': ['--lb-note-border', '--lb-card-border'],
        'Radius': ['--lb-radius-card']
      },
      'Glass Card': {
        'Grundfarbe': ['--lb-glass-bg', '--lb-card-bg'],
        'Rahmen': ['--lb-glass-border', '--lb-card-border'],
        'Transparenz': ['--lb-glass-opacity'],
        'Schatten': ['--lb-glass-shadow', '--lb-card-shadow']
      }
    },
    'tabellen': {
      'Standard Tabelle': {
        'Grundfarbe': ['--lb-table-bg', '--lb-table-row-bg', '--lb-table-body-bg'],
        'Textfarbe': ['--lb-table-text', '--lb-table-row-text'],
        'Header': ['--lb-table-header-bg'],
        'Header Textfarbe': ['--lb-table-header-text'],
        'Rahmen': ['--lb-table-border-color', '--lb-table-header-border-color', '--lb-table-row-border-color', '--lb-table-border'],
        'RahmenstÃ¤rke': ['--lb-table-border-width', '--lb-table-outer-border-width'],
        '__tableCellLines': ['--lb-table-cell-border-color', '--lb-table-header-border-color', '--lb-table-row-border-color'],
        '__tableCellLineWidth': ['--lb-table-cell-border-width'],
        'Hover': ['--lb-table-row-hover-bg', '--lb-table-hover-bg'],
        'Hover Textfarbe': ['--lb-table-row-hover-text', '--lb-table-hover-text'],
        'Radius': ['--lb-table-radius', '--lb-radius-table']
      },
      'Compact Tabelle': {
        'Grundfarbe': ['--lb-table-compact-bg', '--lb-table-bg'],
        'Textfarbe': ['--lb-table-compact-text', '--lb-table-text'],
        'Header': ['--lb-table-compact-header-bg', '--lb-table-header-bg'],
        'Header Textfarbe': ['--lb-table-compact-header-text', '--lb-table-header-text'],
        'Rahmen': ['--lb-table-compact-border-color', '--lb-table-border-color', '--lb-table-border'],
        'RahmenstÃ¤rke': ['--lb-table-compact-border-width', '--lb-table-border-width', '--lb-table-outer-border-width'],
        '__tableCellLines': ['--lb-table-cell-border-color', '--lb-table-header-border-color', '--lb-table-row-border-color'],
        '__tableCellLineWidth': ['--lb-table-cell-border-width'],
        'Hover': ['--lb-table-compact-hover-bg', '--lb-table-row-hover-bg', '--lb-table-hover-bg'],
        'Hover Textfarbe': ['--lb-table-compact-hover-text', '--lb-table-row-hover-text', '--lb-table-hover-text'],
        'Radius': ['--lb-table-compact-radius', '--lb-table-radius', '--lb-radius-table']
      },
      'Tabelle mit Selects': {
        'Grundfarbe': ['--lb-table-bg', '--lb-table-row-bg'],
        'Textfarbe': ['--lb-table-text', '--lb-table-row-text'],
        'Rahmen': ['--lb-table-border-color', '--lb-table-border'],
        'RahmenstÃ¤rke': ['--lb-table-border-width', '--lb-table-outer-border-width'],
        '__tableCellLines': ['--lb-table-cell-border-color', '--lb-table-header-border-color', '--lb-table-row-border-color'],
        '__tableCellLineWidth': ['--lb-table-cell-border-width'],
        'Hover': ['--lb-table-row-hover-bg', '--lb-table-hover-bg'],
        'Hover Textfarbe': ['--lb-table-row-hover-text', '--lb-table-hover-text'],
        'Select Grundfarbe': ['--lb-select-bg', '--lb-input-bg'],
        'Select Textfarbe': ['--lb-select-text', '--lb-input-text'],
        'Select Rahmen': ['--lb-select-border', '--lb-input-border'],
        'Select Hover': ['--lb-select-hover-bg'],
        'Radius': ['--lb-table-radius', '--lb-radius-table']
      },
      'Tabelle mit Buttons': {
        'Grundfarbe': ['--lb-table-bg', '--lb-table-row-bg'],
        'Textfarbe': ['--lb-table-text', '--lb-table-row-text'],
        'Rahmen': ['--lb-table-border-color', '--lb-table-border'],
        'RahmenstÃ¤rke': ['--lb-table-border-width', '--lb-table-outer-border-width'],
        '__tableCellLines': ['--lb-table-cell-border-color', '--lb-table-header-border-color', '--lb-table-row-border-color'],
        '__tableCellLineWidth': ['--lb-table-cell-border-width'],
        'Hover': ['--lb-table-row-hover-bg', '--lb-table-hover-bg'],
        'Hover Textfarbe': ['--lb-table-row-hover-text', '--lb-table-hover-text'],
        'Buttonfarbe': ['--lb-btn-bg'],
        'Button-Textfarbe': ['--lb-btn-text'],
        'Button Rahmen': ['--lb-btn-border'],
        'Button Hover': ['--lb-btn-hover-bg'],
        'Button Hover Textfarbe': ['--lb-btn-hover-text'],
        'Radius': ['--lb-table-radius', '--lb-radius-table']
      }
    },
    'Layout': {
      'Seitenlayout': {
        'Grundfarbe': ['--lb-bg', '--lb-page-bg', '--lb-content-bg'],
        'Textfarbe': ['--lb-text'],
        'Rahmen': ['--lb-border'],
        'Radius': ['--lb-radius']
      },
      'Header': {
        'Grundfarbe': ['--lb-header-bg'],
        'Textfarbe': ['--lb-header-text'],
        'Rahmen': ['--lb-header-border']
      },
      'Sidebar': {
        'Grundfarbe': ['--lb-sidebar-bg'],
        'Textfarbe': ['--lb-sidebar-text'],
        'Active': ['--lb-sidebar-active-bg', '--lb-nav-active-bg'],
        'Hover': ['--lb-sidebar-link-hover-bg', '--lb-nav-hover-bg']
      },
      'Sidebar EintrÃ¤ge': {
        'Textfarbe': ['--lb-sidebar-text'],
        'Buttonfarbe': ['--lb-sidebar-active-bg'],
        'Button-Textfarbe': ['--lb-sidebar-active-text'],
        'Hover': ['--lb-sidebar-link-hover-bg', '--lb-sidebar-hover-bg', '--lb-nav-hover-bg'],
        'Hover Textfarbe': ['--lb-sidebar-link-hover-text', '--lb-sidebar-hover-text', '--lb-nav-hover-text'],
        'Radius': ['--lb-sidebar-link-radius']
      }
    },
    'hover': {
      'Global Hover': {
        'Grundfarbe': ['--lb-hover-bg'],
        'Textfarbe': ['--lb-hover-text'],
        'Rahmen': ['--lb-hover-border'],
        'Schatten': ['--lb-hover-shadow']
      },
      'Card Hover': {
        'Grundfarbe': ['--lb-card-hover-bg'],
        'Rahmen': ['--lb-card-hover-border'],
        'Schatten': ['--lb-card-hover-shadow']
      },
      'Table Hover': {
        'Grundfarbe': ['--lb-table-row-hover-bg', '--lb-table-hover-bg'],
        'Textfarbe': ['--lb-table-hover-text']
      }
    },
    'Validation': {
      'Success': {
        'Grundfarbe': ['--lb-success-bg'],
        'Textfarbe': ['--lb-success-text'],
        'Rahmen': ['--lb-success-border']
      },
      'Warning': {
        'Grundfarbe': ['--lb-warning-bg'],
        'Textfarbe': ['--lb-warning-text'],
        'Rahmen': ['--lb-warning-border']
      },
      'Error': {
        'Grundfarbe': ['--lb-error-bg'],
        'Textfarbe': ['--lb-error-text'],
        'Rahmen': ['--lb-error-border']
      }
    },
    'Modal': {
      'Standard Modal': {
        'Grundfarbe': ['--lb-modal-bg', '--lb-dialog-bg'],
        'Textfarbe': ['--lb-modal-text', '--lb-dialog-text'],
        'Rahmen': ['--lb-modal-border', '--lb-dialog-border'],
        'Radius': ['--lb-dialog-radius', '--lb-radius-card'],
        'Schatten': ['--lb-modal-shadow', '--lb-dialog-shadow']
      },
      'Modal Overlay': {
        'Grundfarbe': ['--lb-modal-overlay-bg'],
        'Transparenz': ['--lb-modal-overlay-opacity']
      }
    },
    'Background': {
      'System Hintergrund': {
        'Grundfarbe': ['--lb-bg', '--lb-page-bg'],
        'Textfarbe': ['--lb-text'],
        'Transparenz': ['--lb-bg-opacity']
      },
      'Wallpaper': {
        'Grundfarbe': ['--lb-wallpaper-bg', '--lb-bg'],
        'Abdunklung': ['--lb-wallpaper-dim'],
        'UnschÃ¤rfe': ['--lb-wallpaper-blur']
      },
      'Glass Background': {
        'Grundfarbe': ['--lb-glass-bg', '--lb-card-bg'],
        'Transparenz': ['--lb-glass-opacity'],
        'Schatten': ['--lb-glass-shadow']
      }
    }
  };

  var propertyPaletteDefaults = {

    'Grundfarbe': ['#f7f7f7', '#ffffff', '#e5e5e5', '#2563eb', '#3d3d3d', '#171717'],
    'Textfarbe': ['#171717', '#404040', '#737373', '#ffffff', '#f5f5f5', '#000000'],
    'Hintergrund': ['#ffffff', '#f7f7f7', '#f5f5f5', '#e5e5e5', '#3d3d3d', '#171717'],
    'Rahmen': ['#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#2563eb', '#404040'],
    'Hover': ['#f5f5f5', '#e5e5e5', '#dbeafe', '#d4d4d4', '#1d4ed8', '#404040'],
    'Active': ['#2563eb', '#1d4ed8', '#1e40af', '#3d3d3d', '#ffffff', '#171717'],
    'Buttonfarbe': ['#2563eb', '#1d4ed8', '#1e40af', '#8b5e34', '#3d3d3d', '#171717'],
    'Button-Textfarbe': ['#ffffff', '#f5f5f5', '#171717', '#000000', '#3d3d3d', '#737373'],
    'Hover Textfarbe': ['#ffffff', '#f5f5f5', '#171717', '#000000', '#3d3d3d', '#737373'],
    'Header': ['#ffffff', '#f7f7f7', '#e5e5e5', '#2563eb', '#3d3d3d', '#171717'],
    'Disabled': ['#f5f5f5', '#eeeeee', '#d4d4d4', '#a3a3a3', '#737373', '#404040'],
    'Focus': ['#2563eb', '#1d4ed8', '#1e40af', '#737373', '#404040', '#171717'],
    'Schatten': ['#000000', '#171717', '#404040', '#737373', '#3d3d3d', '#2563eb'],
    'Radius': ['#2563eb', '#1d4ed8', '#737373', '#404040', '#171717', '#ffffff'],
    'Transparenz': ['#ffffff', '#f7f7f7', '#e5e5e5', '#737373', '#404040', '#171717'],
    'Knopf': ['#e6e6e6', '#d4d4d4', '#2563eb', '#1d4ed8', '#ffffff', '#171717'],
    'Abdunklung': ['#000000', '#171717', '#3d3d3d', '#404040', '#737373', '#a3a3a3'],
    'UnschÃ¤rfe': ['#ffffff', '#f7f7f7', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#737373']
  };
  function classifyStatusKind(message, isError, kind) {
    if (isError) return 'error';
    if (kind) return kind;

    var text = String(message || '').toLowerCase();

    if (
      /\b(speichere|saving|lÃ¶sche|deleting|lade\b|loading|frage|requesting|warte|waiting|prÃ¼fe|checking|validiere|validating|erzeuge|generating)\b/.test(text) ||
      /\.\.\./.test(text) ||
      /bitte\s+(validieren|warten|prÃ¼fen|zuerst|danach)/.test(text) ||
      /(please\s+(validate|wait|review|first|then))/.test(text)
    ) {
      return 'info';
    }

    if (
      /(ok|alles in ordnung|erfolgreich|gÃ¼ltig|valid|geladen|loaded|gelÃ¶scht|deleted|gespeichert|saved|importiert|imported|Ã¼bernommen|applied|erhalten|received|gelesen|read|erstellt|created)/.test(text)
    ) {
      return 'success';
    }

    return 'success';
  }

  function applyStatusKind(box, kind) {
    if (!box) return;
    box.classList.toggle('cfw-status-error', kind === 'error');
    box.classList.toggle('cfw-status-info', kind === 'info');
    box.classList.toggle('cfw-status-success', kind === 'success');
    box.classList.toggle('cfw-status-warning', kind === 'warning');
  }

  function closeStatusModal() {
    if (statusModalTimer) {
      clearTimeout(statusModalTimer);
      statusModalTimer = null;
    }
    if (statusModal) statusModal.hidden = true;
  }

  function statusModalTitleKey(kind) {
    if (kind === 'error') return 'STATUS_MODAL_ERROR_TITLE';
    if (kind === 'success') return 'STATUS_MODAL_SUCCESS_TITLE';
    if (kind === 'warning') return 'STATUS_MODAL_WARNING_TITLE';
    return 'STATUS_MODAL_INFO_TITLE';
  }

  function statusModalTitleFallback(kind) {
    return statusModalTitleKey(kind);
  }

  function statusModalIconValue(kind) {
    if (kind === 'error') return '!';
    if (kind === 'success') return '\u2713';
    if (kind === 'warning') return '!';
    return 'i';
  }

  function showStatusModal(message, kind, options) {
    if (!statusModal || !statusModalCard || !message) return;
    options = options || {};
    closeStatusModal();

    ['cfw-status-error', 'cfw-status-info', 'cfw-status-success', 'cfw-status-warning'].forEach(function (cls) {
      statusModalCard.classList.remove(cls);
    });
    statusModalCard.classList.add('cfw-status-' + kind);

    if (statusModalTitle) {
      statusModalTitle.textContent = t(statusModalTitleKey(kind), statusModalTitleFallback(kind));
    }
    if (statusModalIcon) statusModalIcon.textContent = statusModalIconValue(kind);
    if (statusModalMessage) statusModalMessage.textContent = message;

    var timeout = options.timeout;
    if (timeout == null) timeout = kind === 'error' ? 0 : 5000;

    if (statusModalActions) statusModalActions.hidden = timeout > 0;
    if (statusModalBack) {
      statusModalBack.textContent = tx(kind === 'error' ? 'MAIN_BUTTONS_BACK' : 'MAIN_BUTTONS_OK');
    }
    if (statusModalHint) {
      statusModalHint.textContent = timeout > 0
        ? tx('STATUS_MODAL_AUTO_CLOSE_HINT')
        : tx('STATUS_MODAL_MANUAL_CLOSE_HINT');
    }

    statusModal.hidden = false;

    if (timeout > 0) {
      statusModalTimer = setTimeout(function () {
        closeStatusModal();
      }, timeout);
    }
  }

  function shouldShowStatusModal(message, kind, options) {
    if (options && options.modal === false) return false;

    if (options && options.modal === 'manual') return true;
    return kind === 'error';
  }

  function hideTopMessage() {
    if (topMessageTimer) {
      clearTimeout(topMessageTimer);
      topMessageTimer = null;
    }
    if (!topMessage) return;
    topMessage.hidden = true;
    topMessage.textContent = '';
    topMessage.classList.remove('cfw-status-error', 'cfw-status-info', 'cfw-status-success', 'cfw-status-warning', 'is-visible');
  }

  function showTopMessage(message, kind) {
    if (!topMessage || !message) return;
    if (topMessageTimer) clearTimeout(topMessageTimer);
    topMessage.textContent = message;
    topMessage.hidden = false;
    applyStatusKind(topMessage, kind);
    requestAnimationFrame(function () {
      topMessage.classList.add('is-visible');
    });
    topMessageTimer = setTimeout(hideTopMessage, 4000);
  }

  function setStatus(message, isError, kind, options) {
    options = options || {};
    var resolvedKind = classifyStatusKind(message, isError, kind);

    if (statusBox) {
      statusBox.textContent = message || '';
      applyStatusKind(statusBox, resolvedKind);
    }

    if (message && shouldShowStatusModal(message, resolvedKind, options)) {
      hideTopMessage();
      showStatusModal(message, resolvedKind, { timeout: 0 });
      return;
    }

    if (message) showTopMessage(message, resolvedKind);
    else hideTopMessage();
  }

  function normalizeThemeDisplayName(name) {
    return themeIdentity.normalizeDisplayName(name);
  }

  function slugifyThemeName(name) {
    return themeIdentity.slugify(name);
  }

  function isWallpaperOnlyTheme() {
    var selected = userThemes.find(function (item) { return themeId && item.id === themeId.value; });
    return !!(selected && selected.studio && selected.studio.mode === 'wallpaper-only');
  }

  function isLiquidGlassThemeId() { return false; }

  function updateLiquidGlassPackagePreviewMode() {}

  function isReadOnlyProtectedStudioThemeId() { return false; }

  function isProtectedStudioThemeId(id) {
    var theme = userThemes.find(function (item) { return item.id === id; });
    return !!(theme && (theme.type === 'core' || (theme.studio && theme.studio.editable === false)));
  }

  function protectedStudioThemeMessage(id) {
    return protectedThemes.message(id, function (key, values) {
      return t(key, key, values || {});
    });
  }

  function isLiquidGlassWallpaperEditorMode() { return false; }

  function renderNewThemeColorPalette() {
    if (!newThemeColorPalette || !newThemeColorPicker) return;
    newThemeColorPalette.innerHTML = '';

    colorDirectionPresets.forEach(function (item) {
      var color = item.color;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'cfw-color-swatch';
      button.style.background = color;
      button.setAttribute('data-role', 'none');
      button.setAttribute('aria-label', colorDirectionLabel(item));
      button.title = colorDirectionLabel(item);
      button.addEventListener('click', function () {
        newThemeColorPicker.value = normalizeHexColor(color) || color;
        updateNewThemeColorPresetSelection();
      });
      newThemeColorPalette.appendChild(button);
    });
    updateNewThemeColorPresetSelection();
  }

  function updateNewThemeColorPresetSelection() {
    if (!newThemeColorPalette || !newThemeColorPicker) return;
    var current = String(newThemeColorPicker.value || '').toLowerCase();
    newThemeColorPalette.querySelectorAll('.cfw-color-swatch').forEach(function (button) {
      var bg = normalizeHexColor(button.style.backgroundColor || button.style.background || '');
      button.classList.toggle('is-active', String(bg || '').toLowerCase() === current);
    });
  }

  function blendThemeColor(a, b, amount) {
    var ca = parseHexColor(a);
    var cb = parseHexColor(b);
    if (!ca || !cb) return a || b;
    amount = Math.max(0, Math.min(1, Number(amount) || 0));
    return rgbToHex({
      r: ca.r + (cb.r - ca.r) * amount,
      g: ca.g + (cb.g - ca.g) * amount,
      b: ca.b + (cb.b - ca.b) * amount
    });
  }

  function resolvedColorToken(tokens, names, fallback) {
    var value = firstResolvedToken(tokens || {}, names || []);
    var hex = colorToPickerHex(value, '');
    return normalizeHexColor(hex) || fallback;
  }

  function themeRelativeLuminance(color) {
    var rgb = parseHexColor(normalizeHexColor(color));
    if (!rgb) return 0;
    function channel(value) {
      value = value / 255;
      return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  }

  function themeContrastRatio(a, b) {
    var light = themeRelativeLuminance(a);
    var dark = themeRelativeLuminance(b);
    if (dark > light) {
      var swap = light;
      light = dark;
      dark = swap;
    }
    return (light + 0.05) / (dark + 0.05);
  }

  function bestTextOnThemeColor(color) {
    var dark = '#111827';
    var light = '#ffffff';
    var darkRatio = themeContrastRatio(color, dark);
    var lightRatio = themeContrastRatio(color, light);
    return darkRatio >= lightRatio
      ? { color: dark, ratio: darkRatio, kind: 'dark' }
      : { color: light, ratio: lightRatio, kind: 'light' };
  }

  function classifyThemeBrightness(color) {
    var luminance = themeRelativeLuminance(color);
    if (luminance < 0.08) return { key: 'GLOBAL_COLOR_BRIGHTNESS_VERY_DARK', fallback: 'Very dark', luminance: luminance };
    if (luminance < 0.22) return { key: 'GLOBAL_COLOR_BRIGHTNESS_DARK', fallback: 'Dark', luminance: luminance };
    if (luminance < 0.48) return { key: 'GLOBAL_COLOR_BRIGHTNESS_MEDIUM', fallback: 'Medium', luminance: luminance };
    if (luminance < 0.75) return { key: 'GLOBAL_COLOR_BRIGHTNESS_LIGHT', fallback: 'Light', luminance: luminance };
    return { key: 'GLOBAL_COLOR_BRIGHTNESS_VERY_LIGHT', fallback: 'Very light', luminance: luminance };
  }

  function resolveNewThemeColorMode(baseColor, requestedMode) {
    if (requestedMode === 'light' || requestedMode === 'dark') return requestedMode;
    return themeRelativeLuminance(baseColor) >= 0.34 ? 'light' : 'dark';
  }

  function updateNewThemeColorAnalysis() {
    if (!newThemeColorPicker) return;
    var baseColor = normalizeHexColor(newThemeColorPicker.value) || '#2563eb';
    var requestedMode = newThemeColorMode ? newThemeColorMode.value : 'auto';
    var resolvedMode = resolveNewThemeColorMode(baseColor, requestedMode);
    var brightness = classifyThemeBrightness(baseColor);
    var onPrimary = bestTextOnThemeColor(baseColor);
    if (newThemeBrightnessValue) newThemeBrightnessValue.textContent = t(brightness.key, brightness.fallback);
    if (newThemeResolvedModeValue) newThemeResolvedModeValue.textContent = t('GLOBAL_COLOR_MODE' + (resolvedMode === 'dark' ? 'Dark' : 'Light'), resolvedMode);
    if (newThemeOnPrimaryValue) {
      newThemeOnPrimaryValue.textContent = t(onPrimary.kind === 'dark' ? 'GLOBAL_COLOR_TEXT_DARK' : 'GLOBAL_COLOR_TEXT_LIGHT', onPrimary.kind) + ' \u00b7 ' + onPrimary.color.toUpperCase();
      newThemeOnPrimaryValue.style.color = onPrimary.color;
      newThemeOnPrimaryValue.style.background = baseColor;
      newThemeOnPrimaryValue.style.padding = '2px 6px';
      newThemeOnPrimaryValue.style.borderRadius = '5px';
    }
    if (newThemeContrastValue) newThemeContrastValue.textContent = onPrimary.ratio.toFixed(2).replace('.', ',') + ' : 1';
  }

  function localThemePaletteFromColor(baseColor, requestedMode) {
    baseColor = normalizeHexColor(baseColor) || '#2563eb';
    var mode = resolveNewThemeColorMode(baseColor, requestedMode || 'auto');
    var onPrimaryInfo = bestTextOnThemeColor(baseColor);
    var focusRgb = parseHexColor(baseColor) || { r: 37, g: 99, b: 235 };
    var palette;

    if (mode === 'dark') {
      var darkBase = '#0f172a';
      var darkSurface = blendThemeColor('#111827', baseColor, 0.12);
      palette = {
        mode: mode,
        primary: baseColor,
        primaryHover: blendThemeColor(baseColor, '#ffffff', 0.14),
        primaryDark: blendThemeColor(baseColor, '#000000', 0.20),
        bg: blendThemeColor(darkBase, baseColor, 0.08),
        surface: darkSurface,
        surfaceAlt: blendThemeColor('#1e293b', baseColor, 0.16),
        text: '#f8fafc',
        muted: '#b7c2d0',
        border: blendThemeColor(baseColor, '#ffffff', 0.42),
        sidebar: blendThemeColor('#020617', baseColor, 0.14),
        sidebarText: '#ffffff',
        onPrimary: onPrimaryInfo.color
      };
    } else {
      var lightSurface = blendThemeColor('#ffffff', baseColor, 0.025);
      palette = {
        mode: mode,
        primary: baseColor,
        primaryHover: blendThemeColor(baseColor, '#000000', 0.12),
        primaryDark: blendThemeColor(baseColor, '#000000', 0.24),
        bg: blendThemeColor('#f8fafc', baseColor, 0.035),
        surface: lightSurface,
        surfaceAlt: blendThemeColor('#f1f5f9', baseColor, 0.10),
        text: '#172033',
        muted: '#566274',
        border: blendThemeColor(baseColor, '#334155', 0.52),
        sidebar: blendThemeColor(baseColor, '#111827', 0.70),
        sidebarText: '#ffffff',
        onPrimary: onPrimaryInfo.color
      };
    }

    palette.focusShadow = '0 0 0 3px rgba(' + Math.round(focusRgb.r) + ', ' + Math.round(focusRgb.g) + ', ' + Math.round(focusRgb.b) + ', 0.25)';
    return palette;
  }

  function buildLocalThemeColorDraft(baseColor, sourceTokens, requestedMode) {
    baseColor = normalizeHexColor(baseColor) || '#2563eb';
    sourceTokens = sourceTokens || {};
    var palette = localThemePaletteFromColor(baseColor, requestedMode || 'auto');
    var bg = palette.bg;
    var surface = palette.surface;
    var surfaceAlt = palette.surfaceAlt;
    var text = palette.text;
    var muted = palette.muted;
    var border = palette.border;
    var onPrimary = palette.onPrimary;
    var primaryHover = palette.primaryHover;
    var isDark = palette.mode === 'dark';
    var neutralButton = isDark ? blendThemeColor(surfaceAlt, '#ffffff', 0.04) : '#ffffff';
    var neutralHover = isDark ? blendThemeColor(surfaceAlt, baseColor, 0.18) : blendThemeColor(baseColor, '#ffffff', 0.88);

    return {
      design: {
        colors: {
          primary: baseColor,
          primary_hover: primaryHover,
          on_primary: onPrimary,
          background: bg,
          surface: surface,
          surface_alt: surfaceAlt,
          text: text,
          muted_text: muted,
          border: border,
          sidebar: palette.sidebar,
          sidebar_text: palette.sidebarText
        },
        components: {
          table: { background: surface, header: surfaceAlt, header_text: text, text: text, hover: blendThemeColor(surfaceAlt, baseColor, isDark ? 0.20 : 0.12), border: border, radius: '10px' },
          slider: { active: baseColor, track: surfaceAlt, thumb: isDark ? '#f8fafc' : '#ffffff', thumb_border: border, focus: baseColor, value_background: surfaceAlt, value_text: text },
          toggle: {
            off: surfaceAlt,
            off_text: readableTextFor(surfaceAlt, '#f8fafc', '#111827'),
            active: baseColor,
            active_text: onPrimary,
            border: border,
            thumb: isDark ? '#f8fafc' : '#ffffff',
            radius: '10px'
          },
          button: { background: neutralButton, text: text, hover: primaryHover, hover_text: onPrimary, border: border, radius: '10px' },
          header_button: { background: baseColor, text: onPrimary, hover: primaryHover, hover_text: onPrimary },
          button_group: {
            background: neutralButton,
            text: text,
            active: baseColor,
            active_text: onPrimary,
            hover: primaryHover,
            hover_text: onPrimary,
            border: border,
            radius: '10px'
          },
          card: { background: surface, text: text, border: border, radius: '10px' },
          input: { background: surface, text: text, border: border, hover: surfaceAlt, focus: baseColor, radius: '10px' },
          select: { background: surface, text: text, border: border, hover: surfaceAlt, hover_text: text, radius: '10px' },
          dropdown: { background: surface, text: text, border: border, hover: primaryHover, radius: '10px' }
        }
      },
      meta: { resolvedMode: palette.mode }
    };
  }

  function isThemeColorToken(name, value) {
    if (!/^--lb-[a-z0-9-]+$/.test(name || '') || isBlockedToken(name)) return false;
    if (/(radius|width|height|size|padding|margin|gap|font|shadow|z-index|opacity|blur|line-height|weight|overflow|spacing|duration|transform)/.test(name)) return false;
    return /(^#|^rgba?\(|^hsla?\(|^transparent$|^var\()/i.test(String(value || '').trim());
  }

  function applyLocalThemeDefaults(tokens) {
    var radiusTokens = [
      '--lb-radius', '--lb-radius-sm', '--lb-radius-lg', '--lb-radius-card', '--lb-card-radius',
      '--lb-header-radius', '--lb-panel-radius', '--lb-note-radius',
      '--lb-btn-radius', '--lb-radius-button', '--lb-btn-group-radius', '--lb-btn-group-item-radius',
      '--lb-input-radius', '--lb-radius-input', '--lb-textarea-radius',
      '--lb-select-radius', '--lb-radius-select',
      '--lb-table-radius', '--lb-radius-table', '--lb-table-compact-radius',
      '--lb-sidebar-link-radius', '--lb-dialog-radius', '--lb-modal-radius', '--lb-checkbox-radius',
      '--lb-badge-radius', '--lb-notify-radius', '--lb-validation-radius'
    ];
    radiusTokens.forEach(function (name) {
      if (coreTokens[name] !== undefined && !isBlockedToken(name)) tokens[name] = '10px';
    });
    return tokens;
  }

  function applyLocalThemeColor() {
    if (!newThemeColorPicker || isProtectedStudioThemeId(themeId && themeId.value)) return;
    forceNeutralNewTheme = false;
    var sourceInfo = selectedUserThemeInfo();
    var sourceName = sourceInfo && sourceInfo.theme ? (sourceInfo.theme.name || sourceInfo.theme.id) : (themeName && themeName.value ? themeName.value : tx('TOOLBAR_CURRENT_PREVIEW_NEW_THEME'));
    var sourceTokens = effectivePreviewTokens();
    var requestedThemeMode = newThemeColorMode ? newThemeColorMode.value : 'auto';
    var localThemeDraft = buildLocalThemeColorDraft(newThemeColorPicker.value, sourceTokens, requestedThemeMode);
    var draftTokens = applyLocalThemeDefaults(compileSemanticDraftToTokens(localThemeDraft));
    var recolored = Object.assign({}, workingTokens || {});
    Object.keys(draftTokens).forEach(function (name) {
      if (isThemeColorToken(name, draftTokens[name])) recolored[name] = draftTokens[name];
    });

    var localGroupPrimary = normalizeHexColor(newThemeColorPicker.value) || '#2563eb';
    var localResolvedMode = localThemeDraft.meta && localThemeDraft.meta.resolvedMode ? localThemeDraft.meta.resolvedMode : resolveNewThemeColorMode(localGroupPrimary, requestedThemeMode);
    var localGroupBorder = localResolvedMode === 'dark' ? blendThemeColor(localGroupPrimary, '#ffffff', 0.42) : blendThemeColor(localGroupPrimary, '#334155', 0.52);

    recolored['--lb-btn-group-inactive-bg'] = recolored['--lb-btn-bg'] || draftTokens['--lb-btn-bg'] || (localResolvedMode === 'dark' ? blendThemeColor('#1e293b', localGroupPrimary, 0.10) : '#ffffff');
    recolored['--lb-btn-group-inactive-text'] = recolored['--lb-btn-text'] || draftTokens['--lb-btn-text'] || (localResolvedMode === 'dark' ? '#f8fafc' : '#0f172a');
    recolored['--lb-btn-group-border'] = localGroupBorder;
    recolored['--lb-btn-group-inactive-border'] = localGroupBorder;
    applyLocalThemeDefaults(recolored);

    pushUndoSnapshot('global-theme-color');
    studioModel = {};
    workingTokens = enforceForcedOpaqueTokens(recolored);
    directTokenOverrides = {};
    activeDirectToken = '';

    var formtableCss = '/* DESIGN STUDIO NEW THEME FORMTABLE */\n.formtable { background: transparent !important; }';
    var sourceCustomCss = normalizeCustomCssValue(customCss && customCss.value ? customCss.value : importedCss);
    sourceCustomCss = sourceCustomCss.replace(/\n?\/\* DESIGN STUDIO NEW THEME FORMTABLE \*\/\s*\n?\.formtable\s*\{[^}]*\}\s*/ig, '\n').trim();
    importedCss = (sourceCustomCss ? sourceCustomCss + '\n\n' : '') + formtableCss;
    if (customCss) customCss.value = importedCss;
    var formtablePreviewStyle = document.getElementById('cfwNewThemeFormtablePreviewStyle');
    if (!formtablePreviewStyle) {
      formtablePreviewStyle = document.createElement('style');
      formtablePreviewStyle.id = 'cfwNewThemeFormtablePreviewStyle';
      document.head.appendChild(formtablePreviewStyle);
    }
    formtablePreviewStyle.textContent = '#previewRoot.theme-user-neues-theme .formtable { background: transparent !important; }';
    hasActiveEditorSelection = false;
    if (userThemeSelect) userThemeSelect.value = '';
    if (themeName) themeName.value = tx('GLOBAL_COLOR_NEW_THEME');
    if (themeId) themeId.value = 'theme-user-neues-theme';
    if (themeVersion) themeVersion.value = '0.1.0';
    var previewTokens = applyDesignRules(Object.assign({}, workingTokens));
    syncCurrentControlsFromTokens(workingTokens);
    applyTokensToPreviewRoot(previewTokens);
    broadcastEmbeddedFrameTokens(previewTokens);
    updateAll(false);
    updateProtectedStudioThemeMode();
    setStatus(t('GLOBAL_COLOR_APPLIED', 'GLOBAL_COLOR_APPLIED', { source: sourceName, color: newThemeColorPicker.value, mode: t(localResolvedMode === 'dark' ? 'GLOBAL_COLOR_MODE_DARK' : 'GLOBAL_COLOR_MODE_LIGHT', localResolvedMode) }), false, 'success');
  }

  function updateProtectedStudioThemeMode() {
    var selected = selectedUserThemeInfo();
    var source = selected && selected.theme;
    var readOnly = source && source.type !== 'core' && source.studio && source.studio.editable === false;
    document.getElementById('saveTheme').disabled = !!readOnly;
    updateDeleteThemeButton();
  }

  function updateLiquidGlassWallpaperEditorMode() {
    updateProtectedStudioThemeMode();
    updateLiquidGlassPackagePreviewMode();
    configureWallpaperSliderRanges();
  }

  function isProtectedStudioWallpaperOnlySave() {
    if (!themeId || !isLiquidGlassThemeId(themeId.value)) return false;
    var wallpaper = buildWallpaperPayload();
    return !!(wallpaper && wallpaper.enabled && wallpaper.image);
  }

  function updateThemeIdentityFromName() {
    if (!themeName || !themeId) return;
    themeName.value = normalizeThemeDisplayName(themeName.value);
    var source = selectedUserThemeInfo();
    if (!source || source.theme.type === 'core') themeId.value = slugifyThemeName(themeName.value);
  }

  function makeOption(value, label, title) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = label || value;
    if (title) option.title = title;
    return option;
  }

  function formatTokenList(tokens, max) {
    tokens = (tokens || []).filter(function (name, idx, arr) { return arr.indexOf(name) === idx; });
    if (!tokens.length) return '';
    max = max || 3;
    var visible = tokens.slice(0, max).join(', ');
    if (tokens.length > max) visible += ' +' + (tokens.length - max);
    return visible;
  }

  function tokensForVariant(areaName, variantName) {
    var variant = ((areas[areaName] || {})[variantName] || {});
    var out = [];
    Object.keys(variant).forEach(function (property) {
      (variant[property] || []).forEach(function (token) {
        if (out.indexOf(token) < 0) out.push(token);
      });
    });
    return out;
  }

  function currentArea() { return areaSelect.value; }
  function currentElement() { return elementSelect.value; }
  function currentGroup() { return colorGroupSelect.value; }
  function currentKey() { return currentArea() + '|' + currentElement() + '|' + currentGroup(); }

  function currentMapping() {
    var area = areas[currentArea()] || {};
    var element = area[currentElement()] || {};
    return element[currentGroup()] || [];
  }

  function hexToRgb(hex) { return colorUtils.hexToRgb(hex); }

  function clamp(n, min, max) { return colorUtils.clamp(n, min, max); }

  function rgbToHex(rgb) { return colorUtils.rgbToHex(rgb); }

  function rgba(hex, alpha, brightness) { return colorUtils.rgba(hex, alpha, brightness); }

  function makeCssColorOpaque(value) { return colorUtils.makeCssColorOpaque(value); }

  function isForcedOpaqueToken(token) {
    return token === '--lb-sidebar-bg';
  }

  function enforceForcedOpaqueTokens(tokens) {
    if (!tokens || typeof tokens !== 'object') return tokens;
    Object.keys(tokens).forEach(function (token) {
      if (isForcedOpaqueToken(token)) {
        tokens[token] = makeCssColorOpaque(tokens[token]);
      }
    });
    return tokens;
  }

  function normalizeHexColor(value) { return colorUtils.normalizeHexColor(value); }

  function canEditCurrentColorTarget() {
    return !!hasActiveEditorSelection;
  }

  function requireColorEditTarget() {
    if (canEditCurrentColorTarget()) return true;
    setStatus(tx('MESSAGES_SELECT_ELEMENT_FIRST'), false, 'info', { modal: 'manual' });
    return false;
  }

  function updateColorPresetSelection() {
    if (!colorPresetPalette || !colorPicker) return;
    var current = normalizeHexColor(colorPicker.value) || String(colorPicker.value || '').toLowerCase();
    colorPresetPalette.querySelectorAll('.cfw-color-swatch').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-color') === current);
    });
  }

  function openNativeColorPicker() {
    if (!colorPicker) return;
    try {
      if (typeof colorPicker.showPicker === 'function') {
        colorPicker.showPicker();
        return;
      }
    } catch (e) {

    }
    try {
      colorPicker.focus();
      colorPicker.click();
    } catch (e2) {}
  }

  function choosePresetColor(color) {
    if (!colorPicker) return;
    if (!requireColorEditTarget()) return;
    var normalized = normalizeHexColor(color);
    if (!normalized) return;
    colorPicker.value = normalized;
    colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
    updateColorPresetSelection();
    openNativeColorPicker();
  }

  function renderColorPresetPalette() {
    if (!colorPresetPalette) return;
    colorPresetPalette.innerHTML = '';
    colorPresetValues.forEach(function (color) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'cfw-color-swatch';
      button.setAttribute('data-color', color);
      button.style.setProperty('--cfw-swatch-color', color);
      button.setAttribute('aria-label', 'Farbe ' + color + ' wÃ¤hlen');
      button.title = color;
      button.addEventListener('click', function () {
        choosePresetColor(color);
      });
      colorPresetPalette.appendChild(button);
    });
    updateColorPresetSelection();
  }

  function colorDirectionLabel(item) {
    if (!item) return '';
    return i18nLanguage === 'de' ? item.de : item.en;
  }

  var preferredPaletteTokens = [

    '--lb-primary', '--lb-primary-hover', '--lb-primary-dark',
    '--lb-active-bg', '--lb-active-border', '--lb-hover-bg',
    '--lb-btn-primary-bg', '--lb-btn-primary-border', '--lb-btn-hover-bg',
    '--lb-btn-group-active-bg', '--lb-btn-group-active-border', '--lb-btn-group-hover-bg',
    '--lb-slider-active-bg', '--lb-slider-fill-bg', '--lb-range-active-bg',
    '--lb-slider-thumb-bg', '--lb-slider-value-bg', '--lb-slider-value-border',
    '--lb-section-border', '--lb-sidebar-active-bg', '--lb-sidebar-link-hover-bg',
    '--lb-bg', '--lb-content-bg', '--lb-card-bg', '--lb-card-text',
    '--lb-active-text', '--lb-btn-primary-text', '--lb-btn-bg', '--lb-btn-text',
    '--lb-sidebar-bg', '--lb-sidebar-text', '--lb-sidebar-active-text', '--lb-sidebar-link-hover-text', '--lb-text', '--lb-text-secondary', '--lb-text-muted', '--lb-border-color',
    '--lb-border', '--lb-card-border', '--lb-input-bg', '--lb-input-text', '--lb-input-border', '--lb-table-header-bg',
    '--lb-table-header-text', '--lb-table-bg', '--lb-table-border-color', '--lb-slider-active-bg', '--lb-slider-fill-bg', '--lb-range-active-bg', '--lb-slider-bg', '--lb-slider-track-bg', '--lb-range-track-bg', '--lb-slider-thumb-bg', '--lb-slider-thumb-border-color', '--lb-slider-thumb-border-width', '--lb-slider-thumb-border', '--lb-slider-thumb-shadow', '--lb-slider-thumb-hover-shadow', '--lb-slider-focus-shadow', '--lb-slider-compact-active-bg', '--lb-slider-compact-bg', '--lb-slider-compact-thumb-bg', '--lb-slider-compact-thumb-border', '--lb-success', '--lb-warning', '--lb-danger'
  ];

  function uniqueTokenNames(extraNames) {
    var out = [];
    function add(name) {
      name = String(name || '').trim();
      if (/^--lb-[a-z0-9-]+$/i.test(name) && out.indexOf(name) < 0) out.push(name);
    }
    preferredPaletteTokens.forEach(add);
    Object.keys(coreTokens || {}).forEach(add);
    (extraNames || []).forEach(add);
    Object.keys(workingTokens || {}).forEach(add);
    return out;
  }

  function readRuntimeThemeTokens(extraNames) {
    var tokens = {};
    var nodes = [document.documentElement, document.body, document.querySelector('.cfw-page')].filter(Boolean);
    var names = uniqueTokenNames(extraNames);
    nodes.forEach(function (node) {
      var style;
      try { style = window.getComputedStyle(node); } catch (e) { style = null; }
      if (!style) return;
      names.forEach(function (name) {
        var value = String(style.getPropertyValue(name) || '').trim();
        if (value) tokens[name] = value;
      });
    });
    return tokens;
  }

  function hasExplicitPreviewThemeTokens() {
    return Object.keys(workingTokens || {}).some(function (name) {
      return /^--lb-[a-z0-9-]+$/i.test(name) && !isBlockedToken(name);
    });
  }

  function effectivePreviewTokens(extraNames) {
    var tokens = {};

    if (isLiquidGlassWallpaperEditorMode()) {
      Object.assign(tokens, coreTokens || {});
      Object.assign(tokens, liquidGlassPreviewTokens || {});
      Object.assign(tokens, collectTokens() || {});

      var liquidGlassTokens = applyDesignRules(tokens);

      [
        '--lb-sidebar-bg',
        '--lb-sidebar-text',
        '--lb-sidebar-active-bg',
        '--lb-sidebar-active-text',
        '--lb-sidebar-border',
        '--lb-sidebar-section',
        '--lb-sidebar-item-text',
        '--lb-sidebar-link-hover-bg',
        '--lb-sidebar-link-hover-text',
        '--lb-sidebar-hover-bg',
        '--lb-sidebar-hover-text'
      ].forEach(function (name) {
        if (Object.prototype.hasOwnProperty.call(liquidGlassPreviewTokens || {}, name)) {
          liquidGlassTokens[name] = liquidGlassPreviewTokens[name];
        }
      });

      return liquidGlassTokens;
    }

    if (hasExplicitPreviewThemeTokens()) {
      Object.assign(tokens, coreTokens || {});
      Object.assign(tokens, collectTokens() || {});
      return applyDesignRules(tokens);
    }

    Object.assign(tokens, forceNeutralNewTheme ? neutralNewThemeTokens : (coreTokens || {}));
    if (!forceNeutralNewTheme) {
      Object.assign(tokens, readRuntimeThemeTokens(extraNames) || {});
      Object.assign(tokens, coreData.semantic_defaults || {}, coreData.active_theme_tokens || {});
    }
    Object.assign(tokens, collectTokens() || {});
    return applyDesignRules(tokens);
  }

  function isColorLikeValue(value) {
    value = String(value || '').trim();
    return /^(#|rgb\(|rgba\(|hsl\(|hsla\()/i.test(value);
  }

  function paletteRoleLabel(name) {
    name = String(name || '');
    if (/text/.test(name)) return tx('PALETTE_ROLES_TEXT');
    if (/border/.test(name)) return tx('PALETTE_ROLES_BORDER');
    if (/hover/.test(name)) return tx('PALETTE_ROLES_HOVER');
    if (/active/.test(name)) return tx('PALETTE_ROLES_ACTIVE');
    if (/primary/.test(name)) return tx('PALETTE_ROLES_PRIMARY');
    if (/button|btn/.test(name)) return tx('PALETTE_ROLES_BUTTON');
    if (/input|select|textarea/.test(name)) return tx('PALETTE_ROLES_INPUT');
    if (/card|panel|surface/.test(name)) return tx('PALETTE_ROLES_SURFACE');
    if (/bg|background/.test(name)) return tx('PALETTE_ROLES_BACKGROUND');
    if (/table/.test(name)) return tx('PALETTE_ROLES_TABLE');
    if (/sidebar/.test(name)) return tx('PALETTE_ROLES_SIDEBAR');
    if (/slider|range/.test(name)) return tx('PALETTE_ROLES_SLIDER');
    if (/switch|toggle|checkbox|radio/.test(name)) return tx('PALETTE_ROLES_FORM');
    return '';
  }

  function isSemanticPaletteToken(name) {
    var key = String(name || '').toLowerCase();
    return /(^|-)success($|-)|(^|-)warning($|-)|(^|-)error($|-)|(^|-)danger($|-)|(^|-)info($|-)|(^|-)notice($|-)|(^|-)alert($|-)/.test(key);
  }

  function isPreviewPaletteHelperToken(name) {
    var key = String(name || '').toLowerCase();

    return /(^|-)tooltip($|-)|(^|-)badge($|-)|(^|-)tag($|-)|(^|-)label($|-)|(^|-)code($|-)|(^|-)kbd($|-)|(^|-)mono($|-)|(^|-)help($|-)|(^|-)hint($|-)|(^|-)note($|-)|(^|-)message($|-)|(^|-)modal($|-)|(^|-)status($|-)|(^|-)editor($|-)|(^|-)inspector($|-)|(^|-)chip($|-)|(^|-)pill($|-)/.test(key);
  }

  function isPreviewPaletteHelperColor(value) {
    var normalized = normalizeHexColor(value);
    if (!normalized) return false;
    return {
      '#ffffc0': true,
      '#fffec0': true,
      '#fff8c5': true,
      '#fff7bf': true
    }[normalized] === true;
  }

  function isGreenPalettePrimary(value) {
    var hex = normalizeHexColor(value);
    var rgb = hex ? hexToRgb(hex) : null;
    if (!rgb) return false;

    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var delta = max - min;
    if (delta === 0) return false;

    var hue;
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * (((b - r) / delta) + 2);
    else hue = 60 * (((r - g) / delta) + 4);
    if (hue < 0) hue += 360;

    var saturation = max === 0 ? 0 : delta / max;
    return hue >= 70 && hue <= 165 && saturation >= 0.22;
  }

  function previewPaletteExcludedAccentColors(sourceTokens) {

    var excluded = {};
    var primary = resolvedTokenValue(sourceTokens || {}, '--lb-primary');
    if (!isGreenPalettePrimary(primary)) {
      excluded['#4a7a12'] = true;
    }
    return excluded;
  }

  function addPaletteColorSample(out, seen, value, label, excludedColors) {
    if (!isColorLikeValue(value) || isPreviewPaletteHelperColor(value)) return;
    var normalized = normalizeHexColor(value) || String(value).trim().toLowerCase();
    if (!normalized) return;
    if (excludedColors && excludedColors[normalized]) return;
    var role = String(label || '').trim();
    if (seen[normalized]) {
      if (role && seen[normalized].roles.indexOf(role) < 0) seen[normalized].roles.push(role);
      return;
    }
    var sample = { token: '', label: role, roles: role ? [role] : [], color: String(value).trim() };
    seen[normalized] = sample;
    out.push(sample);
  }

  function addPaletteSample(out, seen, sourceTokens, name, label, excludedColors) {
    if (!sourceTokens || !name) return;

    if (isSemanticPaletteToken(name) || isPreviewPaletteHelperToken(name)) return;
    var value = sourceTokens[name];
    var role = label || paletteRoleLabel(name) || name;
    addPaletteColorSample(out, seen, value, role, excludedColors);
  }

  function primarySemanticPaletteSamples(sourceTokens) {
    sourceTokens = sourceTokens || {};
    var primary = resolvedColorToken(sourceTokens, [
      '--lb-primary',
      '--lb-btn-primary-bg',
      '--lb-active-bg',
      '--lb-sidebar-active-bg'
    ], '');
    primary = normalizeHexColor(primary);
    if (!primary) return [];

    var de = i18nLanguage === 'de';
    var primaryHover = resolvedColorToken(sourceTokens, [
      '--lb-primary-hover',
      '--lb-btn-primary-hover-bg'
    ], '');
    var primaryActive = resolvedColorToken(sourceTokens, [
      '--lb-primary-dark',
      '--lb-btn-primary-active-bg'
    ], '');

    var darkPrimary = themeRelativeLuminance(primary) < 0.22;
    if (!primaryHover) {
      primaryHover = blendThemeColor(primary, darkPrimary ? '#ffffff' : '#000000', darkPrimary ? 0.16 : 0.12);
    }
    if (!primaryActive) {
      primaryActive = blendThemeColor(primary, darkPrimary ? '#ffffff' : '#000000', darkPrimary ? 0.28 : 0.24);
    }

    return [
      { label: de ? 'Hauptfarbe' : 'Primary', color: primary },
      { label: 'Hover', color: primaryHover },
      { label: de ? 'Aktiv' : 'Active', color: primaryActive },
      { label: de ? 'Fokus-Akzent' : 'Focus accent', color: blendThemeColor(primary, '#ffffff', 0.16) },
      { label: de ? 'Heller Akzent' : 'Light accent', color: blendThemeColor(primary, '#ffffff', 0.32) },
      { label: de ? 'Weicher Akzent' : 'Soft accent', color: blendThemeColor(primary, '#ffffff', 0.50) },
      { label: de ? 'AkzentflÃ¤che' : 'Accent surface', color: blendThemeColor(primary, '#ffffff', 0.68) },
      { label: de ? 'GetÃ¶nter Hintergrund' : 'Tinted background', color: blendThemeColor(primary, '#ffffff', 0.84) },
      { label: de ? 'GedÃ¤mpfter Akzent' : 'Muted accent', color: blendThemeColor(primary, '#64748b', 0.34) },
      { label: de ? 'KrÃ¤ftiger Rahmen' : 'Strong border', color: blendThemeColor(primary, '#334155', 0.42) },
      { label: de ? 'Dunkler Akzent' : 'Dark accent', color: blendThemeColor(primary, '#000000', 0.36) },
      { label: de ? 'Tiefer Akzent' : 'Deep accent', color: blendThemeColor(primary, '#000000', 0.52) }
    ];
  }

  function themePaletteSamples(group, mappedTokens) {
    var source = effectivePreviewTokens(mappedTokens || []);
    var samples = [];
    var seen = {};
    var excludedAccentColors = previewPaletteExcludedAccentColors(source);

    primarySemanticPaletteSamples(source).forEach(function (sample) {
      addPaletteColorSample(samples, seen, sample.color, sample.label, excludedAccentColors);
    });
    preferredPaletteTokens.forEach(function (name) { addPaletteSample(samples, seen, source, name, '', excludedAccentColors); });
    (mappedTokens || []).forEach(function (name) { addPaletteSample(samples, seen, source, name, '', excludedAccentColors); });
    Object.keys(source || {}).forEach(function (name) {
      if (samples.length < 24) addPaletteSample(samples, seen, source, name, '', excludedAccentColors);
    });

    samples.forEach(function (sample) {
      if (sample.roles && sample.roles.length) sample.label = sample.roles.slice(0, 3).join(' / ');
    });

    if (!samples.length) {
      var fallback = propertyPaletteDefaults[group] || propertyPaletteDefaults.Grundfarbe;
      var fallbackIndex = 0;
      while (samples.length < 24 && fallback.length) {
        var fallbackColor = fallback[fallbackIndex % fallback.length];
        var fallbackKey = normalizeHexColor(fallbackColor) || String(fallbackColor).trim().toLowerCase();
        if (!seen[fallbackKey]) {
          samples.push({
            token: '',
            label: tx('PREVIEW_SAMPLE_COLOR') + ' ' + (samples.length + 1),
            color: fallbackColor
          });
          seen[fallbackKey] = true;
        }
        fallbackIndex += 1;
        if (fallbackIndex > fallback.length * 2) break;
      }
    }
    return samples.slice(0, 24);
  }

  function shadowValueToCss(level, color) {
    level = parseInt(level, 10) || 0;
    if (level <= 0) return 'none';
    var rgb = hexToRgb(color || '#000000');
    return '0 ' + (level * 3) + 'px ' + (level * 10) + 'px rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (0.10 + level * 0.03).toFixed(2) + ')';
  }

  function defaultEntry(dirty) {
    return {
      color: colorPicker.value || '#007aff',

      alpha: 100,
      brightness: 0,
      radius: parseInt(radiusRange.value || '12', 10),
      borderWidth: borderWidthRange ? parseInt(borderWidthRange.value || '1', 10) : 1,
      shadow: 1,
      dirty: !!dirty
    };
  }

  function editorKey(area, element, group) {
    return area + '|' + element + '|' + group;
  }

  function getEntryForKey(key) {
    if (!studioModel[key]) {
      if (undoRestoring) return defaultEntry(false);
      studioModel[key] = defaultEntry(false);
    }
    return studioModel[key];
  }

  function getEntry() {
    return getEntryForKey(currentKey());
  }

  function elementGroups(area, element) {
    return ((areas[area] || {})[element] || {});
  }

  function groupExistsForCurrentElement(group) {
    return !!elementGroups(currentArea(), currentElement())[group];
  }

  function resolveRadiusGroupForCurrentElement() {
    if (groupExistsForCurrentElement('Radius')) return 'Radius';
    var groups = elementGroups(currentArea(), currentElement());
    var names = Object.keys(groups);
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      var mapped = groups[name] || [];
      if (name === 'Radius' || mapped.some(function (token) { return /radius/.test(token); })) return name;
    }
    return '';
  }

  function isBorderWidthGroup(group) {
    var lower = String(group || '').toLowerCase();
    return lower === 'rahmenstÃ¤rke' ||
      lower === 'border width' ||
      lower.indexOf('rahmenstÃ¤rke') >= 0 ||
      lower.indexOf('rahmenstaerke') >= 0 ||
      lower.indexOf('border width') >= 0 ||
      lower.indexOf('border-width') >= 0 ||
      group === '__tableCellLineWidth';
  }

  function hasBorderWidthTokens(tokens) {
    return (tokens || []).some(function (token) { return /border-width/.test(token); });
  }

  function resolveBorderWidthGroupForCurrentElement() {
    var activeGroup = currentGroup();
    if (isBorderWidthGroup(activeGroup) || hasBorderWidthTokens(currentMapping())) return activeGroup;
    if (groupExistsForCurrentElement('RahmenstÃ¤rke')) return 'RahmenstÃ¤rke';
    if (groupExistsForCurrentElement('Border Width')) return 'Border Width';
    var groups = elementGroups(currentArea(), currentElement());
    var names = Object.keys(groups);
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      var mapped = groups[name] || [];
      if (isBorderWidthGroup(name) || mapped.some(function (token) { return /border-width/.test(token); })) return name;
    }
    return '';
  }

  function updateConditionalSettingVisibility() {
    var showBorderWidth = isBorderWidthGroup(currentGroup()) || hasBorderWidthTokens(currentMapping());
    if (borderWidthSetting) borderWidthSetting.hidden = !showBorderWidth;
  }

  function saveControlsToEntry(field) {
    field = field || 'all';

    if (field === 'radius') {
      if (activeDirectToken && tokenEditorKind(activeDirectToken) === 'radius') {
        directTokenOverrides[activeDirectToken] = parseInt(radiusRange.value || '0', 10) + 'px';
        return true;
      }
      var radiusGroup = resolveRadiusGroupForCurrentElement();
      if (!radiusGroup) {
        setStatus(tx('MESSAGES_NO_RADIUS_FOR_ELEMENT'), false, 'info', { modal: 'manual' });
        return false;
      }

      var radiusKey = editorKey(currentArea(), currentElement(), radiusGroup);
      var radiusEntry = getEntryForKey(radiusKey);
      radiusEntry.radius = parseInt(radiusRange.value || '12', 10);
      radiusEntry.dirty = true;

      if (colorGroupSelect && colorGroupSelect.value !== radiusGroup) {
        colorGroupSelect.value = radiusGroup;
        loadEntryToControls(radiusEntry);
      }
      return true;
    }

    if (field === 'borderWidth') {
      if (activeDirectToken && tokenEditorKind(activeDirectToken) === 'borderWidth') {
        directTokenOverrides[activeDirectToken] = parseInt((borderWidthRange && borderWidthRange.value) || '0', 10) + 'px';
        return true;
      }
      var borderWidthGroup = resolveBorderWidthGroupForCurrentElement();
      if (!borderWidthGroup) {
        setStatus(tx('MESSAGES_NO_BORDER_WIDTH_FOR_ELEMENT'), false, 'info', { modal: 'manual' });
        return false;
      }

      var borderWidthKey = editorKey(currentArea(), currentElement(), borderWidthGroup);
      var borderWidthEntry = getEntryForKey(borderWidthKey);
      borderWidthEntry.borderWidth = borderWidthRange ? parseInt(borderWidthRange.value || '1', 10) : 1;
      borderWidthEntry.dirty = true;

      if (colorGroupSelect && colorGroupSelect.value !== borderWidthGroup) {
        colorGroupSelect.value = borderWidthGroup;
        loadEntryToControls(borderWidthEntry);
      }
      return true;
    }

    if (field === 'color') {
      if (activeDirectToken && tokenEditorKind(activeDirectToken) === 'color') {
        directTokenOverrides[activeDirectToken] = colorPicker.value || '#007aff';
        return true;
      }

      var exactColorMapping = currentMapping();
      if (exactColorMapping.length === 1 &&
          /^--lb-[a-z0-9-]+$/.test(exactColorMapping[0]) &&
          !isBlockedToken(exactColorMapping[0]) &&
          tokenEditorKind(exactColorMapping[0]) === 'color') {
        directTokenOverrides[exactColorMapping[0]] = colorPicker.value || '#007aff';
        return true;
      }

      var colorEntry = getEntry();
      colorEntry.color = colorPicker.value || colorEntry.color || '#007aff';
      colorEntry.alpha = 100;
      colorEntry.brightness = 0;
      colorEntry.shadow = 1;
      colorEntry.dirty = true;
      return true;
    }

    studioModel[currentKey()] = defaultEntry(true);
    return true;
  }

  function loadEntryToControls(entryOverride) {
    var entry = entryOverride || getEntry();
    colorPicker.value = entry.color || '#007aff';

    alphaRange.value = 100;
    brightnessRange.value = 0;
    radiusRange.value = entry.radius == null ? 12 : entry.radius;
    if (borderWidthRange) borderWidthRange.value = entry.borderWidth == null ? 1 : entry.borderWidth;
    shadowRange.value = 1;
    updateLabels();
  }

  function isBackgroundWallpaperEditable() {

    return hasActiveEditorSelection && currentArea() === 'Background' && currentElement() === 'System Hintergrund';
  }

  var LIQUID_GLASS_BRIGHTNESS_MIN = wallpaperRange.BRIGHTNESS_MIN;
  var LIQUID_GLASS_BRIGHTNESS_MAX = wallpaperRange.BRIGHTNESS_MAX;
  var LIQUID_GLASS_OPACITY_MIN = wallpaperRange.OPACITY_MIN;
  var LIQUID_GLASS_OPACITY_MAX = wallpaperRange.OPACITY_MAX;

  function sliderPercentToRange(value, min, max) {
    return wallpaperRange.sliderPercentToRange(value, min, max);
  }

  function rangeToSliderPercent(value, min, max) {
    return wallpaperRange.rangeToSliderPercent(value, min, max);
  }

  function configureWallpaperSliderRanges() {
    if (!wallpaperBrightness || !wallpaperOpacity) return;
    var liquidGlass = isLiquidGlassWallpaperEditorMode();

    wallpaperBrightness.min = '0';
    wallpaperBrightness.max = liquidGlass ? '100' : '150';
    wallpaperBrightness.step = '1';
    wallpaperOpacity.min = '0';
    wallpaperOpacity.max = '100';
    wallpaperOpacity.step = '1';
  }

  function syncWallpaperStateFromControls() {
    if (!wallpaperEnabled || !wallpaperImage || !wallpaperBrightness || !wallpaperOpacity) return;
    wallpaperState.enabled = !!wallpaperEnabled.checked;
    wallpaperState.image = String(wallpaperImage.value || '').trim();

    if (isLiquidGlassWallpaperEditorMode()) {
      wallpaperState.brightness = sliderPercentToRange(
        wallpaperBrightness.value,
        LIQUID_GLASS_BRIGHTNESS_MIN,
        LIQUID_GLASS_BRIGHTNESS_MAX
      );
      wallpaperState.opacity = sliderPercentToRange(
        wallpaperOpacity.value,
        LIQUID_GLASS_OPACITY_MIN,
        LIQUID_GLASS_OPACITY_MAX
      );
    } else {
      wallpaperState.brightness = clamp(parseInt(wallpaperBrightness.value || '100', 10), 0, 150);
      wallpaperState.opacity = clamp(parseInt(wallpaperOpacity.value || '100', 10), 0, 100);
    }
  }

  function loadWallpaperStateToControls() {
    if (!wallpaperEnabled || !wallpaperImage || !wallpaperBrightness || !wallpaperOpacity) return;
    configureWallpaperSliderRanges();
    wallpaperEnabled.checked = !!wallpaperState.enabled;
    wallpaperImage.value = wallpaperState.image || '';

    if (isLiquidGlassWallpaperEditorMode()) {
      wallpaperBrightness.value = rangeToSliderPercent(
        wallpaperState.brightness == null ? 100 : wallpaperState.brightness,
        LIQUID_GLASS_BRIGHTNESS_MIN,
        LIQUID_GLASS_BRIGHTNESS_MAX
      );
      wallpaperOpacity.value = rangeToSliderPercent(
        wallpaperState.opacity == null ? 100 : wallpaperState.opacity,
        LIQUID_GLASS_OPACITY_MIN,
        LIQUID_GLASS_OPACITY_MAX
      );
    } else {
      wallpaperBrightness.value = wallpaperState.brightness == null ? 100 : wallpaperState.brightness;
      wallpaperOpacity.value = wallpaperState.opacity == null ? 100 : wallpaperState.opacity;
    }
  }

  function updateWallpaperLabels() {
    if (wallpaperBrightnessValue && wallpaperBrightness) wallpaperBrightnessValue.textContent = wallpaperBrightness.value + '%';
    if (wallpaperOpacityValue && wallpaperOpacity) wallpaperOpacityValue.textContent = wallpaperOpacity.value + '%';
  }

  function updateWallpaperFileName(file) {
    if (!wallpaperFileName) return;
    var fallback = tx('WALLPAPER_NO_FILE');
    wallpaperFileName.textContent = file && file.name ? file.name : fallback;
    wallpaperFileName.title = wallpaperFileName.textContent;
  }

  function clearWallpaperDraft() {

    wallpaperState.enabled = false;
    wallpaperState.image = '';
    if (wallpaperEnabled) wallpaperEnabled.checked = false;
    if (wallpaperImage) wallpaperImage.value = '';
    if (wallpaperFile) wallpaperFile.value = '';
    updateWallpaperFileName(null);
  }

  function updateCssImportFileName(file) {
    if (!cssImportFileName) return;
    var fallback = tx('WALLPAPER_NO_FILE');
    cssImportFileName.textContent = file && file.name ? file.name : fallback;
    cssImportFileName.title = cssImportFileName.textContent;
  }

  function updateWallpaperControlVisibility() {
    if (!wallpaperControls) return;
    var restricted = isWallpaperOnlyTheme();
    var studioPage = document.querySelector('.cfw-page');
    if (studioPage) studioPage.classList.toggle('cfw-wallpaper-only', restricted);
    if (themeName) themeName.disabled = restricted;
    if (themeVersion) themeVersion.disabled = restricted;
    if (restricted) {
      hasActiveEditorSelection = false;
      var inspector = document.querySelector('.cfw-selection-inspector');
      if (inspector) inspector.style.display = 'none';
      wallpaperControls.hidden = false;
      wallpaperControls.setAttribute('aria-hidden', 'false');
      wallpaperControls.classList.add('cfw-wallpaper-context-editable', 'cfw-wallpaper-enabled', 'cfw-wallpaper-has-saved');
      if (wallpaperAdvancedControls) wallpaperAdvancedControls.hidden = false;
      return;
    }

    if (isLiquidGlassWallpaperEditorMode()) {
      wallpaperControls.hidden = false;
      wallpaperControls.setAttribute('aria-hidden', 'false');
      wallpaperControls.classList.add('cfw-wallpaper-has-saved');
      wallpaperControls.classList.add('cfw-wallpaper-context-editable');
      wallpaperControls.classList.add('cfw-wallpaper-enabled');

      if (wallpaperAdvancedControls) {
        wallpaperAdvancedControls.hidden = false;
        wallpaperAdvancedControls.setAttribute('aria-hidden', 'false');
      }

      updateLiquidGlassWallpaperEditorMode();
      return;
    }

    updateLiquidGlassWallpaperEditorMode();

    var editable = isBackgroundWallpaperEditable();
    var enabled = !!(wallpaperEnabled && wallpaperEnabled.checked);
    var hasWallpaper = !!(wallpaperState && wallpaperState.enabled && wallpaperState.image);
    var visible = editable || hasWallpaper || enabled;

    wallpaperControls.hidden = !visible;
    wallpaperControls.setAttribute('aria-hidden', visible ? 'false' : 'true');
    wallpaperControls.classList.toggle('cfw-wallpaper-has-saved', hasWallpaper);
    wallpaperControls.classList.toggle('cfw-wallpaper-context-editable', editable);
    wallpaperControls.classList.toggle('cfw-wallpaper-enabled', enabled && (editable || hasWallpaper));

    if (wallpaperAdvancedControls) {
      var expanded = enabled && (editable || hasWallpaper);
      wallpaperAdvancedControls.hidden = !expanded;
      wallpaperAdvancedControls.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }
  }

  function wallpaperPreviewUrl(image) {
    image = String(image || '').trim();
    if (/^assets\/[a-zA-Z0-9_./-]+$/.test(image) && !image.split('/').includes('..')) return '/admin/system/themes/theme-file.cgi/' + image;
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(image) || /^https?:\/\//i.test(image) || /^\/admin\/system\/themes\/theme-file\.cgi\/(core|user)\//.test(image)) return image;
    return '';
  }

  function normalizeWallpaperImageForPayload(image) { return String(image || '').trim(); }

  function buildWallpaperPayload() {
    syncWallpaperStateFromControls();
    var liquidGlass = isLiquidGlassWallpaperEditorMode();
    var wallpaperEnabledForSave = !!wallpaperState.enabled;
    return {
      enabled: wallpaperEnabledForSave,
      image: wallpaperEnabledForSave ? normalizeWallpaperImageForPayload(wallpaperState.image || '') : '',
      brightness: liquidGlass
        ? clamp(parseFloat(wallpaperState.brightness == null ? 100 : wallpaperState.brightness), LIQUID_GLASS_BRIGHTNESS_MIN, LIQUID_GLASS_BRIGHTNESS_MAX)
        : clamp(parseInt(wallpaperState.brightness == null ? 100 : wallpaperState.brightness, 10), 0, 150),
      opacity: liquidGlass
        ? clamp(parseFloat(wallpaperState.opacity == null ? 100 : wallpaperState.opacity), LIQUID_GLASS_OPACITY_MIN, LIQUID_GLASS_OPACITY_MAX)
        : clamp(parseInt(wallpaperState.opacity == null ? 100 : wallpaperState.opacity, 10), 0, 100)
    };
  }

  function liquidGlassWallpaperDimToken(name, fallback) {
    var raw = liquidGlassPreviewTokens && liquidGlassPreviewTokens[name];
    var parsed = parseFloat(raw);
    return isFinite(parsed) ? clamp(parsed, 0, 1) : fallback;
  }

  function renderWallpaperLayer(layer, wallpaper, options) {
    if (!layer) return;

    options = options || {};
    var visible = !!options.visible;
    var liquidGlass = !!options.liquidGlass;

    layer.hidden = !visible;
    layer.setAttribute('aria-hidden', visible ? 'false' : 'true');

    if (!visible) {
      [
        '--cfw-wallpaper-image',
        '--cfw-wallpaper-brightness',
        '--cfw-wallpaper-opacity',
        '--cfw-liquid-wallpaper-dim-primary',
        '--cfw-liquid-wallpaper-dim-secondary'
      ].forEach(function (name) { layer.style.removeProperty(name); });
      layer.classList.remove('cfw-wallpaper-render-liquid-glass');
      layer.classList.remove('cfw-wallpaper-render-plain');
      return;
    }

    var image = 'url("' + wallpaperPreviewUrl(wallpaper.image).replace(/"/g, '%22') + '")';
    layer.style.setProperty('--cfw-wallpaper-image', image);
    layer.style.setProperty('--cfw-wallpaper-brightness', String(wallpaper.brightness / 100));
    layer.style.setProperty('--cfw-wallpaper-opacity', String(wallpaper.opacity / 100));
    layer.classList.toggle('cfw-wallpaper-render-liquid-glass', liquidGlass);
    layer.classList.toggle('cfw-wallpaper-render-plain', !liquidGlass);

    if (liquidGlass) {
      layer.style.setProperty(
        '--cfw-liquid-wallpaper-dim-primary',
        String(liquidGlassWallpaperDimToken('--lb-liquid-wallpaper-dim-primary', 0.68))
      );
      layer.style.setProperty(
        '--cfw-liquid-wallpaper-dim-secondary',
        String(liquidGlassWallpaperDimToken('--lb-liquid-wallpaper-dim-secondary', 0.58))
      );
    } else {
      layer.style.removeProperty('--cfw-liquid-wallpaper-dim-primary');
      layer.style.removeProperty('--cfw-liquid-wallpaper-dim-secondary');
    }
  }

  function applyWallpaperPreview() {
    if (!previewRoot) return;

    var wallpaper = buildWallpaperPayload();
    var hasWallpaper = !!(wallpaper.enabled && wallpaper.image);
    var liquidGlass = isLiquidGlassWallpaperEditorMode();

    renderWallpaperLayer(liquidGlassStudioWallpaper, wallpaper, {
      visible: liquidGlass && hasWallpaper,
      liquidGlass: true
    });
    renderWallpaperLayer(liquidGlassWallpaperPreview, wallpaper, {
      visible: false,
      liquidGlass: true
    });

    previewRoot.classList.toggle('cfw-wallpaper-enabled', !liquidGlass && hasWallpaper);

    if (!liquidGlass && hasWallpaper) {
      previewRoot.style.setProperty('--cfw-wallpaper-image', 'url("' + wallpaperPreviewUrl(wallpaper.image).replace(/"/g, '%22') + '")');
      previewRoot.style.setProperty('--cfw-wallpaper-opacity', String(wallpaper.opacity / 100));
      previewRoot.style.setProperty('--cfw-wallpaper-brightness', String(wallpaper.brightness / 100));
      previewRoot.style.setProperty('--cfw-wallpaper-size', 'cover');
      previewRoot.style.setProperty('--cfw-wallpaper-repeat', 'no-repeat');
      previewRoot.style.setProperty('--cfw-wallpaper-position', 'center center');
    } else {
      previewRoot.style.removeProperty('--cfw-wallpaper-image');
      previewRoot.style.removeProperty('--cfw-wallpaper-opacity');
      previewRoot.style.removeProperty('--cfw-wallpaper-brightness');
      previewRoot.style.removeProperty('--cfw-wallpaper-size');
      previewRoot.style.removeProperty('--cfw-wallpaper-repeat');
      previewRoot.style.removeProperty('--cfw-wallpaper-position');
    }
  }

  function wallpaperNumber(value, fallback, min, max) {
    var parsed = parseInt(value, 10);
    if (!isFinite(parsed)) parsed = fallback;
    return clamp(parsed, min, max);
  }

  function setWallpaperFromTheme(theme) {
    var wallpaper = theme && typeof theme === 'object' && theme.wallpaper && typeof theme.wallpaper === 'object' ? theme.wallpaper : null;

    var brightness = wallpaper && wallpaper.brightness != null
      ? wallpaper.brightness
      : (wallpaper && wallpaper.wallpaper_brightness != null ? wallpaper.wallpaper_brightness : 100);
    var opacity = wallpaper && wallpaper.opacity != null
      ? wallpaper.opacity
      : (wallpaper && wallpaper.transparency != null
          ? wallpaper.transparency
          : (wallpaper && wallpaper.wallpaper_opacity != null ? wallpaper.wallpaper_opacity : 100));

    var liquidGlass = isLiquidGlassWallpaperEditorMode();
    wallpaperState = {
      enabled: !!(wallpaper && wallpaper.enabled),
      image: wallpaper && wallpaper.image ? String(wallpaper.image) : '',
      brightness: wallpaperNumber(
        brightness,
        100,
        liquidGlass ? LIQUID_GLASS_BRIGHTNESS_MIN : 0,
        liquidGlass ? LIQUID_GLASS_BRIGHTNESS_MAX : 150
      ),
      opacity: wallpaperNumber(
        opacity,
        100,
        liquidGlass ? LIQUID_GLASS_OPACITY_MIN : 0,
        liquidGlass ? LIQUID_GLASS_OPACITY_MAX : 100
      )
    };

    loadWallpaperStateToControls();
    updateWallpaperLabels();
    updateWallpaperControlVisibility();
    applyWallpaperPreview();
  }

  function reapplyLoadedWallpaperState() {

    loadWallpaperStateToControls();
    updateWallpaperLabels();
    updateWallpaperControlVisibility();
    applyWallpaperPreview();
  }

  function updateLabels() {
    alphaValue.textContent = alphaRange.value + '%';
    brightnessValue.textContent = brightnessRange.value;
    radiusValue.textContent = radiusRange.value + 'px';
    if (borderWidthValue && borderWidthRange) borderWidthValue.textContent = borderWidthRange.value + 'px';
    shadowValue.textContent = shadowRange.value;
    updateConditionalSettingVisibility();
    updateWallpaperLabels();
    updateWallpaperControlVisibility();
    updateColorPresetSelection();
  }

  var undoStack = [];
  var redoStack = [];
  var undoLimit = 20;
  var undoRestoring = false;
  var undoArmedControl = null;
  var undoArmedSnapshot = null;

  function cloneStudioObject(value) {
    try { return JSON.parse(JSON.stringify(value == null ? null : value)); } catch (e) { return value; }
  }

  function currentControlSnapshot() {
    return {
      color: colorPicker ? (colorPicker.value || '#007aff') : '#007aff',
      alpha: 100,
      brightness: 0,
      radius: radiusRange ? parseInt(radiusRange.value || '12', 10) : 12,
      borderWidth: borderWidthRange ? parseInt(borderWidthRange.value || '1', 10) : 1,
      shadow: 1,
      dirty: false
    };
  }

  function makeUndoSnapshot(label) {
    return {
      label: label || '',
      selection: { area: currentArea(), element: currentElement(), group: currentGroup() },
      controls: currentControlSnapshot(),
      studioModel: cloneStudioObject(studioModel || {}),
      workingTokens: cloneStudioObject(workingTokens || {}),
      directTokenOverrides: cloneStudioObject(directTokenOverrides || {}),
      importedCss: importedCss || '',
      customCssValue: customCss ? (customCss.value || '') : '',
      lastImportMeta: cloneStudioObject(lastImportMeta || null),
      wallpaperState: cloneStudioObject(wallpaperState || { enabled: false, image: '', brightness: 100, opacity: 100 }),
      themeIdValue: themeId ? (themeId.value || '') : '',
      themeNameValue: themeName ? (themeName.value || '') : '',
      themeVersionValue: themeVersion ? (themeVersion.value || '') : ''
    };
  }

  function snapshotSignature(snapshot) {
    if (!snapshot) return '';
    var comparable = cloneStudioObject(snapshot);

    delete comparable.selection;
    delete comparable.controls;
    return JSON.stringify(comparable);
  }

  function currentThemeSignature() {
    return snapshotSignature(makeUndoSnapshot('dirty-check'));
  }

  function setDirtyIndicator(isDirty) {
    themeDirty = !!isDirty;
    if (themeDirtyIndicator) {
      themeDirtyIndicator.hidden = !themeDirty;
      themeDirtyIndicator.setAttribute('aria-hidden', themeDirty ? 'false' : 'true');
      themeDirtyIndicator.textContent = tx('MESSAGES_UNSAVED_CHANGES');
    }
    var saveButton = document.getElementById('saveTheme');
    if (saveButton) saveButton.classList.toggle('is-dirty', themeDirty);
  }

  function updateDirtyState() {
    if ((!undoStack.length && !redoStack.length) || !savedThemeSignature) {
      setDirtyIndicator(false);
      return false;
    }
    var dirty = currentThemeSignature() !== savedThemeSignature;
    setDirtyIndicator(dirty);
    return dirty;
  }

  function markCurrentStateAsSaved() {
    savedThemeSnapshot = makeUndoSnapshot('saved-baseline');
    savedThemeSignature = snapshotSignature(savedThemeSnapshot);
    setDirtyIndicator(false);
  }

  function hasPendingStudioEdits() {
    if (!undoStack.length && !redoStack.length) {
      setDirtyIndicator(false);
      return false;
    }
    return updateDirtyState();
  }

  function closeUnsavedChangesModal() {
    if (unsavedModal) unsavedModal.hidden = true;
    pendingThemeSelection = null;
  }

  function requestThemeSelection(value) {
    if (!hasPendingStudioEdits()) {
      applyThemeSelection(value);
      return;
    }
    pendingThemeSelection = value;
    if (unsavedModal) unsavedModal.hidden = false;
  }

  function applyThemeSelection(requestedValue) {
    var requestedTheme = requestedValue !== '' && requestedValue != null ? userThemes[Number(requestedValue)] : null;
    if (requestedTheme && requestedTheme.type === 'core') {
      if (userThemeSelect) userThemeSelect.value = userThemeSelect.getAttribute('data-current-selection') || '';
      setStatus(tx('REGISTRY_PROTECTED', { theme: requestedTheme.name || requestedTheme.id }), true);
      return;
    }

    if (userThemeSelect) userThemeSelect.value = requestedValue == null ? '' : String(requestedValue);
    updateDeleteThemeButton();
    if (requestedValue === '') {
      resetToNeutralNewTheme();
      return;
    }
    loadUserThemeByIndex(requestedValue);
    window.setTimeout(function () {
      refreshEmbeddedFrame('preview');
      refreshEmbeddedFrame('documentation');
    }, 120);
  }

  function updateHistoryButtons() {
    var historyStarted = undoStack.length > 0 || redoStack.length > 0;
    if (undoThemeButton) {
      undoThemeButton.hidden = !historyStarted;
      undoThemeButton.setAttribute('aria-hidden', historyStarted ? 'false' : 'true');
      undoThemeButton.disabled = undoStack.length === 0;
      undoThemeButton.title = undoStack.length ? tx('UNDO_AVAILABLE_TITLE') : tx('UNDO_EMPTY_TITLE');
    }
    if (redoThemeButton) {
      redoThemeButton.hidden = !historyStarted;
      redoThemeButton.setAttribute('aria-hidden', historyStarted ? 'false' : 'true');
      redoThemeButton.disabled = redoStack.length === 0;
      redoThemeButton.title = redoStack.length ? tx('REDO_AVAILABLE_TITLE') : tx('REDO_EMPTY_TITLE');
    }
    updateDirtyState();
  }

  function resetHistory() {
    undoStack = [];
    redoStack = [];
    undoArmedControl = null;
    undoArmedSnapshot = null;
    updateHistoryButtons();
  }

  function pushHistorySnapshot(stack, snapshot) {
    if (!snapshot) return;
    stack.push(snapshot);
    if (stack.length > undoLimit) stack.shift();
  }

  function pushUndoSnapshot(label, preparedSnapshot) {
    if (undoRestoring) return;
    var snapshot = preparedSnapshot || makeUndoSnapshot(label);
    snapshot.label = label || snapshot.label || '';
    var previous = undoStack.length ? undoStack[undoStack.length - 1] : null;
    if (previous && snapshotSignature(previous) === snapshotSignature(snapshot)) return;
    pushHistorySnapshot(undoStack, snapshot);
    redoStack = [];
    updateHistoryButtons();
  }

  function restoreUndoSnapshot(snapshot, messageKey) {
    if (!snapshot) return;
    undoRestoring = true;
    studioModel = cloneStudioObject(snapshot.studioModel || {});
    workingTokens = cloneStudioObject(snapshot.workingTokens || {});
    directTokenOverrides = cloneStudioObject(snapshot.directTokenOverrides || {});
    activeDirectToken = '';
    importedCss = snapshot.importedCss || '';
    lastImportMeta = cloneStudioObject(snapshot.lastImportMeta || null);
    wallpaperState = cloneStudioObject(snapshot.wallpaperState || { enabled: false, image: '', brightness: 100, opacity: 100 });

    if (themeId) themeId.value = snapshot.themeIdValue || '';
    if (themeName) themeName.value = snapshot.themeNameValue || '';
    if (themeVersion) themeVersion.value = snapshot.themeVersionValue || '';
    if (customCss) customCss.value = snapshot.customCssValue || importedCss || '';

    if (snapshot.selection && areas[snapshot.selection.area]) {
      areaSelect.value = snapshot.selection.area;
      renderElements();
      if ((areas[snapshot.selection.area] || {})[snapshot.selection.element]) {
        elementSelect.value = snapshot.selection.element;
        renderColorGroups();
      }
      if ((((areas[snapshot.selection.area] || {})[snapshot.selection.element] || {})[snapshot.selection.group])) {
        colorGroupSelect.value = snapshot.selection.group;
      }
    }

    loadEntryToControls(snapshot.controls || null);
    loadWallpaperStateToControls();
    updateWallpaperLabels();
    updateWallpaperControlVisibility();
    renderPropertyInspector();
    refreshPreviewAndPalette();
    undoRestoring = false;
    updateHistoryButtons();
    setStatus(tx(messageKey || 'MESSAGES_UNDO_DONE'), false);
  }

  function undoLastChange() {
    if (!undoStack.length) return;
    var target = undoStack.pop();
    pushHistorySnapshot(redoStack, makeUndoSnapshot('redo'));

    if (!undoStack.length && savedThemeSnapshot) {
      target = cloneStudioObject(savedThemeSnapshot);
    }

    restoreUndoSnapshot(target, 'MESSAGES_UNDO_DONE');
  }

  function redoLastChange() {
    if (!redoStack.length) return;
    var target = redoStack.pop();
    pushHistorySnapshot(undoStack, makeUndoSnapshot('undo'));
    restoreUndoSnapshot(target, 'MESSAGES_REDO_DONE');
  }

  function armUndoForControl(control) {
    if (!control || undoRestoring) return;
    if (undoArmedControl === control) return;
    undoArmedControl = control;
    undoArmedSnapshot = makeUndoSnapshot('control');
  }

  function commitUndoForControl(control) {
    if (undoArmedControl !== control || !undoArmedSnapshot) return;
    var before = undoArmedSnapshot;
    var after = makeUndoSnapshot('control-current');
    if (snapshotSignature(before) !== snapshotSignature(after)) {
      pushUndoSnapshot('control', before);

      undoArmedSnapshot = before;
    }
  }

  function disarmUndoForControl(control) {
    if (undoArmedControl === control) {
      undoArmedControl = null;
      undoArmedSnapshot = null;
    }
  }

  function bindUndoControl(control) {
    if (!control) return;
    ['pointerdown', 'focus', 'keydown'].forEach(function (eventName) {
      control.addEventListener(eventName, function () { armUndoForControl(control); });
    });
    ['input', 'change'].forEach(function (eventName) {
      control.addEventListener(eventName, function () { commitUndoForControl(control); });
    });
    ['pointerup', 'change', 'blur'].forEach(function (eventName) {
      control.addEventListener(eventName, function () { disarmUndoForControl(control); });
    });
  }

  var componentRegistry = {};

  function registerComponent(definition) {
    if (!definition || !definition.id) return;
    componentRegistry[definition.id] = definition;
  }

  function buildComponentRegistry() {
    Object.keys(areas).forEach(function (area) {
      Object.keys(areas[area] || {}).forEach(function (variant) {
        Object.keys((areas[area] || {})[variant] || {}).forEach(function (property) {
          registerComponent({
            id: [area, variant, property].join('::'),
            area: area,
            variant: variant,
            property: property,
            tokens: ((areas[area] || {})[variant] || {})[property] || []
          });
        });
      });
    });
  }

  function registryLookup(area, variant, property) {
    return componentRegistry[[area, variant, property].join('::')]
      || componentRegistry[[area, variant, 'Grundfarbe'].join('::')]
      || null;
  }

  function renderAreas() {
    areaSelect.innerHTML = '';
    Object.keys(areas).forEach(function (name) { areaSelect.appendChild(makeOption(name, displayAreaName(name))); });
  }

  function primaryToken(tokens) {
    tokens = tokens || [];
    return tokens.length ? tokens[0] : '';
  }

  function propertyTokenExpansionKey(areaName, variantName, prop) {
    return [areaName || '', variantName || '', prop || ''].join('::');
  }

  function propertyIcon(name) {
    var lower = String(name || '').toLowerCase();
    if (lower.indexOf('text') >= 0 || lower.indexOf('schrift') >= 0) return 'Aa';
    if (lower.indexOf('rahmen') >= 0 || lower.indexOf('border') >= 0 || lower.indexOf('cellline') >= 0 || lower.indexOf('zell') >= 0) return '\u25a2';
    if (lower.indexOf('hover') >= 0) return '\u2728';
    if (lower.indexOf('active') >= 0 || lower.indexOf('focus') >= 0) return '\u25ce';
    if (lower.indexOf('disabled') >= 0) return '\ud83d\udeab';
    if (lower.indexOf('radius') >= 0) return '\u25ef';
    if (lower.indexOf('schatten') >= 0 || lower.indexOf('shadow') >= 0) return '\ud83c\udf11';
    return '\ud83c\udfa8';
  }

  function renderElements() {
    var areaName = currentArea();
    var area = areas[areaName] || {};
    elementSelect.innerHTML = '';
    Object.keys(area).forEach(function (name) {
      var tokens = tokensForVariant(areaName, name);
      elementSelect.appendChild(makeOption(name, displayElementName(name), tokens.join('\n')));
    });
    renderColorGroups();
  }

  function renderColorGroups() {
    var element = (areas[currentArea()] || {})[currentElement()] || {};
    colorGroupSelect.innerHTML = '';
    Object.keys(element).forEach(function (name) {
      var tokens = element[name] || [];
      var first = primaryToken(tokens);
      colorGroupSelect.appendChild(makeOption(name, first ? (displayGroupName(name) + ' (' + first + ')') : displayGroupName(name), tokens.join('\n')));
    });
    loadEntryToControls();
    updateWallpaperControlVisibility();
    renderPropertyInspector();
    updateAll();
  }

  function tokenPropertyForVariant(areaName, variantName, token) {
    var variant = (areas[areaName] || {})[variantName] || {};
    var names = Object.keys(variant);
    for (var i = 0; i < names.length; i += 1) {
      if ((variant[names[i]] || []).indexOf(token) >= 0) return names[i];
    }
    return '';
  }

  function affectedTokenRoleLabel(token, property) {

    var de = i18nLanguage === 'de';
    var lower = String(token || '').toLowerCase();
    var state = '';
    var role = '';
    if (/(?:-on|-active)(?:-|$)/.test(lower)) state = de ? 'Aktiv' : 'Active';
    else if (/(?:-off|-inactive)(?:-|$)/.test(lower)) state = de ? 'Inaktiv' : 'Inactive';
    else if (/-hover(?:-|$)/.test(lower)) state = 'Hover';
    else if (/-focus(?:-|$)/.test(lower)) state = de ? 'Fokus' : 'Focus';
    else if (/(?:-thumb|-knob)(?:-|$)/.test(lower)) state = de ? 'Knopf' : 'Thumb';
    else if (/-placeholder(?:-|$)/.test(lower)) state = 'Placeholder';

    if (/border-width/.test(lower)) role = de ? 'RahmenstÃ¤rke' : 'Border width';
    else if (/-text(?:-|$)/.test(lower) || /-color$/.test(lower)) role = de ? 'Textfarbe' : 'Text color';
    else if (/-bg(?:-|$)/.test(lower) || /background/.test(lower)) role = de ? 'Hintergrund' : 'Background';
    else if (/-border(?:-|$)/.test(lower)) role = de ? 'Rahmen' : 'Border';
    else if (/-radius(?:-|$)/.test(lower)) role = 'Radius';
    else if (/-shadow(?:-|$)/.test(lower)) role = de ? 'Schatten' : 'Shadow';

    var propertyLabel = displayGroupName(property || '');
    var normalizedProperty = String(propertyLabel || '').toLowerCase().replace(/[^a-z0-9Ã¤Ã¶Ã¼ÃŸ]+/g, '');
    var normalizedRole = String(role || '').toLowerCase().replace(/[^a-z0-9Ã¤Ã¶Ã¼ÃŸ]+/g, '');
    var genericProperties = de
      ? ['grundfarbe', 'textfarbe', 'rahmen', 'radius', 'rahmenstÃ¤rke', 'schatten']
      : ['basecolor', 'textcolor', 'border', 'radius', 'borderwidth', 'shadow'];
    var propertyAddsMeaning = propertyLabel &&
      normalizedProperty !== normalizedRole &&
      genericProperties.indexOf(normalizedProperty) < 0;

    var compact = [state, role].filter(Boolean).join(' \u00b7 ');
    if (propertyAddsMeaning) compact = [propertyLabel, compact].filter(Boolean).join(' \u00b7 ');
    return compact || propertyLabel || token;
  }

  function affectedTokenSemanticDescription(token, property) {
    var de = i18nLanguage === 'de';
    var lower = String(token || '').toLowerCase();

    var subject = '';
    var subjects = [
      [/--lb-btn-group-/, de ? 'Button-Gruppen' : 'button groups'],
      [/--lb-btn-primary-/, de ? 'PrimÃ¤rschaltflÃ¤chen' : 'primary buttons'],
      [/--lb-header-btn-/, de ? 'Kopfzeilen-SchaltflÃ¤chen' : 'header buttons'],
      [/--lb-btn-/, de ? 'SchaltflÃ¤chen' : 'buttons'],
      [/--lb-multiselect-/, de ? 'Mehrfachauswahlen' : 'multi-select controls'],
      [/--lb-select-/, de ? 'Auswahllisten' : 'select controls'],
      [/--lb-dropdown-/, de ? 'Dropdown-MenÃ¼s' : 'dropdown menus'],
      [/--lb-input-/, de ? 'Eingabefelder' : 'input fields'],
      [/--lb-textarea-/, de ? 'Textbereiche' : 'text areas'],
      [/--lb-checkbox-/, de ? 'Checkboxen' : 'checkboxes'],
      [/--lb-radio-/, de ? 'Optionsfelder' : 'radio buttons'],
      [/--lb-(?:switch|toggle)-/, de ? 'Schalter' : 'toggles'],
      [/--lb-(?:slider|range)-/, de ? 'Slider' : 'sliders'],
      [/--lb-table-/, de ? 'Tabellen' : 'tables'],
      [/--lb-card-/, de ? 'Karten' : 'cards'],
      [/--lb-sidebar-/, de ? 'Sidebar-Elemente' : 'sidebar elements'],
      [/--lb-tooltip-/, de ? 'Tooltips' : 'tooltips'],
      [/--lb-tab-/, de ? 'Tabs' : 'tabs']
    ];
    for (var i = 0; i < subjects.length; i += 1) {
      if (subjects[i][0].test(lower)) { subject = subjects[i][1]; break; }
    }
    if (!subject) subject = de ? 'Elemente' : 'elements';

    var state = '';
    if (/-active-hover(?:-|$)/.test(lower)) state = de ? 'aktiver ' : 'active ';
    else if (/-hover(?:-|$)/.test(lower)) state = de ? 'beim DarÃ¼berfahren Ã¼ber ' : 'when hovering over ';
    else if (/-focus(?:-|$)/.test(lower)) state = de ? 'fokussierter ' : 'focused ';
    else if (/-disabled(?:-|$)/.test(lower)) state = de ? 'deaktivierter ' : 'disabled ';
    else if (/(?:-on|-active)(?:-|$)/.test(lower)) state = de ? 'aktiver ' : 'active ';
    else if (/(?:-off|-inactive)(?:-|$)/.test(lower)) state = de ? 'inaktiver ' : 'inactive ';
    else if (/-placeholder(?:-|$)/.test(lower)) state = de ? 'Platzhalter in ' : 'placeholders in ';

    var role = '';
    if (/border-width/.test(lower)) role = de ? 'RahmenstÃ¤rke' : 'Border width';
    else if (/-text(?:-|$)/.test(lower) || /-color$/.test(lower)) role = de ? 'Textfarbe' : 'Text color';
    else if (/-bg(?:-|$)/.test(lower) || /background/.test(lower)) role = de ? 'Hintergrundfarbe' : 'Background color';
    else if (/-border(?:-|$)/.test(lower)) role = de ? 'Rahmenfarbe' : 'Border color';
    else if (/-radius(?:-|$)/.test(lower)) role = de ? 'Eckenradius' : 'Corner radius';
    else if (/-shadow(?:-|$)/.test(lower)) role = de ? 'Schatten' : 'Shadow';
    else if (/(?:-thumb|-knob)(?:-|$)/.test(lower)) role = de ? 'Farbe des Schalterknopfs' : 'Toggle thumb color';

    if (!role) {
      var propertyLabel = displayGroupName(property || '');
      role = propertyLabel || (de ? 'Darstellung' : 'Appearance');
    }

    if (de) {
      if (state.indexOf('beim ') === 0 || state.indexOf('Platzhalter') === 0) return role + ' ' + state + subject;
      return role + ' ' + state + subject;
    }
    if (state.indexOf('when ') === 0 || state.indexOf('placeholders') === 0) return role + ' ' + state + subject;
    return role + ' of ' + state + subject;
  }

  function affectedTokenTooltipData(token, property) {
    var value = affectedTokenValue(token);
    return {
      description: affectedTokenSemanticDescription(token, property),
      token: String(token || ''),
      value: String(value || '')
    };
  }

  function affectedTokenTooltipAttributes(token, property) {
    var data = affectedTokenTooltipData(token, property);
    return ' data-cfw-token-tooltip="1"' +
      ' data-cfw-tooltip-description="' + escapeHtml(data.description) + '"' +
      ' data-cfw-tooltip-token="' + escapeHtml(data.token) + '"' +
      ' data-cfw-tooltip-value="' + escapeHtml(data.value) + '"';
  }

  var cfwTokenTooltip = null;
  var cfwTokenTooltipAnchor = null;

  function tokenTooltipThemeValue(tokens, names, fallback) {
    for (var i = 0; i < names.length; i += 1) {
      var value = resolvedTokenValue(tokens, names[i], 0);
      if (value != null && String(value).trim()) return String(value).trim();
    }
    return fallback;
  }

  function ensureTokenTooltip() {
    if (cfwTokenTooltip && document.documentElement.contains(cfwTokenTooltip)) return cfwTokenTooltip;
    cfwTokenTooltip = document.createElement('div');
    cfwTokenTooltip.className = 'cfw-token-tooltip';
    cfwTokenTooltip.setAttribute('role', 'tooltip');
    cfwTokenTooltip.setAttribute('aria-hidden', 'true');
    cfwTokenTooltip.innerHTML =
      '<div class="cfw-token-tooltip-description"></div>' +
      '<code class="cfw-token-tooltip-name"></code>' +
      '<div class="cfw-token-tooltip-value-row">' +
        '<span class="cfw-token-tooltip-swatch" aria-hidden="true"></span>' +
        '<code class="cfw-token-tooltip-value"></code>' +
      '</div>';
    document.body.appendChild(cfwTokenTooltip);
    return cfwTokenTooltip;
  }

  function tokenTooltipResolvedHexColor(value) {
    value = String(value || '').trim();
    var direct = normalizeHexColor(value);
    if (direct) return direct;

    var probe = document.createElement('span');
    probe.style.cssText = 'position:fixed;left:-10000px;top:-10000px;visibility:hidden;pointer-events:none;color:' + value + ';';
    document.body.appendChild(probe);
    var computed = window.getComputedStyle(probe).color || '';
    probe.remove();

    var match = computed.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)/i);
    if (!match) return null;
    function channelToHex(channel) {
      var number = Math.max(0, Math.min(255, Math.round(Number(channel) || 0)));
      return number.toString(16).padStart(2, '0');
    }
    return '#' + channelToHex(match[1]) + channelToHex(match[2]) + channelToHex(match[3]);
  }

  function applyTokenTooltipTheme(tooltip, value) {
    var tokens = effectivePreviewTokens();
    var bg = tokenTooltipThemeValue(tokens,
      ['--lb-tooltip-bg', '--lb-card-bg', '--lb-bg-elevated', '--lb-bg'], '#172033');

    var resolvedBg = tokenTooltipResolvedHexColor(bg) || '#172033';
    var text = readableTextFor(resolvedBg, '#ffffff', '#111827');
    var muted = text === '#ffffff' ? '#e2e8f0' : '#374151';
    var border = tokenTooltipThemeValue(tokens,
      ['--lb-tooltip-border', '--lb-card-border', '--lb-border-color', '--lb-border'], 'rgba(0,0,0,.22)');
    var radius = tokenTooltipThemeValue(tokens,
      ['--lb-tooltip-radius', '--lb-radius-sm', '--lb-radius'], '10px');
    var shadow = tokenTooltipThemeValue(tokens,
      ['--lb-tooltip-shadow', '--lb-card-shadow'], '0 10px 30px rgba(0,0,0,.22)');

    tooltip.style.setProperty('--cfw-token-tooltip-bg', bg);
    tooltip.style.setProperty('--cfw-token-tooltip-text', text);
    tooltip.style.setProperty('--cfw-token-tooltip-muted', muted);
    tooltip.style.setProperty('--cfw-token-tooltip-border', border);
    tooltip.style.setProperty('--cfw-token-tooltip-radius', radius);
    tooltip.style.setProperty('--cfw-token-tooltip-shadow', shadow);

    var color = normalizeHexColor(value);
    tooltip.classList.toggle('has-color-value', !!color);
    tooltip.style.setProperty('--cfw-token-tooltip-swatch', color || 'transparent');
  }

  function positionTokenTooltip(anchor, tooltip) {
    var rect = anchor.getBoundingClientRect();
    var gap = 10;
    var viewportGap = 8;
    var box = tooltip.getBoundingClientRect();
    var left = rect.left + (rect.width / 2) - (box.width / 2);
    left = Math.max(viewportGap, Math.min(left, window.innerWidth - box.width - viewportGap));
    var top = rect.top - box.height - gap;
    var below = false;
    if (top < viewportGap) {
      top = rect.bottom + gap;
      below = true;
    }
    tooltip.style.left = Math.round(left) + 'px';
    tooltip.style.top = Math.round(top) + 'px';
    tooltip.classList.toggle('is-below', below);
  }

  function showTokenTooltip(anchor) {
    if (!anchor || !anchor.getAttribute) return;
    anchor.removeAttribute('title');
    var propertyItem = anchor.closest && anchor.closest('.cfw-property-item');
    if (propertyItem) propertyItem.removeAttribute('title');
    var tooltip = ensureTokenTooltip();
    var description = anchor.getAttribute('data-cfw-tooltip-description') || '';
    var token = anchor.getAttribute('data-cfw-tooltip-token') || '';
    var value = anchor.getAttribute('data-cfw-tooltip-value') || '';
    tooltip.querySelector('.cfw-token-tooltip-description').textContent = description;
    tooltip.querySelector('.cfw-token-tooltip-name').textContent = token;
    tooltip.querySelector('.cfw-token-tooltip-value').textContent = value;
    tooltip.querySelector('.cfw-token-tooltip-value-row').hidden = !value;
    applyTokenTooltipTheme(tooltip, value);
    cfwTokenTooltipAnchor = anchor;
    tooltip.classList.add('is-visible');
    tooltip.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () {
      if (cfwTokenTooltipAnchor === anchor) positionTokenTooltip(anchor, tooltip);
    });
  }

  function hideTokenTooltip(anchor) {
    if (!cfwTokenTooltip || (anchor && cfwTokenTooltipAnchor !== anchor)) return;
    cfwTokenTooltipAnchor = null;
    cfwTokenTooltip.classList.remove('is-visible');
    cfwTokenTooltip.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('mouseover', function (event) {
    var anchor = event.target.closest && event.target.closest('[data-cfw-token-tooltip="1"]');
    if (anchor) showTokenTooltip(anchor);
  });
  document.addEventListener('mouseout', function (event) {
    var anchor = event.target.closest && event.target.closest('[data-cfw-token-tooltip="1"]');
    if (anchor && (!event.relatedTarget || !anchor.contains(event.relatedTarget))) hideTokenTooltip(anchor);
  });
  document.addEventListener('focusin', function (event) {
    var anchor = event.target.closest && event.target.closest('[data-cfw-token-tooltip="1"]');
    if (anchor) showTokenTooltip(anchor);
  });
  document.addEventListener('focusout', function (event) {
    var anchor = event.target.closest && event.target.closest('[data-cfw-token-tooltip="1"]');
    if (anchor) hideTokenTooltip(anchor);
  });
  window.addEventListener('scroll', function () {
    if (cfwTokenTooltipAnchor && cfwTokenTooltip) positionTokenTooltip(cfwTokenTooltipAnchor, cfwTokenTooltip);
  }, true);
  window.addEventListener('resize', function () {
    if (cfwTokenTooltipAnchor && cfwTokenTooltip) positionTokenTooltip(cfwTokenTooltipAnchor, cfwTokenTooltip);
  });

  function affectedTokenValue(token) {
    if (Object.prototype.hasOwnProperty.call(directTokenOverrides, token)) return directTokenOverrides[token];
    var working = collectTokens();
    if (Object.prototype.hasOwnProperty.call(working, token)) return working[token];
    if (Object.prototype.hasOwnProperty.call(workingTokens || {}, token)) return workingTokens[token];
    if (Object.prototype.hasOwnProperty.call(coreTokens || {}, token)) return coreTokens[token];
    return '';
  }

  function tokenEditorKind(token) {
    if (/border-width/.test(token)) return 'borderWidth';
    if (/radius/.test(token)) return 'radius';
    return 'color';
  }

  function updateAffectedTokenDescription(token) {
    if (!affectedTokenDescription) return;
    if (!token) {
      affectedTokenDescription.textContent = tx('TOKENS_SELECT_HINT');
      return;
    }
    var property = tokenPropertyForVariant(currentArea(), currentElement(), token);
    var value = affectedTokenValue(token);
    affectedTokenDescription.textContent = affectedTokenRoleLabel(token, property) + ' \u00b7 ' + token + (value ? ' = ' + value : '');
  }

  function focusAffectedToken(token) {
    token = String(token || '');
    if (!token || isWallpaperOnlyTheme() || isProtectedStudioThemeId(themeId && themeId.value)) return;
    var property = tokenPropertyForVariant(currentArea(), currentElement(), token);
    if (!property) return;
    activeDirectToken = token;
    hasActiveEditorSelection = true;
    colorGroupSelect.value = property;
    var value = affectedTokenValue(token);
    var kind = tokenEditorKind(token);
    if (kind === 'radius') {
      var radius = parseFloat(value);
      if (!isNaN(radius)) radiusRange.value = clamp(radius, parseFloat(radiusRange.min || 0), parseFloat(radiusRange.max || 36));
    } else if (kind === 'borderWidth') {
      var width = parseFloat(value);
      if (!isNaN(width) && borderWidthRange) borderWidthRange.value = clamp(width, parseFloat(borderWidthRange.min || 0), parseFloat(borderWidthRange.max || 8));
    } else {
      var hex = normalizeHexColor(value);
      if (hex) colorPicker.value = hex;
    }
    updateLabels();
    updateConditionalSettingVisibility();
    renderPropertyInspector();
    updateAffectedTokenDescription(token);

    if (selectedTokenList) {
      var selectedChip = Array.prototype.find.call(
        selectedTokenList.querySelectorAll('[data-token]'),
        function (node) { return node.getAttribute('data-token') === token; }
      );
      if (selectedChip) {
        selectedChip.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
    }

    var control = kind === 'radius' ? radiusRange : (kind === 'borderWidth' ? borderWidthRange : colorPicker);
    if (control) {
      control.focus({ preventScroll: true });
      control.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function affectedTokenGroup(token) {
    var de = i18nLanguage === 'de';
    var lower = String(token || '').toLowerCase();
    if (/(?:-on|-active)(?:-|$)/.test(lower)) return { key: 'active', label: de ? 'Aktiv' : 'Active', order: 10 };
    if (/(?:-off|-inactive)(?:-|$)/.test(lower)) return { key: 'inactive', label: de ? 'Inaktiv' : 'Inactive', order: 20 };
    if (/-hover(?:-|$)/.test(lower)) return { key: 'hover', label: 'Hover', order: 30 };
    if (/-focus(?:-|$)/.test(lower)) return { key: 'focus', label: de ? 'Fokus' : 'Focus', order: 40 };
    if (/-disabled(?:-|$)/.test(lower)) return { key: 'disabled', label: de ? 'Deaktiviert' : 'Disabled', order: 50 };
    if (/(?:-thumb|-knob)(?:-|$)/.test(lower)) return { key: 'thumb', label: de ? 'Knopf' : 'Thumb', order: 60 };
    if (/-radius(?:-|$)/.test(lower)) return { key: 'radius', label: 'Radius', order: 70 };
    if (/-border(?:-|$)/.test(lower) || /border-width/.test(lower)) return { key: 'border', label: de ? 'Rahmen' : 'Border', order: 80 };
    if (/-shadow(?:-|$)/.test(lower)) return { key: 'shadow', label: de ? 'Schatten' : 'Shadow', order: 90 };
    if (/-text(?:-|$)/.test(lower) || /-color$/.test(lower)) return { key: 'text', label: de ? 'Text' : 'Text', order: 100 };
    if (/-bg(?:-|$)/.test(lower) || /background/.test(lower)) return { key: 'background', label: de ? 'Hintergrund' : 'Background', order: 110 };
    return { key: 'other', label: de ? 'Weitere' : 'Other', order: 999 };
  }

  function renderAffectedTokenPicker(tokens) {
    tokens = (tokens || []).filter(function (token, index, list) { return list.indexOf(token) === index; });
    if (affectedTokenSelect) {
      var groups = {};
      tokens.forEach(function (token) {
        var group = affectedTokenGroup(token);
        if (!groups[group.key]) groups[group.key] = { meta: group, tokens: [] };
        groups[group.key].tokens.push(token);
      });
      var currentTokens = (((areas[currentArea()] || {})[currentElement()] || {})[currentGroup()] || []);
      var ordered = Object.keys(groups).map(function (key) { return groups[key]; }).sort(function (a, b) {
        return a.meta.order - b.meta.order;
      });
      affectedTokenSelect.innerHTML = ordered.map(function (group) {
        var shouldOpen = group.tokens.some(function (token) {
          return token === activeDirectToken || currentTokens.indexOf(token) >= 0;
        });
        return '<details class="cfw-affected-token-group"' + (shouldOpen ? ' open' : '') + '>' +
          '<summary>' + escapeHtml(group.meta.label) + ' <span>(' + group.tokens.length + ')</span></summary>' +
          '<div class="cfw-affected-token-group-items">' + group.tokens.map(function (token) {
            var classes = 'cfw-affected-token-entry' + (token === activeDirectToken ? ' is-active' : '');
            var property = tokenPropertyForVariant(currentArea(), currentElement(), token);
            return '<button type="button" class="' + classes + '" data-token="' + escapeHtml(token) + '"' +
              affectedTokenTooltipAttributes(token, property) +
              (isProtectedStudioThemeId(themeId && themeId.value) ? ' disabled' : '') + '><code>' + escapeHtml(token) + '</code></button>';
          }).join('') + '</div></details>';
      }).join('');
    }
    updateAffectedTokenDescription(tokens.indexOf(activeDirectToken) >= 0 ? activeDirectToken : '');
  }

  function propertyInspectorColorStyle(tokens) {

    var state = effectivePreviewTokens(tokens || []);
    var color = normalizeHexColor(firstThemeResolvedToken(state, tokens || [])) || '';
    if (!color) return null;
    return {
      background: color,
      foreground: readableTextFor(color, '#ffffff', '#111827')
    };
  }

  function contrastRatioForColors(a, b) {
    var la = relativeLuminance(normalizeHexColor(a));
    var lb = relativeLuminance(normalizeHexColor(b));
    if (la == null || lb == null) return null;
    var lighter = Math.max(la, lb);
    var darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function propertyTokenChipHtml(token) {
    token = String(token || '');
    var classes = 'cfw-inline-token-action' + (token === activeDirectToken ? ' is-active' : '');
    var state = effectivePreviewTokens([token]);
    var rawValue = resolvedTokenValue(state, token, 0);
    var color = normalizeHexColor(rawValue);

    if (!color) {
      return '<span class="' + classes + '" role="button" tabindex="0" data-token="' +
        escapeHtml(token) + '"' + affectedTokenTooltipAttributes(token, tokenPropertyForVariant(currentArea(), currentElement(), token)) +
        '><code>' + escapeHtml(token) + '</code></span>';
    }

    var foreground = readableTextFor(color, '#ffffff', '#111827');
    classes += ' has-token-color';
    return '<span class="' + classes + '" role="button" tabindex="0" data-token="' +
      escapeHtml(token) + '" style="--cfw-token-chip-bg:' + escapeHtml(color) +
      ';--cfw-token-chip-text:' + escapeHtml(foreground) + ';"' +
      affectedTokenTooltipAttributes(token, tokenPropertyForVariant(currentArea(), currentElement(), token)) + '><code>' + escapeHtml(token) + '</code></span>';
  }

  function affectedTokenChipHtml(token, property) {
    token = String(token || '');
    var classes = 'cfw-token-action' + (token === activeDirectToken ? ' is-active' : '');
    var effective = effectivePreviewTokens();
    var rawValue = resolvedTokenValue(effective, token, 0);
    var color = normalizeHexColor(rawValue);

    if (!color) {
      return '<button type="button" class="' + classes +
        '" data-token="' + escapeHtml(token) +
        '"' + affectedTokenTooltipAttributes(token, property) +
        '><code>' + escapeHtml(token) + '</code></button>';
    }

    var foreground = readableTextFor(color, '#ffffff', '#111827');
    classes += ' has-token-color';

    return '<button type="button" class="' + classes +
      '" data-token="' + escapeHtml(token) +
      '" style="--cfw-token-chip-bg:' + escapeHtml(color) +
      ';--cfw-token-chip-text:' + escapeHtml(foreground) +
      ';"' + affectedTokenTooltipAttributes(token, property) +
      '><code>' + escapeHtml(token) + '</code></button>';
  }

  function renderPropertyInspector() {
    var selectionPanel = document.querySelector('.cfw-selection-inspector');
    if (selectionPanel) selectionPanel.style.display = hasActiveEditorSelection && !isWallpaperOnlyTheme() ? '' : 'none';
    if (!propertyInspector) return;
    var areaName = currentArea();
    var variantName = currentElement();
    var element = (areas[areaName] || {})[variantName] || {};
    var props = Object.keys(element);
    var variantTokens = tokensForVariant(areaName, variantName);

    if (selectedElementTitle) selectedElementTitle.textContent = displayElementName(variantName) || tx('INSPECTOR_NO_ELEMENT');
    if (selectedElementMeta) selectedElementMeta.textContent = props.length + ' ' + tx(props.length === 1 ? 'PROPERTIES_PROPERTY' : 'PROPERTIES_PROPERTIES') + ' \u00b7 ' + variantTokens.length + ' ' + tx(variantTokens.length === 1 ? 'TOKENS_TOKEN' : 'TOKENS_TOKENS');
    if (variantTokens.indexOf(activeDirectToken) < 0) activeDirectToken = '';
    renderAffectedTokenPicker(variantTokens);
    if (selectedTokenList) {
      selectedTokenList.innerHTML = variantTokens.length
        ? variantTokens.map(function (token) {
            var property = tokenPropertyForVariant(areaName, variantName, token);
            return affectedTokenChipHtml(token, property);
          }).join(' ')
        : '<em>' + tx('INSPECTOR_NO_MAPPING') + '</em>';
    }

    var componentDetails = document.getElementById('selectedComponentDetails');
    var selectionKey = hasActiveEditorSelection ? areaName + '|' + variantName : '';
    if (componentDetails && selectionKey !== inspectorSelectionKey) componentDetails.open = false;
    inspectorSelectionKey = selectionKey;
    propertyInspector.innerHTML = '';
    props.forEach(function (prop) {
      var tokens = element[prop] || [];
      var expansionKey = propertyTokenExpansionKey(areaName, variantName, prop);
      var item = document.createElement('details');
      item.className = 'cfw-property-disclosure';
      item.open = !!expandedPropertyTokenKeys[expansionKey];
      var summary = document.createElement('summary');
      summary.className = 'cfw-disclosure-summary';
      summary.innerHTML = '<div class="cfw-selected-title">' + escapeHtml(displayGroupName(prop)) + '</div>' +
        '<div class="cfw-selected-meta">' + tokens.length + ' ' + escapeHtml(tx(tokens.length === 1 ? 'TOKENS_TOKEN' : 'TOKENS_TOKENS')) + '</div>';
      var tokenList = document.createElement('div');
      tokenList.className = 'cfw-disclosure-tokens';
      // Related tokens share one property preview and remain individually selectable.
      var primary = primaryToken(tokens) || tokens[0];
      var extraTokens = tokens.filter(function (token) { return token !== primary; });
      var extrasKey = expansionKey + '|tokens';
      var showExtras = !!expandedPropertyTokenKeys[extrasKey];
      var tokenCard = document.createElement('div');
      tokenCard.className = 'cfw-property-item cfw-token-card cfw-grouped-token-card';
      var colorStyle = propertyInspectorColorStyle(primary ? [primary] : tokens);
      if (colorStyle) {
        tokenCard.classList.add('has-current-color');
        tokenCard.style.setProperty('--cfw-property-current-bg', colorStyle.background);
        tokenCard.style.setProperty('--cfw-property-current-text', colorStyle.foreground);
      }
      var extraHtml = extraTokens.length ? '<button type="button" class="cfw-grouped-token-toggle" data-role="none" aria-expanded="' + showExtras + '">' +
        escapeHtml(showExtras ? '\u2212 ' + tx('INSPECTOR_FEWER_TOKENS') : '+' + extraTokens.length + ' ' + tx('INSPECTOR_MORE_TOKENS')) + '</button>' : '';
      if (showExtras) extraHtml += '<span class="cfw-grouped-token-extras">' + extraTokens.map(function (token) { return affectedTokenChipHtml(token, prop); }).join('') + '</span>';
      tokenCard.innerHTML = '<span class="cfw-property-icon">' + propertyIcon(prop) + '</span>' +
        '<span class="cfw-property-body"><strong>' + escapeHtml(displayGroupName(prop)) + '</strong>' +
        (primary ? affectedTokenChipHtml(primary, prop) : '') + extraHtml + '</span>';
      var extraToggle = tokenCard.querySelector('.cfw-grouped-token-toggle');
      if (extraToggle) extraToggle.addEventListener('click', function () {
        expandedPropertyTokenKeys[extrasKey] = !showExtras;
        renderPropertyInspector();
        var toggles = propertyInspector.querySelectorAll('.cfw-grouped-token-toggle');
        for (var i = 0; i < toggles.length; i++) {
          if (toggles[i].closest('details').querySelector('summary').textContent === summary.textContent) { toggles[i].focus(); break; }
        }
      });
      tokenList.appendChild(tokenCard);
      summary.addEventListener('click', function (event) {
        event.preventDefault();
        expandedPropertyTokenKeys[expansionKey] = !item.open;
        activeDirectToken = '';
        colorGroupSelect.value = prop;
        loadEntryToControls();
        updateAll();
        previewCaption.textContent = selectionPathLabel(areaName, variantName, prop);
      });
      tokenList.addEventListener('click', function (event) {
        var button = event.target.closest('[data-token]');
        if (!button) return;
        focusAffectedToken(button.getAttribute('data-token'));
      });
      item.appendChild(summary);
      item.appendChild(tokenList);
      propertyInspector.appendChild(item);
    });
  }

  function renderPalette() {
    paletteGrid.innerHTML = '';
    var group = currentGroup();
    var entry = getEntry();
    var tokens = currentMapping();
    var samples = themePaletteSamples(group, tokens);

    samples.forEach(function (sample) {
      var color = sample.color;
      var value = rgba(color, entry.alpha, entry.brightness);
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'cfw-palette-tile';
      tile.style.background = value;
      tile.setAttribute('data-role', 'none');
      var hexValue = normalizeHexColor(value) || normalizeHexColor(color) || String(value).trim();
      tile.innerHTML = '<small class="cfw-palette-value"></small>';
      tile.querySelector('.cfw-palette-value').textContent = hexValue;
      var sampleLabel = String(sample.label || '').trim();
      tile.setAttribute('aria-label', sampleLabel ? (sampleLabel + ': ' + hexValue) : hexValue);
      tile.setAttribute('title', sampleLabel ? (sampleLabel + '\n' + hexValue) : hexValue);
      tile.addEventListener('click', function () {
        pushUndoSnapshot('palette');
        var normalized = normalizeHexColor(color);
        colorPicker.value = normalized || color;
        saveControlsToEntry();
        updateAll();
      });
      paletteGrid.appendChild(tile);
    });
  }

  function collectTokens() {
    var tokens = {};
    Object.keys(workingTokens || {}).forEach(function (name) {
      if (/^--lb-[a-z0-9-]+$/.test(name) && !isBlockedToken(name)) tokens[name] = workingTokens[name];
    });
    Object.keys(studioModel).forEach(function (key) {
      var parts = key.split('|');
      var area = parts[0];
      var element = parts[1];
      var group = parts[2];
      var entry = studioModel[key];

      if (!entry || !entry.dirty) return;
      var mapped = (((areas[area] || {})[element] || {})[group]) || [];
      mapped.forEach(function (token) {
        if (!/^--lb-[a-z0-9-]+$/.test(token) || isBlockedToken(token)) return;
        if (/border-width/.test(token) || isBorderWidthGroup(group)) {
          tokens[token] = (entry.borderWidth == null ? 1 : entry.borderWidth) + 'px';
        } else if (/radius/.test(token) || group === 'Radius') {
          tokens[token] = entry.radius + 'px';
        } else if (/shadow/.test(token) || group === 'Schatten') {
          tokens[token] = shadowValueToCss(entry.shadow, entry.color);
        } else if (/opacity/.test(token)) {
          tokens[token] = (entry.alpha / 100).toFixed(2);
        } else if (/blur/.test(token)) {
          tokens[token] = Math.max(0, Math.round(entry.brightness / 4)) + 'px';
        } else {
          tokens[token] = isForcedOpaqueToken(token)
            ? rgba(entry.color, 100, entry.brightness)
            : rgba(entry.color, entry.alpha, entry.brightness);
        }
      });
    });
    Object.keys(directTokenOverrides || {}).forEach(function (token) {
      if (/^--lb-[a-z0-9-]+$/.test(token) && !isBlockedToken(token)) tokens[token] = directTokenOverrides[token];
    });
    enforceForcedOpaqueTokens(tokens);
    return tokens;
  }

  function previewBridgeVarNames() {
    return [
      '--cfw-preview-button-bg',
      '--cfw-preview-button-text',
      '--cfw-preview-btn-group-border',
      '--cfw-preview-btn-group-inactive-bg',
      '--cfw-preview-btn-group-inactive-text',
      '--cfw-preview-btn-group-inactive-border',
      '--cfw-preview-btn-group-hover-bg',
      '--cfw-preview-btn-group-hover-text',
      '--cfw-preview-btn-group-active-bg',
      '--cfw-preview-btn-group-active-text',
      '--cfw-preview-btn-group-active-hover-bg',
      '--cfw-preview-btn-group-active-hover-text',
      '--cfw-preview-card-bg',
      '--cfw-preview-card-text',
      '--cfw-preview-card-border',
      '--cfw-preview-shell-radius',
      '--cfw-preview-header-radius',
      '--cfw-preview-card-radius',
      '--cfw-preview-input-radius',
      '--cfw-preview-select-radius',
      '--cfw-preview-textarea-radius',
      '--cfw-preview-button-radius',
      '--cfw-preview-btn-group-radius',
      '--cfw-preview-table-radius',
      '--cfw-preview-sidebar-link-radius',
      '--cfw-preview-dialog-radius',
      '--cfw-preview-checkbox-radius',
      '--cfw-preview-badge-radius',
      '--cfw-preview-input-bg',
      '--cfw-preview-input-text',
      '--cfw-preview-input-border',
      '--cfw-preview-select-bg',
      '--cfw-preview-select-text',
      '--cfw-preview-select-border',
      '--cfw-preview-textarea-bg',
      '--cfw-preview-textarea-text',
      '--cfw-preview-textarea-border',
      '--cfw-preview-slider-active',
      '--cfw-preview-slider-track',
      '--cfw-preview-slider-thumb',
      '--cfw-preview-slider-thumb-border',
      '--cfw-preview-slider-thumb-border-width',
      '--cfw-preview-slider-thumb-shadow',
      '--cfw-preview-slider-thumb-hover-shadow',
      '--cfw-preview-slider-focus-shadow',
      '--cfw-preview-checkbox-bg',
      '--cfw-preview-checkbox-border',
      '--cfw-preview-checkbox-checked-bg',
      '--cfw-preview-radio-bg',
      '--cfw-preview-radio-border',
      '--cfw-preview-radio-checked-bg',
      '--cfw-preview-switch-on-bg',
      '--cfw-preview-switch-off-bg',
      '--cfw-preview-switch-border',
      '--cfw-preview-switch-thumb-bg',
      '--cfw-preview-table-bg',
      '--cfw-preview-table-text',
      '--cfw-preview-table-border',
      '--cfw-preview-table-border-width',
      '--cfw-preview-table-hover-bg',
      '--cfw-preview-table-hover-text',
      '--cfw-preview-notify-bg',
      '--cfw-preview-validation-bg'
    ];
  }

  function clearPreviewBridgeVars(root) {
    if (!root) return;
    previewBridgeVarNames().forEach(function (name) { root.style.removeProperty(name); });
  }

  function tokenAliasFallback(value) {
    var text = String(value || '').trim();
    var m = text.match(/^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^)]+))?\)$/);
    if (!m) return null;
    return { name: m[1], fallback: m[2] ? String(m[2]).trim() : '' };
  }

  function resolvedTokenValue(tokens, name, depth) {
    tokens = tokens || {};
    depth = depth || 0;
    if (!name || depth > 8) return '';
    var value = String(tokens[name] || '').trim();
    if (!value) return '';
    var alias = tokenAliasFallback(value);
    if (!alias) return value;
    return resolvedTokenValue(tokens, alias.name, depth + 1) || alias.fallback || '';
  }

  function firstResolvedToken(tokens, names) {
    for (var i = 0; i < names.length; i += 1) {
      var value = resolvedTokenValue(tokens, names[i], 0);
      if (value) return value;
    }
    return '';
  }

  function firstThemeResolvedToken(tokens, names) {
    var explicit = collectTokens();
    var merged = Object.assign({}, tokens || {}, explicit || {});
    for (var i = 0; i < names.length; i += 1) {
      if (!Object.prototype.hasOwnProperty.call(explicit, names[i])) continue;
      var preferred = resolvedTokenValue(merged, names[i], 0);
      if (preferred) return preferred;
    }
    return firstResolvedToken(tokens || {}, names || []);
  }

  function isZeroRadiusValue(value) {
    value = String(value == null ? '' : value).trim().toLowerCase();
    return /^(?:0|0\.0+)(?:px|rem|em|%|vh|vw)?$/.test(value);
  }

  function hasSquareRadiusTokenContract(tokens) {
    tokens = tokens || {};
    var resolved = [
      firstResolvedToken(tokens, ['--lb-radius-card', '--lb-card-radius', '--lb-radius', '--lb-radius-sm']),
      firstResolvedToken(tokens, ['--lb-radius-button', '--lb-btn-radius', '--lb-radius-sm', '--lb-radius']),
      firstResolvedToken(tokens, ['--lb-input-radius', '--lb-radius-input', '--lb-radius-sm', '--lb-radius']),
      firstResolvedToken(tokens, ['--lb-table-radius', '--lb-radius-table', '--lb-radius-card', '--lb-radius'])
    ].filter(function (value) { return String(value || '').trim() !== ''; });
    return resolved.length >= 3 && resolved.every(isZeroRadiusValue);
  }

  function previewRadiusValue(tokens, names) {

    if (hasSquareRadiusTokenContract(tokens)) return '0px';
    return firstResolvedToken(tokens, names);
  }

  function derivedSliderActiveColor(tokens) {
    tokens = tokens || {};

    return firstResolvedToken(tokens, [
      '--lb-slider-fill-bg',
      '--lb-slider-active-bg',
      '--lb-range-active-bg',
      '--lb-active-bg',
      '--lb-btn-primary-bg',
      '--lb-primary'
    ]) || '#007aff';
  }

  function themePrimaryCandidate(tokens) {
    return firstResolvedToken(tokens, [
      '--lb-btn-primary-bg',
      '--lb-active-bg',
      '--lb-btn-group-active-bg',
      '--lb-slider-fill-bg',
      '--lb-slider-active-bg',
      '--lb-range-active-bg'
    ]);
  }

  function applyPreviewFallbacks(tokens) {
    var root = previewRoot;
    if (!root) return;
    clearPreviewBridgeVars(root);

    var sliderPreviewActive = derivedSliderActiveColor(tokens);
    var fallbackMap = {
      '--cfw-preview-button-bg': tokens['--lb-btn-bg'] || tokens['--lb-active-bg'] || tokens['--lb-btn-primary-bg'],
      '--cfw-preview-button-text': tokens['--lb-btn-text'] || tokens['--lb-active-text'],
      '--cfw-preview-btn-group-border': resolvedTokenValue(tokens, '--lb-btn-group-border') || resolvedTokenValue(tokens, '--lb-btn-group-inactive-border') || resolvedTokenValue(tokens, '--lb-btn-group-active-border') || resolvedTokenValue(tokens, '--lb-border-color') || resolvedTokenValue(tokens, '--lb-border'),
      '--cfw-preview-btn-group-inactive-bg': resolvedTokenValue(tokens, '--lb-btn-group-inactive-bg') || resolvedTokenValue(tokens, '--lb-btn-bg'),
      '--cfw-preview-btn-group-inactive-text': resolvedTokenValue(tokens, '--lb-btn-group-inactive-text') || resolvedTokenValue(tokens, '--lb-btn-text'),
      '--cfw-preview-btn-group-hover-bg': resolvedTokenValue(tokens, '--lb-btn-group-hover-bg') || resolvedTokenValue(tokens, '--lb-btn-hover-bg'),
      '--cfw-preview-btn-group-hover-text': resolvedTokenValue(tokens, '--lb-btn-group-hover-text') || resolvedTokenValue(tokens, '--lb-btn-group-active-text') || resolvedTokenValue(tokens, '--lb-active-text') || resolvedTokenValue(tokens, '--lb-btn-primary-text'),
      '--cfw-preview-btn-group-active-bg': resolvedTokenValue(tokens, '--lb-btn-group-active-bg') || resolvedTokenValue(tokens, '--lb-active-bg') || resolvedTokenValue(tokens, '--lb-primary') || resolvedTokenValue(tokens, '--lb-btn-primary-bg'),
      '--cfw-preview-btn-group-active-text': resolvedTokenValue(tokens, '--lb-btn-group-active-text') || resolvedTokenValue(tokens, '--lb-active-text') || resolvedTokenValue(tokens, '--lb-btn-primary-text'),
      '--cfw-preview-btn-group-active-hover-bg': resolvedTokenValue(tokens, '--lb-btn-group-active-hover-bg') || resolvedTokenValue(tokens, '--lb-primary-hover') || resolvedTokenValue(tokens, '--lb-btn-primary-hover-bg'),
      '--cfw-preview-btn-group-active-hover-text': resolvedTokenValue(tokens, '--lb-btn-group-active-hover-text') || resolvedTokenValue(tokens, '--lb-btn-group-active-text') || resolvedTokenValue(tokens, '--lb-active-text'),
      '--cfw-preview-card-bg': tokens['--lb-card-bg'] || tokens['--lb-note-bg'] || tokens['--lb-glass-bg'],
      '--cfw-preview-card-text': tokens['--lb-card-text'] || tokens['--lb-text'],
      '--cfw-preview-card-border': tokens['--lb-card-border'] || tokens['--lb-border'] || tokens['--lb-border-color'],

      '--cfw-preview-shell-radius': previewRadiusValue(tokens, ['--lb-radius-card', '--lb-card-radius', '--lb-radius', '--lb-radius-sm']),
      '--cfw-preview-header-radius': previewRadiusValue(tokens, ['--lb-header-radius', '--lb-radius-card', '--lb-card-radius', '--lb-radius', '--lb-radius-sm']),
      '--cfw-preview-card-radius': previewRadiusValue(tokens, ['--lb-radius-card', '--lb-card-radius', '--lb-radius', '--lb-radius-sm']),
      '--cfw-preview-input-radius': previewRadiusValue(tokens, ['--lb-input-radius', '--lb-radius-input', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-select-radius': previewRadiusValue(tokens, ['--lb-select-radius', '--lb-radius-select', '--lb-input-radius', '--lb-radius-input', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-textarea-radius': previewRadiusValue(tokens, ['--lb-textarea-radius', '--lb-input-radius', '--lb-radius-input', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-button-radius': previewRadiusValue(tokens, ['--lb-radius-button', '--lb-btn-radius', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-btn-group-radius': previewRadiusValue(tokens, ['--lb-btn-group-radius', '--lb-btn-group-item-radius', '--lb-radius-button', '--lb-btn-radius', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-table-radius': previewRadiusValue(tokens, ['--lb-table-radius', '--lb-radius-table', '--lb-radius-card', '--lb-card-radius', '--lb-radius', '--lb-radius-sm']),
      '--cfw-preview-sidebar-link-radius': previewRadiusValue(tokens, ['--lb-sidebar-link-radius', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-dialog-radius': previewRadiusValue(tokens, ['--lb-dialog-radius', '--lb-radius-card', '--lb-card-radius', '--lb-radius', '--lb-radius-sm']),
      '--cfw-preview-checkbox-radius': previewRadiusValue(tokens, ['--lb-checkbox-radius', '--lb-input-radius', '--lb-radius-input', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-badge-radius': previewRadiusValue(tokens, ['--lb-badge-radius', '--lb-notify-radius', '--lb-validation-radius', '--lb-radius-sm', '--lb-radius']),
      '--cfw-preview-input-bg': firstThemeResolvedToken(tokens, ['--lb-input-bg', '--lb-select-bg']),
      '--cfw-preview-input-text': firstThemeResolvedToken(tokens, ['--lb-input-text', '--lb-text']),
      '--cfw-preview-input-border': firstThemeResolvedToken(tokens, ['--lb-input-border', '--lb-border', '--lb-border-color']),
      '--cfw-preview-select-bg': firstThemeResolvedToken(tokens, ['--lb-select-bg', '--lb-input-bg']),
      '--cfw-preview-select-text': tokens['--lb-select-text'] || firstThemeResolvedToken(tokens, ['--lb-input-text', '--lb-text']),
      '--cfw-preview-select-border': firstThemeResolvedToken(tokens, ['--lb-select-border', '--lb-input-border', '--lb-border']),
      '--cfw-preview-textarea-bg': firstThemeResolvedToken(tokens, ['--lb-textarea-bg', '--lb-input-bg', '--lb-card-bg']),
      '--cfw-preview-textarea-text': tokens['--lb-textarea-text'] || firstThemeResolvedToken(tokens, ['--lb-input-text', '--lb-text']),
      '--cfw-preview-textarea-border': firstThemeResolvedToken(tokens, ['--lb-textarea-border', '--lb-input-border', '--lb-border']),
      '--cfw-preview-slider-active': sliderPreviewActive,
      '--cfw-preview-slider-track': firstResolvedToken(tokens, ['--lb-slider-track-bg', '--lb-slider-bg', '--lb-range-track-bg']),
      '--cfw-preview-slider-thumb': resolvedTokenValue(tokens, '--lb-slider-thumb-bg') || sliderPreviewActive,
      '--cfw-preview-slider-thumb-border': firstResolvedToken(tokens, ['--lb-slider-thumb-border-color', '--lb-slider-thumb-border']) || '#ffffff',
      '--cfw-preview-slider-thumb-border-width': tokens['--lb-slider-thumb-border-width'] || '3px',
      '--cfw-preview-slider-thumb-shadow': tokens['--lb-slider-thumb-shadow'],
      '--cfw-preview-slider-thumb-hover-shadow': tokens['--lb-slider-thumb-hover-shadow'],
      '--cfw-preview-slider-focus-shadow': tokens['--lb-slider-focus-shadow'],
      '--cfw-preview-checkbox-bg': firstThemeResolvedToken(tokens, ['--lb-checkbox-bg', '--lb-input-bg']),
      '--cfw-preview-checkbox-border': firstThemeResolvedToken(tokens, ['--lb-checkbox-border', '--lb-border-color', '--lb-border']),
      '--cfw-preview-checkbox-checked-bg': firstThemeResolvedToken(tokens, ['--lb-checkbox-checked-bg', '--lb-active-bg', '--lb-primary']),
      '--cfw-preview-radio-bg': firstThemeResolvedToken(tokens, ['--lb-radio-bg', '--lb-checkbox-bg', '--lb-input-bg']),
      '--cfw-preview-radio-border': firstThemeResolvedToken(tokens, ['--lb-radio-border', '--lb-checkbox-border', '--lb-border-color', '--lb-border']),
      '--cfw-preview-radio-checked-bg': firstThemeResolvedToken(tokens, ['--lb-radio-checked-bg', '--lb-active-bg', '--lb-primary']),
      '--cfw-preview-switch-on-bg': firstThemeResolvedToken(tokens, ['--lb-switch-on-bg', '--lb-toggle-active-bg', '--lb-active-bg', '--lb-primary']),
      '--cfw-preview-switch-off-bg': firstThemeResolvedToken(tokens, ['--lb-switch-off-bg', '--lb-toggle-bg', '--lb-input-bg']),
      '--cfw-preview-switch-border': firstThemeResolvedToken(tokens, ['--lb-switch-border', '--lb-toggle-border', '--lb-border-color', '--lb-border']),
      '--cfw-preview-switch-thumb-bg': firstThemeResolvedToken(tokens, ['--lb-switch-thumb-bg', '--lb-toggle-thumb-bg', '--lb-toggle-knob-bg', '--lb-slider-thumb-bg']),
      '--cfw-preview-table-bg': tokens['--lb-table-bg'] || tokens['--lb-table-row-bg'] || tokens['--lb-table-body-bg'],
      '--cfw-preview-table-text': tokens['--lb-table-text'] || tokens['--lb-table-row-text'],
      '--cfw-preview-table-border': tokens['--lb-table-border-color'] || tokens['--lb-table-border'],
      '--cfw-preview-table-border-width': tokens['--lb-table-border-width'] || tokens['--lb-table-outer-border-width'],
      '--cfw-preview-table-hover-bg': tokens['--lb-table-row-hover-bg'] || tokens['--lb-table-hover-bg'] || tokens['--lb-hover-bg'],
      '--cfw-preview-table-hover-text': tokens['--lb-table-row-hover-text'] || tokens['--lb-table-hover-text'] || tokens['--lb-table-text'],
      '--cfw-preview-notify-bg': tokens['--lb-success-bg'] || tokens['--lb-notify-bg'] || tokens['--lb-active-bg'],
      '--cfw-preview-validation-bg': tokens['--lb-warning-bg'] || tokens['--lb-error-bg'] || tokens['--lb-card-bg']
    };
    Object.keys(fallbackMap).forEach(function (name) { if (fallbackMap[name]) root.style.setProperty(name, fallbackMap[name]); });
  }

  function setRuleToken(tokens, name, value) {
    if (!value) return;
    if (/^--lb-/.test(name) && coreTokens[name] === undefined) return;
    if (/^--lb-/.test(name) && isBlockedToken(name)) return;
    tokens[name] = value;
  }

  function parseCssRgba(value) {
    value = String(value == null ? '' : value).trim().toLowerCase();
    if (!value) return null;
    if (value === 'transparent') return { r:0, g:0, b:0, a:0 };

    var hex = value.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
      var h = hex[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
      if (h.length !== 6 && h.length !== 8) return null;
      return {
        r:parseInt(h.slice(0, 2), 16),
        g:parseInt(h.slice(2, 4), 16),
        b:parseInt(h.slice(4, 6), 16),
        a:h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
      };
    }

    var rgb = value.match(/^rgba?\(\s*([+-]?(?:\d+\.?\d*|\.\d+)%?)\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+)%?)\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+)%?)(?:\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+)%?))?\s*\)$/i);
    if (!rgb) return null;
    function channel(raw) {
      var n = parseFloat(raw);
      if (!isFinite(n)) return 0;
      if (/%$/.test(raw)) n = n * 2.55;
      return Math.max(0, Math.min(255, n));
    }
    function alpha(raw) {
      if (raw == null || raw === '') return 1;
      var n = parseFloat(raw);
      if (!isFinite(n)) return 1;
      if (/%$/.test(raw)) n /= 100;
      return Math.max(0, Math.min(1, n));
    }
    return { r:channel(rgb[1]), g:channel(rgb[2]), b:channel(rgb[3]), a:alpha(rgb[4]) };
  }

  function compositeCssRgba(top, bottom) {
    top = top || { r:0, g:0, b:0, a:0 };
    bottom = bottom || { r:255, g:255, b:255, a:1 };
    var outA = top.a + bottom.a * (1 - top.a);
    if (outA <= 0.000001) return { r:0, g:0, b:0, a:0 };
    return {
      r:(top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / outA,
      g:(top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / outA,
      b:(top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / outA,
      a:outA
    };
  }

  function opaqueHexFromRgba(rgbaValue) {
    var rendered = compositeCssRgba(rgbaValue, { r:255, g:255, b:255, a:1 });
    return colorUtils.rgbToHex({ r:rendered.r, g:rendered.g, b:rendered.b }).toLowerCase();
  }

  function renderedTextContrastRatio(textValue, renderedBackground) {
    var text = parseCssRgba(textValue);
    var bg = parseCssRgba(renderedBackground);
    if (!text || !bg) return null;
    var opaqueBg = compositeCssRgba(bg, { r:255, g:255, b:255, a:1 });
    var opaqueText = compositeCssRgba(text, opaqueBg);
    return contrastRatioForColors(opaqueHexFromRgba(opaqueText), opaqueHexFromRgba(opaqueBg));
  }

  function switchSemanticText(background) {

    var parsed = parseCssRgba(background);
    if (!parsed) return '#000000';
    var renderedHex = opaqueHexFromRgba(parsed);
    return themeRelativeLuminance(renderedHex) > 0.179 ? '#000000' : '#ffffff';
  }

  function firstWorkingThenMergedCssColorToken(working, names) {
    working = working || {};
    names = names || [];
    var merged = Object.assign({}, coreTokens || {}, working);
    var i;

    for (i = 0; i < names.length; i += 1) {
      if (!Object.prototype.hasOwnProperty.call(working, names[i])) continue;
      var explicitRaw = resolvedTokenValue(merged, names[i]);
      var explicitColor = parseCssRgba(explicitRaw);
      if (explicitColor) return { token:names[i], value:explicitRaw, rgba:explicitColor, explicit:true };
    }
    for (i = 0; i < names.length; i += 1) {
      var inheritedRaw = resolvedTokenValue(merged, names[i]);
      var inheritedColor = parseCssRgba(inheritedRaw);
      if (inheritedColor) return { token:names[i], value:inheritedRaw, rgba:inheritedColor, explicit:false };
    }
    return null;
  }

  function effectiveSwitchLabelSurface(tokens) {

    tokens = tokens || {};
    var top = firstWorkingThenMergedCssColorToken(tokens, [
      '--lb-switch-off-bg', '--lb-toggle-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'
    ]);
    var base = firstWorkingThenMergedCssColorToken(tokens, ['--lb-bg', '--lb-card-bg', '--lb-input-bg']);
    if (!top && !base) {
      return { token:'jQM label fallback', raw:'#ffffff', value:'#ffffff', layers:[] };
    }
    var layers = [];
    if (top) layers.push(top);
    if (base && (!top || base.token !== top.token)) layers.push(base);
    var rendered = { r:255, g:255, b:255, a:1 };
    for (var i = layers.length - 1; i >= 0; i -= 1) rendered = compositeCssRgba(layers[i].rgba, rendered);
    return {
      token:top ? top.token : base.token,
      raw:top ? top.value : base.value,
      value:opaqueHexFromRgba(rendered),
      layers:layers
    };
  }

  function switchTextContract(tokens, state) {
    tokens = tokens || {};
    var on = state === 'on';
    var primaryToken = on ? '--lb-switch-on-text' : '--lb-switch-off-text';
    var aliasToken = on ? '--lb-toggle-active-text' : '--lb-toggle-text';
    var background = effectiveSwitchLabelSurface(tokens);
    var dedicated = firstWorkingThenMergedCssColorToken(tokens, [primaryToken, aliasToken]);
    var suggestion = background ? switchSemanticText(background.value) : '#000000';
    var ratio = background && dedicated
      ? renderedTextContrastRatio(dedicated.value, background.value)
      : null;
    var currentHex = dedicated ? normalizeHexColor(dedicated.value) : '';
    return {
      state: state,
      background: background,
      dedicated: dedicated,
      ratio: ratio,
      suggestion: suggestion,
      primaryToken: primaryToken,
      aliasToken: aliasToken,
      missing: !dedicated || !dedicated.explicit,
      semanticMismatch: currentHex !== suggestion,
      invalid: !dedicated || currentHex !== suggestion
    };
  }

  function syncSwitchTextTokens(tokens) {
    tokens = tokens || {};
    var surface = effectiveSwitchLabelSurface(tokens);
    var value = surface ? switchSemanticText(surface.value) : '#000000';

    tokens['--lb-switch-on-text'] = value;
    tokens['--lb-toggle-active-text'] = value;
    tokens['--lb-switch-off-text'] = value;
    tokens['--lb-toggle-text'] = value;
    return tokens;
  }

  function persistSwitchTextTokensToWorkingState() {
    var before = collectTokens() || {};
    var normalized = syncSwitchTextTokens(Object.assign({}, before));
    [
      '--lb-switch-on-text',
      '--lb-toggle-active-text',
      '--lb-switch-off-text',
      '--lb-toggle-text'
    ].forEach(function (token) {
      if (normalized[token]) directTokenOverrides[token] = normalized[token];
    });
    return normalized;
  }

  function applyDesignRules(tokens) {
    tokens = Object.assign({}, tokens || {});

    var activeBg = firstResolvedToken(tokens, ['--lb-btn-group-active-bg', '--lb-active-bg', '--lb-primary', '--lb-btn-primary-bg']);
    var activeText = firstResolvedToken(tokens, ['--lb-btn-group-active-text', '--lb-active-text', '--lb-btn-primary-text']) || (activeBg ? readableTextFor(activeBg) : '');
    if (activeBg && activeText) {
      setRuleToken(tokens, '--lb-btn-group-active-bg', activeBg);
      setRuleToken(tokens, '--lb-btn-group-active-text', activeText);
      var activeHoverBg = firstResolvedToken(tokens, ['--lb-btn-group-active-hover-bg', '--lb-primary-hover', '--lb-btn-primary-hover-bg']) || mixColor(activeBg, 8);

      var inactiveBg = tokens['--lb-btn-group-inactive-bg'] || activeText;
      var inactiveText = tokens['--lb-btn-group-inactive-text'] || activeBg;
      var groupBorder = tokens['--lb-btn-group-border'] || tokens['--lb-btn-group-inactive-border'] || tokens['--lb-btn-group-active-border'] || tokens['--lb-border-color'] || tokens['--lb-border'] || activeBg;
      var inactiveBorder = tokens['--lb-btn-group-inactive-border'] || groupBorder;
      var hoverBg = tokens['--lb-btn-group-hover-bg'] || activeBg;
      var hoverText = tokens['--lb-btn-group-hover-text'] || activeText;
      var activeHoverText = tokens['--lb-btn-group-active-hover-text'] || activeText;

      setRuleToken(tokens, '--lb-btn-group-active-hover-bg', activeHoverBg);
      setRuleToken(tokens, '--lb-btn-group-active-hover-text', activeHoverText);
      tokens['--cfw-preview-btn-group-active-bg'] = activeBg;
      tokens['--cfw-preview-btn-group-active-text'] = activeText;
      tokens['--cfw-preview-btn-group-active-hover-bg'] = activeHoverBg;
      tokens['--cfw-preview-btn-group-active-hover-text'] = activeHoverText;
      tokens['--lb-btn-group-inactive-bg'] = inactiveBg;
      tokens['--lb-btn-group-inactive-text'] = inactiveText;
      tokens['--lb-btn-group-border'] = groupBorder;
      tokens['--lb-btn-group-inactive-border'] = inactiveBorder;
      setRuleToken(tokens, '--lb-btn-group-hover-bg', hoverBg);
      setRuleToken(tokens, '--lb-btn-group-hover-text', hoverText);
      tokens['--cfw-preview-btn-group-inactive-bg'] = inactiveBg;
      tokens['--cfw-preview-btn-group-inactive-text'] = inactiveText;
      tokens['--cfw-preview-btn-group-border'] = groupBorder;
      tokens['--cfw-preview-btn-group-inactive-border'] = inactiveBorder;
    }

    var currentPrimary = resolvedTokenValue(tokens, '--lb-primary');
    var derivedPrimary = themePrimaryCandidate(tokens);

    if (derivedPrimary && !currentPrimary) {
      setRuleToken(tokens, '--lb-primary', derivedPrimary);
    }
    if (resolvedTokenValue(tokens, '--lb-primary') && !resolvedTokenValue(tokens, '--lb-slider-value-text')) {
      setRuleToken(tokens, '--lb-slider-value-text', 'var(--lb-primary)');
    }

    var sliderValueBg = normalizeHexColor(resolvedTokenValue(tokens, '--lb-slider-value-bg'));
    var sliderValueTextRaw = String(tokens['--lb-slider-value-text'] || '').trim();
    if (sliderValueBg && !sliderValueTextRaw) {
      setRuleToken(tokens, '--lb-slider-value-text', readableTextFor(sliderValueBg, '#ffffff', '#111827'));
    }

    var sliderActive = derivedSliderActiveColor(tokens);
    if (sliderActive) {
      setRuleToken(tokens, '--lb-slider-active-bg', sliderActive);
      setRuleToken(tokens, '--lb-slider-fill-bg', tokens['--lb-slider-fill-bg'] || sliderActive);
      setRuleToken(tokens, '--lb-range-active-bg', tokens['--lb-range-active-bg'] || tokens['--lb-slider-fill-bg'] || sliderActive);
      var sliderTrack = tokens['--lb-slider-bg'] || tokens['--lb-slider-track-bg'] || tokens['--lb-range-track-bg'] || tokens['--lb-border-color'] || tokens['--lb-border'] || 'rgba(0,0,0,.22)';
      setRuleToken(tokens, '--lb-slider-bg', sliderTrack);
      setRuleToken(tokens, '--lb-slider-track-bg', tokens['--lb-slider-track-bg'] || sliderTrack);
      setRuleToken(tokens, '--lb-range-track-bg', tokens['--lb-range-track-bg'] || tokens['--lb-slider-track-bg'] || sliderTrack);
      setRuleToken(tokens, '--lb-slider-thumb-bg', tokens['--lb-slider-thumb-bg'] || sliderActive);
      var sliderThumbBorder = tokens['--lb-slider-thumb-border-color'] || tokens['--lb-slider-thumb-border'];
      if (sliderThumbBorder) {
        setRuleToken(tokens, '--lb-slider-thumb-border-color', sliderThumbBorder);
        setRuleToken(tokens, '--lb-slider-thumb-border', sliderThumbBorder);
      }
      setRuleToken(tokens, '--lb-slider-compact-active-bg', tokens['--lb-slider-compact-active-bg'] || sliderActive);
      setRuleToken(tokens, '--lb-slider-compact-thumb-bg', tokens['--lb-slider-compact-thumb-bg'] || tokens['--lb-slider-thumb-bg'] || sliderActive);
      if (sliderThumbBorder) {
        setRuleToken(tokens, '--lb-slider-compact-thumb-border', tokens['--lb-slider-compact-thumb-border'] || sliderThumbBorder);
      }
    }

    var primary = tokens['--lb-primary'] || tokens['--lb-active-bg'] || tokens['--lb-btn-primary-bg'];
    var onPrimary = tokens['--lb-active-text'] || tokens['--lb-btn-primary-text'] || (primary ? readableTextFor(primary) : '');
    if (primary && onPrimary) {
      setRuleToken(tokens, '--lb-header-btn-bg', tokens['--lb-header-btn-bg'] || primary);
      setRuleToken(tokens, '--lb-header-btn-text', tokens['--lb-header-btn-text'] || onPrimary);
      setRuleToken(tokens, '--lb-header-btn-hover-bg', tokens['--lb-header-btn-hover-bg'] || tokens['--lb-primary-hover'] || mixColor(primary, 8));
      setRuleToken(tokens, '--lb-header-btn-hover-text', tokens['--lb-header-btn-hover-text'] || onPrimary);
    }

    if (primary) {
      setRuleToken(tokens, '--lb-focus-ring', tokens['--lb-focus-ring'] || primary);
      setRuleToken(tokens, '--lb-focus-ring-strong', tokens['--lb-focus-ring-strong'] || primary);
    }
    setRuleToken(tokens, '--lb-input-disabled-opacity', tokens['--lb-input-disabled-opacity'] || '0.60');
    setRuleToken(tokens, '--lb-input-disabled-bg', tokens['--lb-input-disabled-bg'] || tokens['--lb-card-bg'] || tokens['--lb-bg']);
    setRuleToken(tokens, '--lb-input-disabled-text', tokens['--lb-input-disabled-text'] || tokens['--lb-text-muted'] || tokens['--lb-text-secondary']);

    var cardBg = firstResolvedToken(tokens, ['--lb-card-bg', '--lb-bg']);
    var pageText = firstResolvedToken(tokens, ['--lb-text']);
    var cardText = firstResolvedToken(tokens, ['--lb-card-text', '--lb-text']);
    if (cardBg && (!cardText || contrastRatioForColors(normalizeHexColor(resolvedTokenValue(tokens, '--lb-card-text')) || cardText, normalizeHexColor(cardBg) || cardBg) < 4.5)) {
      cardText = readableTextFor(cardBg, '#f8fafc', '#111827');
    }
    if (!cardText) cardText = pageText;
    if (cardText) tokens['--lb-card-text'] = cardText;

    var noteText = firstResolvedToken(tokens, ['--lb-note-text', '--lb-card-text', '--lb-text']);
    if (noteText) tokens['--lb-note-text'] = noteText;

    var tooltipBg = tokens['--lb-primary-hover'] || tokens['--lb-btn-primary-hover-bg'] || tokens['--lb-primary'] || primary;
    var tooltipText = tokens['--lb-sidebar-text'] || tokens['--lb-on-dark-text'] || (tooltipBg ? readableTextFor(tooltipBg) : '');
    if (tooltipBg && !tokens['--lb-tooltip-bg']) tokens['--lb-tooltip-bg'] = tooltipBg;
    if (tooltipText && !tokens['--lb-tooltip-text']) tokens['--lb-tooltip-text'] = tooltipText;

    function forceReadableText(textToken, bgToken, minimumRatio, light, dark) {
      var bgTokens = Array.isArray(bgToken) ? bgToken : [bgToken];
      var bg = '';
      for (var i = 0; i < bgTokens.length; i += 1) {
        bg = normalizeHexColor(resolvedTokenValue(tokens, bgTokens[i]));
        if (bg) break;
      }
      if (!bg) return;
      var current = normalizeHexColor(resolvedTokenValue(tokens, textToken));
      if (!current || contrastRatioForColors(current, bg) < minimumRatio) {
        tokens[textToken] = readableTextFor(bg, light || '#ffffff', dark || '#111827');
      }
    }

    forceReadableText('--lb-text', '--lb-bg', 4.5);
    forceReadableText('--lb-text-secondary', '--lb-bg', 3.0, '#e5e7eb', '#374151');
    forceReadableText('--lb-text-muted', '--lb-bg', 3.0, '#cbd5e1', '#4b5563');

    forceReadableText('--lb-input-text', ['--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5);
    forceReadableText('--lb-input-hover-text', ['--lb-input-hover-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5);
    forceReadableText('--lb-input-placeholder-text', ['--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    forceReadableText('--lb-input-disabled-text', ['--lb-input-disabled-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    forceReadableText('--lb-input-disabled-placeholder-text', ['--lb-input-disabled-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5, '#f8fafc', '#111827');
    forceReadableText('--lb-textarea-text', ['--lb-textarea-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5);
    forceReadableText('--lb-select-text', ['--lb-select-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5);
    forceReadableText('--lb-native-select-text', ['--lb-native-select-bg', '--lb-select-bg', '--lb-input-bg', '--lb-card-bg', '--lb-bg'], 4.5);

    if (!isProtectedStudioThemeId(themeId && themeId.value)) {
      forceReadableText('--lb-table-text', '--lb-table-bg', 4.5);
      forceReadableText('--lb-table-cell-text', '--lb-table-bg', 4.5);
      forceReadableText('--lb-table-row-text', '--lb-table-row-bg', 4.5);
      forceReadableText('--lb-table-header-text', '--lb-table-header-bg', 4.5);
      forceReadableText('--lb-table-footer-text', '--lb-table-footer-bg', 4.5);
      forceReadableText('--lb-table-row-hover-text', '--lb-table-row-hover-bg', 4.5);
      forceReadableText('--lb-table-hover-text', '--lb-table-hover-bg', 4.5);
      forceReadableText('--lb-table-compact-text', '--lb-table-compact-bg', 4.5);
      forceReadableText('--lb-table-compact-header-text', '--lb-table-compact-header-bg', 4.5);
      forceReadableText('--lb-table-compact-hover-text', '--lb-table-compact-hover-bg', 4.5);
    }

    forceReadableText('--lb-sidebar-text', '--lb-sidebar-bg', 4.5);
    forceReadableText('--lb-sidebar-item-text', '--lb-sidebar-bg', 4.5);
    forceReadableText('--lb-sidebar-active-text', '--lb-sidebar-active-bg', 4.5);
    forceReadableText('--lb-sidebar-link-hover-text', '--lb-sidebar-link-hover-bg', 4.5);
    forceReadableText('--lb-sidebar-hover-text', '--lb-sidebar-hover-bg', 4.5);

    forceReadableText('--lb-header-text', '--lb-header-bg', 4.5);
    forceReadableText('--lb-header-btn-text', '--lb-header-btn-bg', 4.5);
    forceReadableText('--lb-header-btn-hover-text', '--lb-header-btn-hover-bg', 4.5);

    syncSwitchTextTokens(tokens);

    return tokens;
  }

  function applyStudioTheme(tokens) {
    var page = document.querySelector('.cfw-page');
    if (!page) return;

    var rawVars = [
      '--lb-bg','--lb-text','--lb-text-secondary','--lb-text-muted',
      '--lb-border','--lb-border-color','--lb-card-bg','--lb-card-text','--lb-card-border','--lb-card-shadow',
      '--lb-input-bg','--lb-input-text','--lb-input-border','--lb-input-hover-bg','--lb-input-hover-text','--lb-input-hover-border',
      '--lb-select-bg','--lb-select-text','--lb-select-border','--lb-select-hover-bg','--lb-select-hover-text','--lb-select-hover-border',
      '--lb-btn-bg','--lb-btn-text','--lb-btn-border','--lb-btn-hover-bg','--lb-btn-hover-text','--lb-btn-hover-border',
      '--lb-active-bg','--lb-active-text','--lb-primary','--lb-primary-hover','--lb-btn-primary-bg','--lb-btn-primary-text',
      '--lb-header-btn-bg','--lb-header-btn-text','--lb-header-btn-hover-bg','--lb-header-btn-hover-text',
      '--lb-table-bg','--lb-table-row-bg','--lb-table-header-bg','--lb-table-header-text','--lb-table-border','--lb-table-border-color','--lb-table-cell-text','--lb-table-row-hover-bg','--lb-table-row-hover-text',
      '--lb-sidebar-bg','--lb-sidebar-text','--lb-sidebar-link-radius','--lb-sidebar-active-bg','--lb-sidebar-active-text','--lb-sidebar-link-hover-bg','--lb-sidebar-link-hover-text',
      '--lb-slider-active-bg','--lb-slider-fill-bg','--lb-range-active-bg','--lb-slider-bg','--lb-slider-track-bg','--lb-range-track-bg','--lb-slider-thumb-bg','--lb-slider-thumb-border-color','--lb-slider-thumb-border-width','--lb-slider-thumb-border','--lb-slider-thumb-shadow','--lb-slider-thumb-hover-shadow','--lb-slider-focus-shadow','--lb-slider-compact-active-bg','--lb-slider-compact-bg','--lb-slider-compact-thumb-bg','--lb-slider-compact-thumb-border',
      '--lb-radius','--lb-radius-sm','--lb-btn-radius','--lb-card-radius','--lb-radius-card','--lb-table-radius','--lb-focus-ring','--lb-focus-ring-strong'
    ];
    rawVars.forEach(function (name) { page.style.removeProperty(name); });

    var studioVars = [
      '--cfw-studio-bg','--cfw-studio-text','--cfw-studio-panel-bg','--cfw-studio-panel-text','--cfw-studio-panel-border',
      '--cfw-studio-control-bg','--cfw-studio-control-text','--cfw-studio-control-border',
      '--cfw-studio-button-bg','--cfw-studio-button-text','--cfw-studio-button-border',
      '--cfw-studio-active-bg','--cfw-studio-active-text','--cfw-studio-tab-bg','--cfw-studio-tab-active-bg','--cfw-studio-range-accent'
    ];
    studioVars.forEach(function (name) { page.style.removeProperty(name); });
    page.classList.remove('cfw-theme-applied');
  }

  function embeddedPreviewUsesPackageCssOnly() {
    var id = themeId && themeId.value ? themeId.value : currentStudioThemeId();
    return isProtectedStudioThemeId(id);
  }

  function clearEmbeddedPreviewWorkingState(doc) {
    if (!doc) return;
    var style = doc.getElementById('cfwStudioWorkingThemeStyle');
    if (style && style.parentNode) style.parentNode.removeChild(style);
    [doc.documentElement, doc.body].forEach(function (node) {
      if (!node) return;
      node.style.removeProperty('--cfw-studio-wallpaper-image');
      node.style.removeProperty('--cfw-studio-wallpaper-brightness');
      node.style.removeProperty('--cfw-studio-wallpaper-opacity');
    });
  }

  function syncEmbeddedPreviewDocument(tokens) {
    var frame = document.getElementById('cfwPreviewFrame');
    if (!frame || !frame.contentWindow) return false;
    try {
      var doc = frame.contentDocument || frame.contentWindow.document;
      if (doc && doc.body && themeId && /^[a-z0-9][a-z0-9-]{0,63}$/.test(themeId.value)) {
        Array.from(doc.body.classList).filter(function (name) { return name.indexOf('theme-') === 0; }).forEach(function (name) { doc.body.classList.remove(name); });
        doc.body.classList.add('theme-' + themeId.value);
      }
      if (!doc || !doc.documentElement) return false;

      if (embeddedPreviewUsesPackageCssOnly()) {
        clearEmbeddedPreviewWorkingState(doc);
        return true;
      }

      var style = doc.getElementById('cfwStudioWorkingThemeStyle');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'cfwStudioWorkingThemeStyle';
        (doc.head || doc.documentElement).appendChild(style);
      }
      var declarations = Object.keys(tokens || {}).filter(function (name) {
        return /^--lb-[a-z0-9-]+$/i.test(name);
      }).map(function (name) {
        return name + ':' + String(tokens[name]).replace(/[;}]/g, '') + ' !important';
      }).join(';');
      var extraCss = customCss ? normalizeCustomCssValue(customCss.value || '') : '';
      style.textContent = ':root,html,body{' + declarations + ';}' + (extraCss ? '\n' + extraCss : '');
      frame.contentWindow.dispatchEvent(new frame.contentWindow.Event('cfw:tokens-updated'));
      frame.contentWindow.dispatchEvent(new frame.contentWindow.Event('cfw:tokens-updated'));

      var wallpaper = buildWallpaperPayload();
      [doc.documentElement, doc.body].forEach(function (node) {
        if (!node) return;
        node.style.setProperty('--cfw-studio-wallpaper-image', wallpaper && wallpaper.image ? 'url("' + wallpaperPreviewUrl(wallpaper.image).replace(/"/g, '%22') + '")' : 'none');
        node.style.setProperty('--cfw-studio-wallpaper-brightness', String((wallpaper && wallpaper.brightness != null ? wallpaper.brightness : 100) / 100));
        node.style.setProperty('--cfw-studio-wallpaper-opacity', String((wallpaper && wallpaper.opacity != null ? wallpaper.opacity : 100) / 100));
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function broadcastEmbeddedFrameTokens(tokens) {
    tokens = tokens || {};
    var packageCssOnly = embeddedPreviewUsesPackageCssOnly();
    var outboundTokens = packageCssOnly ? {} : tokens;
    var outboundWallpaper = packageCssOnly ? null : buildWallpaperPayload();
    var outboundCustomCss = packageCssOnly ? '' : (customCss ? normalizeCustomCssValue(customCss.value || '') : '');

    if (themeState && typeof themeState.update === 'function') {
      themeState.update({
        themeId: themeId ? themeId.value : '',
        themeName: themeName ? themeName.value : '',
        version: themeVersion ? themeVersion.value : '',
        tokens: outboundTokens,
        customCss: outboundCustomCss,
        wallpaper: outboundWallpaper,
        dirty: true
      }, { source: 'design-studio.preview' });
    } else {
      var payload = {
        type: 'CFW_STUDIO_TOKENS',
        tokens: outboundTokens,
        wallpaper: outboundWallpaper
      };
      var frame = document.getElementById('cfwPreviewFrame');
      if (frame && frame.contentWindow) {
        try { frame.contentWindow.postMessage(payload, window.location.origin); } catch (e) {}
      }
    }

    syncEmbeddedPreviewDocument(tokens);
  }

  function updatePreviewRangeFills() {
    if (!previewRoot) return;
    previewRoot.querySelectorAll('.cfw-range').forEach(function (range) {
      var min = parseFloat(range.min || '0');
      var max = parseFloat(range.max || '100');
      var value = parseFloat(range.value || '0');
      var pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
      range.style.setProperty('--lb-slider-fill', clamp(pct, 0, 100) + '%');
    });
  }

  function applyTokensToPreviewRoot(tokens) {
    if (previewRoot) {
      Array.from(previewRoot.classList).filter(function (name) { return name.indexOf('theme-') === 0; }).forEach(function (name) { previewRoot.classList.remove(name); });
      if (themeId && /^[a-z0-9][a-z0-9-]{0,63}$/.test(themeId.value)) previewRoot.classList.add('theme-' + themeId.value);
    }
    if (!previewRoot) return;
    tokens = tokens || {};
    appliedPreviewVars.forEach(function (name) { previewRoot.style.removeProperty(name); });
    clearPreviewBridgeVars(previewRoot);
    appliedPreviewVars = Object.keys(tokens);
    appliedPreviewVars.forEach(function (name) { previewRoot.style.setProperty(name, tokens[name]); });
    applyWallpaperPreview();
    applyPreviewFallbacks(tokens);
    updatePreviewRangeFills();
  }

  function updatePreview() {
    if (!previewRoot) return;
    var tokens = effectivePreviewTokens();
    applyTokensToPreviewRoot(tokens);
    broadcastEmbeddedFrameTokens(tokens);
    applyStudioTheme(tokens);
    mappedTokenCount.textContent = Object.keys(tokens).filter(function (name) { return /^--lb-/.test(name); }).length;
    previewCaption.textContent = selectionPathLabel(currentArea(), currentElement(), currentGroup());
  }

  function updatePreviewStateClasses() {
    if (!previewRoot) return;
    var isSidebarHoverTarget = currentArea() === 'Layout'
      && currentElement() === 'Sidebar EintrÃ¤ge'
      && /^Hover/.test(currentGroup());
    var isTableTarget = currentArea() === 'tabellen';
    var isTableHoverTarget = isTableTarget && /^Hover/.test(currentGroup());
    previewRoot.classList.toggle('cfw-preview-show-sidebar-hover', !!isSidebarHoverTarget);
    previewRoot.classList.toggle('cfw-preview-show-table-target', !!isTableTarget);
    previewRoot.classList.toggle('cfw-preview-show-table-hover', !!isTableHoverTarget);
  }

  function refreshPreviewAndPalette() {
    updatePreviewStateClasses();
    updatePreview();
    renderPalette();
  }

  function updateAll(saveCurrent, field) {
    if (saveCurrent && saveControlsToEntry(field) === false) return;
    updateLabels();
    renderPropertyInspector();
    refreshPreviewAndPalette();
  }

  function openSaveModal() {
    updateThemeIdentityFromName();
    if (themeId && isReadOnlyProtectedStudioThemeId(themeId.value)) {
      setStatus(protectedStudioThemeMessage(themeId.value), true);
      return;
    }
    if (themeId && isLiquidGlassThemeId(themeId.value) && !isProtectedStudioWallpaperOnlySave()) {
      setStatus(protectedStudioThemeMessage(themeId.value), true);
      return;
    }
    saveModal.hidden = false;
  }
  function closeSaveModal() { saveModal.hidden = true; }

  function normalizeCustomCssValue(value) {
    return typeof value === 'string' ? value.replace(/\/\*\s*USER CUSTOM CSS (START|END)\s*\*\//ig, '').trim() : '';
  }

  function meaningfulCustomCss(value) {
    var text = String(value || '')
      .replace(/\/\*\s*USER CUSTOM CSS START\s*\*\//ig, '')
      .replace(/\/\*\s*USER CUSTOM CSS END\s*\*\//ig, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    return text;
  }

  var validationModal = document.getElementById('validationModal');
  var validationSummary = document.getElementById('validationSummary');
  var validationIssueList = document.getElementById('validationIssueList');
  var validationCancelButton = document.getElementById('validationCancel');
  var validationSaveAnywayButton = document.getElementById('validationSaveAnyway');
  var validationAutoFixButton = document.getElementById('validationAutoFix');
  var validateThemeButton = document.getElementById('validateTheme');
  var pendingValidationSave = false;
  var lastValidationResult = null;

  function validatorSourceTokens() {
    var working = collectTokens() || {};
    return {
      working: working,
      merged: Object.assign({}, coreTokens || {}, working)
    };
  }

  function validatorResolved(source, names, preferWorking) {
    var merged = source && source.merged ? source.merged : (source || {});
    var working = source && source.working ? source.working : {};
    var i;

    if (preferWorking) {
      for (i = 0; i < names.length; i += 1) {
        if (!Object.prototype.hasOwnProperty.call(working, names[i])) continue;
        var preferredValue = normalizeHexColor(resolvedTokenValue(merged, names[i]));
        if (preferredValue) return { token: names[i], value: preferredValue };
      }
    }

    for (i = 0; i < names.length; i += 1) {
      var value = normalizeHexColor(resolvedTokenValue(merged, names[i]));
      if (value) return { token: names[i], value: value };
    }
    return null;
  }

  function validatorDedicatedResolved(source, names) {
    var merged = source && source.merged ? source.merged : (source || {});
    var working = source && source.working ? source.working : {};
    for (var i = 0; i < names.length; i += 1) {
      if (!Object.prototype.hasOwnProperty.call(working, names[i])) continue;
      var value = normalizeHexColor(resolvedTokenValue(merged, names[i]));
      if (value) return { token: names[i], value: value };
    }
    return null;
  }

  function validatorComponentContracts() {
    return [
      { area:'page', state:'normal', bg:['--lb-bg'], text:['--lb-text'], target:'--lb-text', min:4.5 },
      { area:'page', state:'secondary', bg:['--lb-bg'], text:['--lb-text-secondary','--lb-text'], target:'--lb-text-secondary', min:4.5 },
      { area:'page', state:'muted', bg:['--lb-bg'], text:['--lb-text-muted','--lb-text-secondary'], target:'--lb-text-muted', min:3.0 },

      { area:'card', state:'normal', bg:['--lb-card-bg','--lb-bg'], text:['--lb-card-text','--lb-text'], target:'--lb-card-text', min:4.5 },
      { area:'input', state:'normal', bg:['--lb-input-bg','--lb-card-bg'], text:['--lb-input-text','--lb-text'], target:'--lb-input-text', min:4.5 },
      { area:'input', state:'hover', bg:['--lb-input-hover-bg','--lb-input-bg','--lb-card-bg'], text:['--lb-input-hover-text','--lb-input-text'], target:'--lb-input-hover-text', min:4.5 },
      { area:'input', state:'placeholder', bg:['--lb-input-bg','--lb-card-bg'], text:['--lb-input-placeholder-text','--lb-input-text'], target:'--lb-input-placeholder-text', min:4.5 },
      { area:'input', state:'disabled', bg:['--lb-input-disabled-bg','--lb-input-bg','--lb-card-bg'], text:['--lb-input-disabled-text','--lb-input-text'], target:'--lb-input-disabled-text', min:4.5 },
      { area:'input', state:'disabledPlaceholder', bg:['--lb-input-disabled-bg','--lb-input-bg','--lb-card-bg'], text:['--lb-input-disabled-placeholder-text','--lb-input-placeholder-text','--lb-input-disabled-text'], target:'--lb-input-disabled-placeholder-text', min:4.5 },
      { area:'textarea', state:'normal', bg:['--lb-textarea-bg','--lb-input-bg','--lb-card-bg'], text:['--lb-textarea-text','--lb-input-text'], target:'--lb-textarea-text', min:4.5 },

      { area:'button', state:'normal', bg:['--lb-btn-bg','--lb-card-bg'], text:['--lb-btn-text','--lb-text'], target:'--lb-btn-text', min:4.5 },
      { area:'button', state:'hover', bg:['--lb-btn-hover-bg','--lb-btn-bg'], text:['--lb-btn-hover-text','--lb-btn-text'], target:'--lb-btn-hover-text', min:4.5 },
      { area:'primaryButton', state:'normal', bg:['--lb-btn-primary-bg','--lb-primary'], text:['--lb-btn-primary-text','--lb-on-primary'], target:'--lb-btn-primary-text', min:4.5 },
      { area:'primaryButton', state:'hover', bg:['--lb-btn-primary-hover-bg','--lb-primary-hover','--lb-btn-primary-bg'], text:['--lb-btn-primary-hover-text','--lb-btn-primary-text','--lb-on-primary'], target:'--lb-btn-primary-hover-text', min:4.5 },

      { area:'buttonGroup', state:'inactive', bg:['--lb-btn-group-inactive-bg','--lb-btn-bg'], text:['--lb-btn-group-inactive-text','--lb-btn-text'], target:'--lb-btn-group-inactive-text', min:4.5 },
      { area:'buttonGroup', state:'hover', bg:['--lb-btn-group-hover-bg','--lb-btn-hover-bg','--lb-btn-group-inactive-bg'], text:['--lb-btn-group-hover-text','--lb-btn-hover-text','--lb-btn-group-inactive-text'], target:'--lb-btn-group-hover-text', min:4.5 },
      { area:'buttonGroup', state:'active', bg:['--lb-btn-group-active-bg','--lb-active-bg','--lb-primary'], text:['--lb-btn-group-active-text','--lb-active-text','--lb-btn-primary-text'], target:'--lb-btn-group-active-text', min:4.5 },
      { area:'buttonGroup', state:'activeHover', bg:['--lb-btn-group-active-hover-bg','--lb-primary-hover','--lb-btn-group-active-bg'], text:['--lb-btn-group-active-hover-text','--lb-btn-group-active-text','--lb-active-text'], target:'--lb-btn-group-active-hover-text', min:4.5 },

      { area:'checkbox', state:'label', bg:['--lb-checkbox-group-bg','--lb-bg'], text:['--lb-checkbox-text','--lb-text'], target:'--lb-checkbox-text', min:4.5 },
      { area:'checkbox', state:'checkedSymbol', bg:['--lb-checkbox-checked-bg','--lb-active-bg','--lb-primary'], text:['--lb-checkbox-checkmark-text','--lb-active-text','--lb-btn-primary-text'], target:'--lb-checkbox-checkmark-text', min:3.0 },
      { area:'radio', state:'label', bg:['--lb-radio-group-bg','--lb-bg'], text:['--lb-radio-text','--lb-text'], target:'--lb-radio-text', min:4.5 },
      { area:'radio', state:'checkedDot', bg:['--lb-radio-checked-bg','--lb-active-bg','--lb-primary'], text:['--lb-radio-dot-bg','--lb-active-text','--lb-btn-primary-text'], target:'--lb-radio-dot-bg', min:3.0 },

      { area:'jqmToggle', state:'on', switchState:'on', bg:['--lb-switch-on-bg','--lb-toggle-active-bg','--lb-active-bg','--lb-primary','--lb-btn-primary-bg'], text:['--lb-switch-on-text','--lb-toggle-active-text','--lb-active-text','--lb-btn-primary-text','--lb-on-primary'], target:'--lb-switch-on-text', aliasTarget:'--lb-toggle-active-text', min:4.5, preferWorking:true, semanticText:true, requireDedicated:true },
      { area:'jqmToggle', state:'off', switchState:'off', bg:['--lb-switch-off-bg','--lb-toggle-bg','--lb-btn-bg','--lb-card-bg','--lb-bg'], text:['--lb-switch-off-text','--lb-toggle-text','--lb-btn-text','--lb-text'], target:'--lb-switch-off-text', aliasTarget:'--lb-toggle-text', min:4.5, preferWorking:true, semanticText:true, requireDedicated:true },

      { area:'select', state:'normal', bg:['--lb-select-bg','--lb-input-bg'], text:['--lb-select-text','--lb-input-text'], target:'--lb-select-text', min:4.5 },
      { area:'select', state:'hover', bg:['--lb-select-hover-bg','--lb-select-bg'], text:['--lb-select-hover-text','--lb-select-text'], target:'--lb-select-hover-text', min:4.5 },
      { area:'select', state:'menu', bg:['--lb-select-menu-bg','--lb-select-bg'], text:['--lb-select-menu-text','--lb-select-text'], target:'--lb-select-menu-text', min:4.5 },
      { area:'select', state:'option', bg:['--lb-select-option-bg','--lb-select-menu-bg'], text:['--lb-select-option-text','--lb-select-menu-text'], target:'--lb-select-option-text', min:4.5 },
      { area:'select', state:'optionHover', bg:['--lb-select-option-hover-bg','--lb-select-hover-bg'], text:['--lb-select-option-hover-text','--lb-select-hover-text'], target:'--lb-select-option-hover-text', min:4.5 },
      { area:'nativeSelect', state:'normal', bg:['--lb-native-select-bg','--lb-input-bg'], text:['--lb-native-select-text','--lb-input-text'], target:'--lb-native-select-text', min:4.5 },
      { area:'multiselect', state:'summary', bg:['--lb-multiselect-summary-bg','--lb-multiselect-bg','--lb-input-bg'], text:['--lb-multiselect-text','--lb-input-text'], target:'--lb-multiselect-text', min:4.5 },
      { area:'multiselect', state:'menu', bg:['--lb-dropdown-menu-bg','--lb-select-menu-bg','--lb-input-bg'], text:['--lb-dropdown-menu-text','--lb-select-menu-text','--lb-input-text'], target:'--lb-dropdown-menu-text', min:4.5 },

      { area:'sidebar', state:'normal', bg:['--lb-sidebar-bg'], text:['--lb-sidebar-text','--lb-text'], target:'--lb-sidebar-text', min:4.5 },
      { area:'sidebar', state:'hover', bg:['--lb-sidebar-link-hover-bg','--lb-sidebar-hover-bg','--lb-sidebar-bg'], text:['--lb-sidebar-link-hover-text','--lb-sidebar-hover-text','--lb-sidebar-text'], target:'--lb-sidebar-link-hover-text', min:4.5 },
      { area:'sidebar', state:'active', bg:['--lb-sidebar-active-bg','--lb-primary'], text:['--lb-sidebar-active-text','--lb-sidebar-text'], target:'--lb-sidebar-active-text', min:4.5 },
      { area:'header', state:'normal', bg:['--lb-header-bg','--lb-sidebar-bg'], text:['--lb-header-text','--lb-sidebar-text'], target:'--lb-header-text', min:4.5 },
      { area:'headerButton', state:'normal', bg:['--lb-header-btn-bg','--lb-header-bg'], text:['--lb-header-btn-text','--lb-header-text'], target:'--lb-header-btn-text', min:3.0 },
      { area:'headerButton', state:'hover', bg:['--lb-header-btn-hover-bg','--lb-header-btn-bg'], text:['--lb-header-btn-hover-text','--lb-header-btn-text'], target:'--lb-header-btn-hover-text', min:3.0 },

      { area:'modal', state:'normal', bg:['--lb-modal-bg','--lb-card-bg'], text:['--lb-modal-text','--lb-text'], target:'--lb-modal-text', min:4.5 },
      { area:'tooltip', state:'normal', bg:['--lb-tooltip-bg','--lb-primary-hover'], text:['--lb-tooltip-text','--lb-on-primary'], target:'--lb-tooltip-text', min:4.5 },
      { area:'note', state:'normal', bg:['--lb-note-bg','--lb-card-bg'], text:['--lb-note-text','--lb-card-text','--lb-text'], target:'--lb-note-text', min:4.5 },
      { area:'success', state:'normal', bg:['--lb-success-bg'], text:['--lb-success-text','--lb-text'], target:'--lb-success-text', min:4.5 },
      { area:'warning', state:'normal', bg:['--lb-warning-bg'], text:['--lb-warning-text','--lb-text'], target:'--lb-warning-text', min:4.5 },
      { area:'error', state:'normal', bg:['--lb-error-bg'], text:['--lb-error-text','--lb-text'], target:'--lb-error-text', min:4.5 },
      { area:'notify', state:'normal', bg:['--lb-notify-bg','--lb-success-bg'], text:['--lb-notify-text','--lb-success-text','--lb-text'], target:'--lb-notify-text', min:4.5 },

      { area:'table', state:'body', bg:['--lb-table-cell-bg','--lb-table-row-bg','--lb-table-body-bg','--lb-table-bg'], text:['--lb-table-cell-text','--lb-table-row-text','--lb-table-text','--lb-text'], target:'--lb-table-cell-text', min:4.5 },
      { area:'table', state:'header', bg:['--lb-table-header-bg','--lb-table-bg'], text:['--lb-table-header-text','--lb-table-text'], target:'--lb-table-header-text', min:4.5 },
      { area:'table', state:'hover', bg:['--lb-table-row-hover-bg','--lb-table-hover-bg','--lb-table-row-bg'], text:['--lb-table-row-hover-text','--lb-table-hover-text','--lb-table-row-text'], target:'--lb-table-row-hover-text', min:4.5 },
      { area:'compactTable', state:'body', bg:['--lb-table-compact-bg','--lb-table-bg'], text:['--lb-table-compact-text','--lb-table-text'], target:'--lb-table-compact-text', min:4.5 },
      { area:'compactTable', state:'header', bg:['--lb-table-compact-header-bg','--lb-table-header-bg'], text:['--lb-table-compact-header-text','--lb-table-header-text'], target:'--lb-table-compact-header-text', min:4.5 },
      { area:'compactTable', state:'hover', bg:['--lb-table-compact-hover-bg','--lb-table-hover-bg'], text:['--lb-table-compact-hover-text','--lb-table-hover-text'], target:'--lb-table-compact-hover-text', min:4.5 },

      { area:'active', state:'normal', bg:['--lb-active-bg','--lb-primary'], text:['--lb-active-text','--lb-on-primary'], target:'--lb-active-text', min:4.5 },
      { area:'sliderValue', state:'normal', bg:['--lb-slider-value-bg','--lb-primary'], text:['--lb-slider-value-text','--lb-on-primary'], target:'--lb-slider-value-text', min:4.5 }
    ];
  }

  function validationSeverity(ratio, minimum) {
    if (ratio < 3.0) return 'error';
    if (ratio < minimum) return 'warning';
    return 'info';
  }

  function validatorBinaryText(background) {
    var black = '#000000';
    var white = '#ffffff';
    var blackRatio = contrastRatioForColors(black, background) || 0;
    var whiteRatio = contrastRatioForColors(white, background) || 0;
    return blackRatio >= whiteRatio ? black : white;
  }

  function validateThemeTokens() {
    var tokens = validatorSourceTokens();
    var pairs = validatorComponentContracts();
    var issues = [];
    var checked = 0;
    pairs.forEach(function (pair) {
      var switchContract = pair.switchState ? switchTextContract(tokens.working || {}, pair.switchState) : null;
      var bg = switchContract ? switchContract.background : validatorResolved(tokens, pair.bg, !!pair.preferWorking);
      var text = switchContract
        ? switchContract.dedicated
        : (pair.requireDedicated
          ? validatorDedicatedResolved(tokens, [pair.target, pair.aliasTarget].filter(Boolean))
          : validatorResolved(tokens, pair.text, !!pair.preferWorking));
      if (!bg) return;

      checked += 1;
      var missingDedicated = !!pair.requireDedicated && (
        !Object.prototype.hasOwnProperty.call(tokens.working || {}, pair.target) ||
        (pair.aliasTarget && !Object.prototype.hasOwnProperty.call(tokens.working || {}, pair.aliasTarget))
      );
      var fallbackText = text || validatorResolved(tokens, pair.text, !!pair.preferWorking);
      var ratio = switchContract
        ? (switchContract.ratio == null ? 0 : switchContract.ratio)
        : (text ? contrastRatioForColors(text.value, bg.value) : 0);
      if (!missingDedicated && text && ratio + 0.001 >= pair.min && !(switchContract && switchContract.semanticMismatch)) return;

      var suggestion;
      if (pair.semanticText) {
        suggestion = switchContract ? switchContract.suggestion : switchSemanticText(bg.value);
      } else {
        suggestion = validatorBinaryText(bg.value);
      }
      var currentValue = fallbackText ? fallbackText.value : '';
      var currentRatio = 0;
      if (fallbackText) {
        currentRatio = pair.switchState
          ? (renderedTextContrastRatio(currentValue, bg.value) || 0)
          : (contrastRatioForColors(currentValue, bg.value) || 0);
      }

      var normalizedCurrent = normalizeHexColor(currentValue);
      var normalizedSuggestion = normalizeHexColor(suggestion);
      var suggestedRatioValue = pair.switchState
        ? (renderedTextContrastRatio(suggestion, bg.value) || 0)
        : (contrastRatioForColors(suggestion, bg.value) || 0);
      if (!missingDedicated && normalizedCurrent && normalizedSuggestion === normalizedCurrent && suggestedRatioValue <= currentRatio + 0.001) return;

      issues.push({ area:pair.area, state:pair.state,
        severity:(missingDedicated || (switchContract && switchContract.semanticMismatch)) ? 'warning' : validationSeverity(ratio, pair.min),
        backgroundToken:bg.token, background:bg.value,
        textToken:pair.target, aliasTextToken:pair.aliasTarget || '',
        targets:[pair.target].concat(pair.aliasTarget ? [pair.aliasTarget] : []),
        currentToken:fallbackText ? fallbackText.token : '',
        current:currentValue || '\u2014',
        missingDedicated:missingDedicated,
        suggested:suggestion, ratio:currentRatio || 0,
        suggestedRatio:suggestedRatioValue, minimum:pair.min });
    });
    var counts = { error:0, warning:0, info:0 };
    issues.forEach(function (issue) { counts[issue.severity] += 1; });
    return { checked:checked, issues:issues, counts:counts };
  }

  function escapeValidationHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function closeValidationModal() {
    if (validationModal) validationModal.hidden = true;
    pendingValidationSave = false;
  }

  function showValidationResult(result, forSave) {
    lastValidationResult = result;
    if (validationAutoFixButton) validationAutoFixButton.disabled = false;
    pendingValidationSave = !!forSave;
    if (!result.issues.length) {
      setStatus(t('VALIDATOR_SUMMARY_OK', 'VALIDATOR_SUMMARY_OK', { count:result.checked }), false);
      if (forSave) saveTheme(true);
      return;
    }
    validationSummary.textContent = t('VALIDATOR_SUMMARY_ISSUES', 'VALIDATOR_SUMMARY_ISSUES', { issues:result.issues.length, checks:result.checked, errors:result.counts.error, warnings:result.counts.warning });
    validationIssueList.innerHTML = result.issues.map(function (issue, index) {
      var area = tx('VALIDATOR_AREAS_' + issue.area);
      var state = tx('VALIDATOR_STATES_' + issue.state);
      var severity = tx('VALIDATOR_SEVERITY_' + issue.severity);
      return '<label class="cfw-validation-item cfw-validation-' + escapeValidationHtml(issue.severity) + '">' +
        '<input type="checkbox" data-validation-index="' + index + '" checked data-role="none">' +
        '<span class="cfw-validation-item-body"><strong><span class="cfw-validation-severity">' + escapeValidationHtml(severity) + '</span> ' + escapeValidationHtml(area) + ' \u00b7 ' + escapeValidationHtml(state) + '</strong>' +
        '<span class="cfw-validation-token">' + escapeValidationHtml(issue.textToken + (issue.aliasTextToken ? ' / ' + issue.aliasTextToken : '')) + ' \u2194 ' + escapeValidationHtml(issue.backgroundToken) + ' \u00b7 ' + escapeValidationHtml(tx('VALIDATOR_MINIMUM')) + ' ' + issue.minimum.toFixed(1) + ':1</span>' +
        '<span class="cfw-validation-values"><span><i style="background:' + escapeValidationHtml(issue.current) + '"></i>' + escapeValidationHtml(tx('VALIDATOR_CURRENT')) + ': ' + escapeValidationHtml(issue.current) + ' \u00b7 ' + escapeValidationHtml(tx('VALIDATOR_CONTRAST')) + ' ' + issue.ratio.toFixed(2) + ':1</span>' +
        '<span><i style="background:' + escapeValidationHtml(issue.suggested) + '"></i>' + escapeValidationHtml(tx('VALIDATOR_SUGGESTED')) + ': ' + escapeValidationHtml(issue.suggested) + ' \u00b7 ' + escapeValidationHtml(tx('VALIDATOR_CONTRAST')) + ' ' + issue.suggestedRatio.toFixed(2) + ':1</span></span></span></label>';
    }).join('');
    validationSaveAnywayButton.hidden = !forSave;
    validationModal.hidden = false;
  }

  function runThemeValidation(forSave) {
    showValidationResult(validateThemeTokens(), !!forSave);
  }

  function applySelectedValidationFixes() {
    if (!lastValidationResult) return;
    var selected = validationIssueList.querySelectorAll('input[data-validation-index]:checked');
    if (!selected.length) { setStatus(tx('VALIDATOR_NOTHING_SELECTED'), true); return; }

    pushUndoSnapshot('validation-fixes');
    var count = 0;
    selected.forEach(function (input) {
      var issue = lastValidationResult.issues[parseInt(input.getAttribute('data-validation-index'), 10)];
      if (!issue) return;
      (issue.targets && issue.targets.length ? issue.targets : [issue.textToken]).forEach(function (token) {
        if (token) directTokenOverrides[token] = issue.suggested;
      });
      count += 1;
    });

    refreshPreviewAndPalette();
    renderPropertyInspector();
    updateDirtyState();
    setStatus(t('VALIDATOR_FIXED', 'VALIDATOR_FIXED', { count:count }), false);

    var shouldSave = pendingValidationSave;
    validationModal.hidden = true;
    pendingValidationSave = false;
    lastValidationResult = null;
    if (validationAutoFixButton) validationAutoFixButton.disabled = false;

    if (shouldSave) saveTheme(true);
  }

  function saveTheme(skipValidation) {
    updateThemeIdentityFromName();
    if (themeId && isReadOnlyProtectedStudioThemeId(themeId.value)) {
      setStatus(protectedStudioThemeMessage(themeId.value), true);
      return;
    }

    var protectedWallpaperOnly = isWallpaperOnlyTheme();
    if (!skipValidation && !protectedWallpaperOnly) {
      runThemeValidation(true);
      return;
    }
    var existingSelection = selectedUserThemeInfo();
    if (existingSelection && existingSelection.theme.type === 'user' && !updateDirtyState()) {
      closeSaveModal();
      setStatus(tx('MESSAGES_NO_CHANGES_TO_SAVE'), false);
      return;
    }
    var wallpaperPayload = buildWallpaperPayload();

    var effectiveTokens = protectedWallpaperOnly ? {} : syncTintedSurfaceTokens(applyDesignRules(persistSwitchTextTokensToWorkingState()));
    var effectiveCustomCss = protectedWallpaperOnly ? '' : normalizeCustomCssValue(customCss && customCss.value);
    if (!protectedWallpaperOnly && !Object.keys(effectiveTokens).filter(function (name) { return /^--lb-/.test(name); }).length && !meaningfulCustomCss(effectiveCustomCss) && !(wallpaperPayload.enabled && wallpaperPayload.image)) {
      setStatus(tx('messages.noSaveableContent'), true);
      return;
    }
    var payload = {
      id: themeId.value.trim(),
      name: normalizeThemeDisplayName(themeName.value),
      version: themeVersion.value.trim(),
      tokens: effectiveTokens,
      custom_css: effectiveCustomCss,
      studio_model: protectedWallpaperOnly ? {} : studioModel,
      import_meta: protectedWallpaperOnly ? null : lastImportMeta,
      wallpaper: wallpaperPayload,
      protected_wallpaper_only: protectedWallpaperOnly,
      studio_version: '4.0.1.22',
      lang: i18nLanguage
    };
    setStatus(tx('MESSAGES_SAVING_THEME'), false);
    var selectedSource = selectedUserThemeInfo();
    payload.revision = selectedSource && selectedSource.theme.id === payload.id ? (selectedSource.theme.revision || '') : '';
    fetch('theme-save.cgi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-LoxBerry-Studio': '1' },
      body: JSON.stringify(payload)
    })
      .then(function (response) { return response.json(); })
      .then(function (json) {
        if (!json.ok) throw new Error(localizedServerError(json, 'MESSAGES_SAVE_FAILED'));
        closeSaveModal();
        payload.id = json.id || payload.id;
        payload.name = json.name || payload.name;
        payload.version = json.version || payload.version;
        payload.revision = json.revision || '';
        payload.type = 'user';

        if (json.tokens && typeof json.tokens === 'object') {
          payload.tokens = enforceForcedOpaqueTokens(Object.assign({}, json.tokens));
          workingTokens = Object.assign({}, payload.tokens);
          directTokenOverrides = {};
          syncCurrentControlsFromTokens(workingTokens);
          refreshPreviewAndPalette();
          renderPropertyInspector();
        }
        if (json.wallpaper && typeof json.wallpaper === 'object') {
          payload.wallpaper = json.wallpaper;
          wallpaperState = {
            enabled: !!json.wallpaper.enabled,
            image: String(json.wallpaper.image || ''),
            brightness: parseFloat(json.wallpaper.brightness),
            opacity: parseFloat(json.wallpaper.opacity)
          };
          loadWallpaperStateToControls();
          updateWallpaperLabels();
          applyWallpaperPreview();
        }
        rememberSavedTheme(payload);
        resetHistory();
        markCurrentStateAsSaved();
        var msg = t('MESSAGES_THEME_SAVED', 'MESSAGES_THEME_SAVED', {
          theme: (json.name || payload.name),
          version: (json.version || payload.version),
          css: (json.css || tx('MESSAGES_CSS_NOT_REPORTED'))
        });
        if (json.previous_backup) msg += ' ' + t('MESSAGES_PREVIOUS_JSON_BACKUP', 'MESSAGES_PREVIOUS_JSON_BACKUP', { backup: json.previous_backup });
        setStatus(msg, false);
      })
      .catch(function (error) { setStatus(error.message, true); });
  }

  function extractThemeTokensFromCss(text) {
    var out = {};
    String(text || '').replace(/(--lb-[a-z0-9-]+)\s*:\s*([^;{}]+)\s*;/ig, function (_, name, value) {
      name = name.trim();
      value = String(value || '').trim();
      if (!/^--lb-[a-z0-9-]+$/.test(name)) return '';
      if (isBlockedToken(name)) return '';
      if (coreTokens[name] === undefined) return '';
      out[name] = value;
      return '';
    });
    return out;
  }

  function countCssRules(text) {
    var stripped = String(text || '').replace(/\/\*[\s\S]*?\*\//g, '');
    var matches = stripped.match(/[^{}]+\{[^{}]*\}/g);
    return matches ? matches.length : 0;
  }

  function extractCssEffects(text) {
    var css = String(text || '');
    var effects = {
      blur: [],
      backdropFilter: /backdrop-filter\s*:/i.test(css) || /-webkit-backdrop-filter\s*:/i.test(css),
      transparency: [],
      wallpaper: /background(?:-image)?\s*:[^;]*url\s*\(/i.test(css),
      shadows: /box-shadow\s*:/i.test(css),
      customProperties: []
    };
    css.replace(/blur\(([^)]+)\)/ig, function (_, value) {
      value = String(value || '').trim();
      if (value && effects.blur.indexOf(value) < 0) effects.blur.push(value);
      return '';
    });
    css.replace(/rgba?\(([^)]+)\)/ig, function (_, value) {
      var parts = String(value || '').split(',').map(function (part) { return part.trim(); });
      if (parts.length === 4 && effects.transparency.indexOf(parts[3]) < 0) effects.transparency.push(parts[3]);
      return '';
    });
    css.replace(/(--[a-z0-9-]+)\s*:/ig, function (_, name) {
      name = String(name || '').trim();
      if (name && effects.customProperties.indexOf(name) < 0) effects.customProperties.push(name);
      return '';
    });
    return effects;
  }

  function classifyCssImport(text, filename) {
    var tokens = extractThemeTokensFromCss(text);
    var effects = extractCssEffects(text);
    var customRuleCount = countCssRules(text);
    return {
      mode: 'hybrid-tokens-plus-custom-css',
      file: filename || '',
      tokenCount: Object.keys(tokens).length,
      customRuleCount: customRuleCount,
      effects: effects,
      tokens: tokens,
      customCssPreserved: true
    };
  }

  function importMetaHasVisibleContent(meta) {
    if (!meta) return false;
    if (meta.file) return true;
    if ((meta.tokenCount || 0) > 0) return true;
    if ((meta.customRuleCount || 0) > 0) return true;
    if (meta.customCssPreserved) return true;
    var effects = meta.effects || {};
    return !!(
      effects.backdropFilter ||
      effects.wallpaper ||
      effects.shadows ||
      (effects.blur && effects.blur.length) ||
      (effects.transparency && effects.transparency.length)
    );
  }

  function hideImportSummary() {
    if (!importSummary) return;
    importSummary.hidden = true;
    importSummary.innerHTML = '';
  }

  function renderImportSummary(meta) {
    if (!importSummary || !importMetaHasVisibleContent(meta)) {
      hideImportSummary();
      return;
    }
    var effectLabels = [];
    if (meta.effects && meta.effects.backdropFilter) effectLabels.push(tx('IMPORT_EFFECTS_BACKDROP_FILTER'));
    if (meta.effects && meta.effects.blur && meta.effects.blur.length) effectLabels.push(tx('IMPORT_EFFECTS_BLUR') + ' ' + meta.effects.blur.slice(0, 3).join(', '));
    if (meta.effects && meta.effects.transparency && meta.effects.transparency.length) effectLabels.push(tx('IMPORT_EFFECTS_TRANSPARENCY') + ' ' + meta.effects.transparency.slice(0, 3).join(', '));
    if (meta.effects && meta.effects.wallpaper) effectLabels.push(tx('IMPORT_EFFECTS_WALLPAPER'));
    if (meta.effects && meta.effects.shadows) effectLabels.push(tx('IMPORT_EFFECTS_SHADOWS'));
    importSummary.hidden = false;
    importSummary.innerHTML =
      '<strong>' + tx('IMPORT_SUMMARY_TITLE') + '</strong><br>' +
      t('IMPORT_SUMMARY_TOKENS', 'IMPORT_SUMMARY_TOKENS', { count: meta.tokenCount }) + '<br>' +
      t('IMPORT_SUMMARY_CUSTOM', 'IMPORT_SUMMARY_CUSTOM', { count: meta.customRuleCount }) + '<br>' +
      (effectLabels.length ? t('IMPORT_SUMMARY_EFFECTS', 'IMPORT_SUMMARY_EFFECTS', { effects: effectLabels.join(', ') }) : tx('IMPORT_SUMMARY_NO_EFFECTS'));
  }

  function importCss(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      pushUndoSnapshot('css-import');
      var text = String(reader.result || '');
      var meta = classifyCssImport(text, file.name);
      lastImportMeta = meta;

      customCss.value = '/* USER CUSTOM CSS START */\n' + text + '\n/* USER CUSTOM CSS END */';
      var count = meta.tokenCount;
      if (count) {
        studioModel = {};
        directTokenOverrides = {};
        activeDirectToken = '';
        workingTokens = Object.assign({}, workingTokens || {}, meta.tokens);
        syncCurrentControlsFromTokens(workingTokens);
        refreshPreviewAndPalette();
        setStatus(t('MESSAGES_HYBRID_CSS_IMPORTED', 'MESSAGES_HYBRID_CSS_IMPORTED', { file: file.name, tokens: count, rules: meta.customRuleCount }), false);
      } else {
        setStatus(t('MESSAGES_CSS_IMPORTED_NO_TOKENS', 'MESSAGES_CSS_IMPORTED_NO_TOKENS', { file: file.name }), false);
      }
      renderImportSummary(meta);
    };
    reader.onerror = function () { setStatus(tx('MESSAGES_CSS_READ_ERROR'), true); };
    reader.readAsText(file, 'utf-8');
  }

  function resetToNeutralNewTheme() {
    if (userThemeSelect) userThemeSelect.setAttribute('data-current-selection', '');
    resetHistory();
    forceNeutralNewTheme = true;
    studioModel = {};
    directTokenOverrides = {};
    activeDirectToken = '';
    workingTokens = {};
    importedCss = '';
    lastImportMeta = null;
    hasActiveEditorSelection = false;
    selectedComponentTarget = null;
    wallpaperState = { enabled: false, image: '', brightness: 100, opacity: 100 };

    if (themeId) themeId.value = '';
    if (themeName) themeName.value = tx('GLOBAL_COLOR_NEW_THEME');
    if (themeVersion) themeVersion.value = '0.1.0';
    if (customCss) customCss.value = tx('CUSTOM_CSS_DEFAULT_TEXT');
    if (wallpaperEnabled) wallpaperEnabled.checked = false;
    if (wallpaperImage) wallpaperImage.value = '';
    if (wallpaperBrightness) wallpaperBrightness.value = '100';
    if (wallpaperOpacity) wallpaperOpacity.value = '100';

    hideImportSummary();
    updateLiquidGlassPackagePreviewMode();
    updateLiquidGlassWallpaperEditorMode();
    updateWallpaperLabels();
    updateWallpaperControlVisibility();

    if (previewRoot) {
      appliedPreviewVars.forEach(function (name) { previewRoot.style.removeProperty(name); });
      appliedPreviewVars = [];
      previewRoot.querySelectorAll('.cfw-edit-highlight').forEach(function (node) { node.classList.remove('cfw-edit-highlight'); });
    }

    syncCurrentControlsFromTokens(neutralNewThemeTokens);
    applyTokensToPreviewRoot(neutralNewThemeTokens);
    broadcastEmbeddedFrameTokens(neutralNewThemeTokens);
    updateAll(false);
    refreshEmbeddedFrame('preview');
    refreshEmbeddedFrame('documentation');
    markCurrentStateAsSaved();
  }

  function populateUserThemeSelect() {
    if (!userThemeSelect) return;
    while (userThemeSelect.options.length > 1) userThemeSelect.remove(1);
    userThemes.forEach(function (theme, index) {
      if (!theme) return;
      if (theme.readonly_css_only || String(theme.version || '').toLowerCase() === 'css-only') return;
      var opt = document.createElement('option');
      opt.value = String(index);
      opt.disabled = theme.type === 'core';
      if (opt.disabled) opt.setAttribute('aria-disabled', 'true');
      var version = theme.version && String(theme.version).toLowerCase() !== 'css-only' ? ' (' + theme.version + ')' : '';
      opt.textContent = (theme.name || theme.id || ('Theme ' + (index + 1))) + version;
      userThemeSelect.appendChild(opt);
    });
    updateDeleteThemeButton();
  }

  function themeTokensFromJson(theme) {
    if (!theme || typeof theme !== 'object') return {};

    var tokens = {};
    Object.keys(theme.tokens || {}).forEach(function (name) {
      if (/^--lb-[a-z0-9-]+$/.test(name) && !isBlockedToken(name)) tokens[name] = theme.tokens[name];
    });
    return tokens;
  }

  function loadUserThemeByIndex(index) {
    if (index === '' || index == null) return;
    var theme = userThemes[Number(index)];
    if (!theme || theme.type === 'core') return;
    if (userThemeSelect) userThemeSelect.setAttribute('data-current-selection', String(index));
    forceNeutralNewTheme = false;
    resetHistory();

    studioModel = {};
    directTokenOverrides = {};
    activeDirectToken = '';
    workingTokens = enforceForcedOpaqueTokens(themeTokensFromJson(theme));

    syncSwitchTextTokens(workingTokens);
    importedCss = normalizeCustomCssValue(theme.custom_css || '');
    lastImportMeta = importMetaHasVisibleContent(theme.import_meta) ? theme.import_meta : null;

    if (themeId) themeId.value = theme.id;
    if (themeName) themeName.value = normalizeThemeDisplayName(theme.name || theme.id || 'User Theme');
    if (themeVersion) themeVersion.value = theme.version || '0.1.0';
    updateLiquidGlassPackagePreviewMode();
    setWallpaperFromTheme(theme);

    var loadedPreviewTokens = effectivePreviewTokens();
    if (customCss) customCss.value = importedCss || tx('CUSTOM_CSS_DEFAULT_TEXT');

    hasActiveEditorSelection = false;
    updateWallpaperControlVisibility();
    if (previewRoot) {
      appliedPreviewVars.forEach(function (name) { previewRoot.style.removeProperty(name); });
      appliedPreviewVars = [];
      previewRoot.querySelectorAll('.cfw-edit-highlight').forEach(function (node) { node.classList.remove('cfw-edit-highlight'); });
    }

    syncCurrentControlsFromTokens(workingTokens);
    applyTokensToPreviewRoot(loadedPreviewTokens);
    broadcastEmbeddedFrameTokens(loadedPreviewTokens);
    updateAll(false);
    if (lastImportMeta) {
      renderImportSummary(lastImportMeta);
    } else {
      hideImportSummary();
    }

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () {
        applyTokensToPreviewRoot(loadedPreviewTokens);
        broadcastEmbeddedFrameTokens(loadedPreviewTokens);
        updateAll(false);
      });
    } else {
      setTimeout(function () {
        applyTokensToPreviewRoot(loadedPreviewTokens);
        broadcastEmbeddedFrameTokens(loadedPreviewTokens);
        updateAll(false);
      }, 0);
    }

    updateLiquidGlassWallpaperEditorMode();
    reapplyLoadedWallpaperState();
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(reapplyLoadedWallpaperState);
    } else {
      setTimeout(reapplyLoadedWallpaperState, 0);
    }
    markCurrentStateAsSaved();
    setStatus(t('MESSAGES_USER_THEME_LOADED', 'MESSAGES_USER_THEME_LOADED', { theme: (theme.name || theme.id) }), false);
  }

  function rememberSavedTheme(payload) {
    if (!payload || !payload.id) return;
    var existing = userThemes.findIndex(function (theme) { return theme.id === payload.id; });
    var theme = {
      id: payload.id,
      name: payload.name || payload.id,
      version: payload.version || '0.1.0',
      revision: payload.revision || '', type: 'user', studio: { editable: true, deletable: true },
      tokens: payload.tokens || {},
      custom_css: normalizeCustomCssValue(payload.custom_css || ''),
      studio_model: payload.studio_model || {},
      wallpaper: payload.wallpaper || null,
      studio_version: payload.studio_version || 'V31_TokenLabelsSaveCssFix'
    };
    if (existing >= 0) userThemes[existing] = theme;
    else userThemes.push(theme);
    populateUserThemeSelect();
    if (userThemeSelect) {
      var idx = userThemes.findIndex(function (item) { return item.id === payload.id; });
      if (idx >= 0) { userThemeSelect.value = String(idx); userThemeSelect.setAttribute('data-current-selection', String(idx)); }
    }
    updateLiquidGlassWallpaperEditorMode();
  }

  function selectedUserThemeInfo() {
    if (!userThemeSelect || userThemeSelect.value === '') return null;
    var index = parseInt(userThemeSelect.value, 10);
    if (isNaN(index) || !userThemes[index]) return null;
    return { index: index, theme: userThemes[index] };
  }

  function updateDeleteThemeButton() {
    if (!deleteThemeButton) return;
    var selected = selectedUserThemeInfo();
    var blocked = !selected
      || !!(selected.theme && selected.theme.readonly_css_only)
      || !!(selected.theme && isProtectedStudioThemeId(selected.theme.id));
    deleteThemeButton.disabled = blocked;
  }

  function openDeleteModal() {
    var selected = selectedUserThemeInfo();
    if (!selected || !selected.theme || !selected.theme.id) {
      setStatus(tx('MESSAGES_DELETE_NO_THEME_SELECTED'), true);
      return;
    }
    if (isProtectedStudioThemeId(selected.theme.id)) {
      setStatus(protectedStudioThemeMessage(selected.theme.id), true);
      return;
    }
    if (selected.theme.readonly_css_only) {
      setStatus(tx('MESSAGES_DELETE_READONLY_THEME'), true);
      return;
    }
    pendingDeleteTheme = selected;
    if (deleteModal) deleteModal.hidden = false;
  }

  function closeDeleteModal() {
    pendingDeleteTheme = null;
    if (deleteModal) deleteModal.hidden = true;
  }

  function deleteSelectedTheme() {
    var selected = pendingDeleteTheme || selectedUserThemeInfo();
    if (!selected || !selected.theme || !selected.theme.id) {
      closeDeleteModal();
      setStatus(tx('MESSAGES_DELETE_NO_THEME_SELECTED'), true);
      return;
    }
    if (isProtectedStudioThemeId(selected.theme.id)) {
      closeDeleteModal();
      setStatus(protectedStudioThemeMessage(selected.theme.id), true);
      return;
    }
    var name = selected.theme.name || selected.theme.id;
    closeDeleteModal();
    setStatus(tx('MESSAGES_DELETING_THEME'), false);
    fetch('theme-delete.cgi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-LoxBerry-Studio': '1' },
      body: JSON.stringify({ id: selected.theme.id, revision: selected.theme.revision })
    })
      .then(function (response) { return response.json(); })
      .then(function (json) {
        if (!json.ok) throw new Error(localizedServerError(json, 'MESSAGES_DELETE_FAILED'));
        userThemes.splice(selected.index, 1);
        populateUserThemeSelect();
        if (userThemeSelect) userThemeSelect.value = '';
        updateDeleteThemeButton();
        setStatus(t('MESSAGES_THEME_DELETED', 'MESSAGES_THEME_DELETED', {
          theme: name,
          json: json.deleted_json ? tx('MAIN_COMMON_YES') : tx('MAIN_COMMON_NO'),
          css: json.deleted_css ? tx('MAIN_COMMON_YES') : tx('MAIN_COMMON_NO'),
          manifest: ''
        }), false);
      })
      .catch(function (error) { setStatus(error.message || String(error), true); });
  }

  function currentStudioThemeId() {
    var select = document.getElementById('userThemeSelect');
    if (!select || !select.value) return '';
    var index = parseInt(select.value, 10);
    var theme = !isNaN(index) && userThemes[index] ? userThemes[index] : null;
    return theme && theme.id ? theme.id : '';
  }

  function embeddedRendererSrc(tabName) {
    var page = tabName === 'preview' ? 'preview' : (tabName === 'documentation' ? 'help' : '');
    if (!page) return '';
    var src = '/admin/system/themes/preview.cgi?page=' + encodeURIComponent(page);
    var themeId = currentStudioThemeId();
    if (themeId) src += '&theme=' + encodeURIComponent(themeId);
    return src;
  }

  function refreshEmbeddedFrame(tabName) {
    var frame = tabName === 'preview' ? document.getElementById('cfwPreviewFrame') : (tabName === 'documentation' ? document.getElementById('cfwHelpFrame') : null);
    if (!frame) return;
    var nextSrc = embeddedRendererSrc(tabName);
    if (!nextSrc) return;
    if (frame.getAttribute('src') !== nextSrc) frame.setAttribute('src', nextSrc);
    if (tabName === 'preview') {
      setTimeout(function () { broadcastEmbeddedFrameTokens(effectivePreviewTokens()); }, 40);
      setTimeout(function () { broadcastEmbeddedFrameTokens(effectivePreviewTokens()); }, 180);
      setTimeout(function () { broadcastEmbeddedFrameTokens(effectivePreviewTokens()); }, 500);
    }
  }

  function switchTab(name) {
    document.querySelectorAll('.cfw-tab').forEach(function (button) { button.classList.toggle('is-active', button.getAttribute('data-cfw-tab') === name); });
    var panels = { cfwTabWorkbench:'workbench', cfwTabPreview:'preview', cfwTabWiki:'wiki', cfwTabDocumentation:'documentation' };
    document.querySelectorAll('.cfw-tab-panel').forEach(function (panel) { var active = panels[panel.id] === name; panel.hidden = !active; panel.classList.toggle('is-active', active); });
    refreshEmbeddedFrame(name);
  }

  function normalizeRadius(value, fallback) {
    value = String(value || '').trim().toLowerCase();
    if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(value)) return value;
    if (value === 'small' || value === 'klein') return '8px';
    if (value === 'large' || value === 'groÃŸ' || value === 'gross') return '18px';
    if (value === 'xlarge' || value === 'extra-large' || value === 'sehr groÃŸ' || value === 'sehr gross') return '24px';
    return fallback || '14px';
  }

  function normalizeBorderWidth(value, fallback) {
    value = String(value == null ? '' : value).trim().toLowerCase();
    if (/^\d+(\.\d+)?(px|rem|em)$/.test(value)) return value;
    if (/^\d+(\.\d+)?$/.test(value)) return value + 'px';
    if (value === 'none' || value === 'kein' || value === 'keine' || value === '0') return '0px';
    if (value === 'thin' || value === 'dÃ¼nn' || value === 'duenn') return '1px';
    if (value === 'medium' || value === 'mittel') return '2px';
    if (value === 'strong' || value === 'thick' || value === 'stark' || value === 'dick') return '3px';
    return fallback || '0px';
  }

  function normalizeShadow(value) {
    value = String(value || '').trim().toLowerCase();
    if (value === 'none' || value === 'kein' || value === 'keiner') return 'none';
    if (value === 'strong' || value === 'stark') return '0 16px 42px rgba(0,0,0,0.28)';
    return '0 10px 28px rgba(0,0,0,0.16)';
  }

  function colorValue(value, fallback) {
    value = String(value || '').trim();
    if (/^(#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\(|hsla?\()/i.test(value)) return value;
    return fallback || '';
  }

  function colorToPickerHex(value, fallback) {
    value = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    if (/^#[0-9a-f]{3}$/i.test(value)) return '#' + value.slice(1).split('').map(function (c) { return c + c; }).join('');
    var m = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return rgbToHex({ r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) });
    return fallback || '#007aff';
  }

  function tokenValueForMapping(tokens, mapping) {
    mapping = mapping || [];
    for (var i = 0; i < mapping.length; i++) {
      if (tokens[mapping[i]] != null && tokens[mapping[i]] !== '') return tokens[mapping[i]];
    }
    return '';
  }

  function radiusFromTokensForCurrentElement(tokens) {
    tokens = tokens || {};

    var radiusGroup = resolveRadiusGroupForCurrentElement();
    if (!radiusGroup) return null;

    var groups = elementGroups(currentArea(), currentElement());
    var radiusMapping = groups[radiusGroup] || [];
    var value = tokenValueForMapping(tokens, radiusMapping);

    if (!value) {
      value = tokens['--lb-radius-sm'] || tokens['--lb-radius'] || '';
    }

    var parsed = parseFloat(String(value || '').trim());
    if (isNaN(parsed)) return null;

    return clamp(
      parsed,
      parseFloat((radiusRange && radiusRange.min) || 0),
      parseFloat((radiusRange && radiusRange.max) || 36)
    );
  }

  function syncCurrentControlsFromTokens(tokens) {
    tokens = tokens || {};

    var value = tokenValueForMapping(tokens, currentMapping());
    var loadedRadius = radiusFromTokensForCurrentElement(tokens);
    var currentEntry = null;

    if (value) {
      currentEntry = defaultEntry(false);
      currentEntry.color = colorToPickerHex(value, currentEntry.color);
      var alphaMatch = String(value).match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\s*\)/i);
      if (alphaMatch) currentEntry.alpha = Math.round(parseFloat(alphaMatch[1]) * 100);
      if (loadedRadius != null) currentEntry.radius = loadedRadius;
      currentEntry.dirty = false;
      studioModel[currentKey()] = currentEntry;
      loadEntryToControls(currentEntry);
    }

    if (loadedRadius != null) {
      var radiusGroup = resolveRadiusGroupForCurrentElement();
      if (radiusGroup) {
        var radiusKey = editorKey(currentArea(), currentElement(), radiusGroup);
        var radiusEntry = studioModel[radiusKey] || defaultEntry(false);
        radiusEntry.radius = loadedRadius;
        radiusEntry.dirty = false;
        studioModel[radiusKey] = radiusEntry;
      }

      if (radiusRange) radiusRange.value = loadedRadius;
      updateLabels();
    }
  }

  function mixColor(hex, percent) {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(hex || ''))) return hex;
    var rgb = hexToRgb(hex);
    var target = percent >= 0 ? 255 : 0;
    var p = Math.abs(percent) / 100;
    return rgbToHex({
      r: rgb.r + (target - rgb.r) * p,
      g: rgb.g + (target - rgb.g) * p,
      b: rgb.b + (target - rgb.b) * p
    });
  }

  function componentValue(component, names, fallback) {
    if (!component || typeof component !== 'object') return fallback || '';
    for (var i = 0; i < names.length; i++) {
      if (component[names[i]] != null && component[names[i]] !== '') return component[names[i]];
    }
    return fallback || '';
  }

  function parseHexColor(value) {
    value = String(value || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(value)) {
      value = '#' + value.slice(1).split('').map(function (c) { return c + c; }).join('');
    }
    if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
    return {
      r: parseInt(value.slice(1, 3), 16),
      g: parseInt(value.slice(3, 5), 16),
      b: parseInt(value.slice(5, 7), 16)
    };
  }

  function relativeLuminance(value) {
    var rgb = parseHexColor(value);
    if (!rgb) return null;
    function channel(v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  }

  function readableTextFor(background, light, dark) {
    var lum = relativeLuminance(background);
    if (lum == null) return dark || '#1f2d1f';
    return lum < 0.46 ? (light || '#f8fafc') : (dark || '#1f2d1f');
  }

  function normalizeDraftTokenName(name) {
    name = String(name || '').trim().replace(/[\u2013\u2014]/g, '-');

    name = name.replace(/^[\s*\u2022]+/, '');
    name = name.replace(/^-\s+-/, '--');
    name = name.replace(/^-\s+--/, '--');
    name = name.replace(/^[-*\s]+/, '');
    name = name.replace(/\s+/g, '');
    if (/^lb-[a-z0-9-]+$/i.test(name)) name = '--' + name;
    if (/^-lb-[a-z0-9-]+$/i.test(name)) name = '-' + name;
    return name;
  }

  function addDraftToken(out, name, value) {
    name = normalizeDraftTokenName(name);
    if (/^--lb-[a-z0-9-]+$/.test(name) && coreTokens[name] !== undefined && !isBlockedToken(name)) out[name] = value;
  }

  function syncTintedSurfaceTokens(tokens) {

    return tokens;
  }

  function compileSemanticDraftToTokens(draft) {
    var out = {};
    if (!draft || typeof draft !== 'object') return out;
    Object.keys(draft.tokens || {}).forEach(function (name) { addDraftToken(out, name, draft.tokens[name]); });
    var design = draft.design || {};
    var colors = design.colors || {};
    var palette = {};
    var primary = colorValue(colors.primary, palette.primary || '#2563eb');
    var primaryHover = colorValue(colors.primary_hover, palette.primaryHover || mixColor(primary, 10));
    var surface = colorValue(colors.surface, palette.surface || '#ffffff');
    var surfaceAlt = colorValue(colors.surface_alt, palette.surfaceAlt || mixColor(surface, -4));
    var bg = colorValue(colors.background, palette.bg || '#f7f7f7');
    var text = colorValue(colors.text, palette.text || readableTextFor(bg));
    var muted = colorValue(colors.muted_text, palette.muted || readableTextFor(bg, '#cbd5e1', '#525252'));
    var border = colorValue(colors.border, palette.border || '#d4d4d4');

    function put(names, value) {
      value = colorValue(value, value);
      if (!value) return;
      names.forEach(function (name) {
        if (coreTokens[name] !== undefined && !isBlockedToken(name)) out[name] = value;
      });
    }
    function putRaw(names, value) {
      if (!value) return;
      names.forEach(function (name) {
        if (coreTokens[name] !== undefined && !isBlockedToken(name)) out[name] = value;
      });
    }

    put(['--lb-primary', '--lb-btn-primary-bg', '--lb-active-bg', '--lb-focus-ring'], primary);
    put(['--lb-primary-hover', '--lb-btn-primary-hover-bg', '--lb-btn-group-active-hover-bg'], primaryHover);
    put(['--lb-active-text', '--lb-btn-primary-text', '--lb-btn-primary-hover-text'], colorValue(colors.on_primary, readableTextFor(primary)));
    put(['--lb-bg'], bg);
    put(['--lb-card-bg', '--lb-table-bg', '--lb-table-row-bg', '--lb-input-bg', '--lb-select-bg', '--lb-btn-bg', '--lb-dropdown-menu-bg', '--lb-multiselect-bg', '--lb-multiselect-summary-bg'], surface);
    put(['--lb-table-row-alt-bg', '--lb-table-footer-bg'], surfaceAlt);
    put(['--lb-text', '--lb-input-text', '--lb-select-text', '--lb-table-cell-text', '--lb-btn-text', '--lb-dropdown-menu-text', '--lb-multiselect-text'], text);
    put(['--lb-text-muted', '--lb-text-secondary', '--lb-input-placeholder-text', '--lb-table-footer-text'], muted);
    put(['--lb-border', '--lb-border-color', '--lb-card-border', '--lb-input-border', '--lb-select-border', '--lb-btn-border', '--lb-table-border-color', '--lb-table-cell-border-color', '--lb-multiselect-border', '--lb-multiselect-menu-border'], border);
    put(['--lb-header-bg'], colorValue(colors.header, surface));
    put(['--lb-header-text', '--lb-header-btn-text'], text);
    put(['--lb-header-border'], border);
    put(['--lb-sidebar-bg'], colorValue(colors.sidebar, mixColor(text, 10)));
    put(['--lb-sidebar-text'], colorValue(colors.sidebar_text, '#ffffff'));
    put(['--lb-sidebar-active-bg', '--lb-sidebar-link-hover-bg'], primary);
    put(['--lb-sidebar-active-text', '--lb-sidebar-link-hover-text'], colorValue(colors.on_primary, readableTextFor(primary)));
    put(['--lb-success'], colorValue(colors.success, '#2e8b57'));
    put(['--lb-warning'], colorValue(colors.warning, '#d98b00'));
    put(['--lb-danger'], colorValue(colors.danger, '#c0392b'));

    var componentsDesign = design.components || {};
    var button = componentsDesign.button || {};
    put(['--lb-btn-bg'], componentValue(button, ['background', 'bg'], surface));
    put(['--lb-btn-text'], componentValue(button, ['text', 'text_color'], text));
    put(['--lb-btn-hover-bg'], componentValue(button, ['hover', 'hover_background'], primaryHover));
    put(['--lb-btn-hover-text'], componentValue(button, ['hover_text'], componentValue(button, ['text'], text)));
    put(['--lb-btn-border', '--lb-btn-hover-border'], componentValue(button, ['border'], border));
    putRaw(['--lb-btn-radius'], normalizeRadius(componentValue(button, ['radius'], ''), '12px'));
    putRaw(['--lb-btn-shadow'], normalizeShadow(componentValue(button, ['shadow'], 'soft')));

    var headerButton = componentsDesign.header_button || componentsDesign.header_buttons || componentsDesign.headerButton || {};
    put(['--lb-header-btn-bg'], componentValue(headerButton, ['background', 'bg'], componentValue(button, ['background'], primary)));
    put(['--lb-header-btn-text'], componentValue(headerButton, ['text', 'text_color'], componentValue(button, ['text'], colorValue(colors.on_primary, readableTextFor(primary)))));
    put(['--lb-header-btn-hover-bg'], componentValue(headerButton, ['hover', 'hover_background'], componentValue(button, ['hover'], primaryHover)));
    put(['--lb-header-btn-hover-text'], componentValue(headerButton, ['hover_text'], componentValue(headerButton, ['text'], colorValue(colors.on_primary, readableTextFor(primary)))));

    var buttonGroup = componentsDesign.button_group || componentsDesign.buttonGroup || {};
    var buttonGroupActiveText = componentValue(buttonGroup, ['active_text'], colorValue(colors.on_primary, readableTextFor(primary)));

    out['--lb-btn-group-inactive-bg'] = colorValue(componentValue(buttonGroup, ['inactive_background', 'inactive_bg', 'background', 'bg'], '#ffffff'), '#ffffff');
    out['--lb-btn-group-inactive-text'] = colorValue(componentValue(buttonGroup, ['inactive_text', 'text', 'text_color'], componentValue(button, ['text', 'text_color'], text)), componentValue(button, ['text', 'text_color'], text));
    var buttonGroupBorder = colorValue(componentValue(buttonGroup, ['border'], componentValue(button, ['border'], border)), border);
    out['--lb-btn-group-border'] = buttonGroupBorder;
    out['--lb-btn-group-inactive-border'] = buttonGroupBorder;
    put(['--lb-btn-group-active-border'], componentValue(buttonGroup, ['active_border', 'border'], componentValue(button, ['border'], primary)));
    put(['--lb-btn-group-hover-bg'], componentValue(buttonGroup, ['hover', 'hover_background'], componentValue(button, ['hover'], primaryHover)));

    put(['--lb-btn-group-hover-text'], buttonGroupActiveText);
    put(['--lb-btn-group-active-bg'], componentValue(buttonGroup, ['active', 'background', 'bg'], primary));
    put(['--lb-btn-group-active-text'], buttonGroupActiveText);
    put(['--lb-btn-group-active-hover-bg'], componentValue(buttonGroup, ['active_hover', 'hover'], primaryHover));
    put(['--lb-btn-group-active-hover-text'], componentValue(buttonGroup, ['active_hover_text', 'hover_text'], buttonGroupActiveText));

    var card = componentsDesign.card || {};
    put(['--lb-card-bg'], componentValue(card, ['background', 'bg'], surface));
    put(['--lb-card-text'], componentValue(card, ['text', 'text_color'], text));
    put(['--lb-card-border'], componentValue(card, ['border'], border));
    put(['--lb-card-hover-bg'], componentValue(card, ['hover'], mixColor(surface, -3)));
    putRaw(['--lb-radius', '--lb-radius-sm'], normalizeRadius(componentValue(card, ['radius'], ''), '14px'));
    putRaw(['--lb-card-shadow'], normalizeShadow(componentValue(card, ['shadow'], 'soft')));

    var input = componentsDesign.input || {};
    put(['--lb-input-bg'], componentValue(input, ['background', 'bg'], surface));
    put(['--lb-input-text'], componentValue(input, ['text', 'text_color'], text));
    put(['--lb-input-border', '--lb-input-hover-border'], componentValue(input, ['border'], border));
    put(['--lb-input-hover-bg'], componentValue(input, ['hover'], mixColor(surface, -2)));
    put(['--lb-focus-ring', '--lb-focus-ring-strong'], componentValue(input, ['focus', 'focus_border'], primary));
    putRaw(['--lb-radius-sm'], normalizeRadius(componentValue(input, ['radius'], ''), '10px'));

    var select = componentsDesign.select || componentsDesign.selects || {};
    put(['--lb-select-bg'], componentValue(select, ['background', 'bg'], componentValue(input, ['background'], surface)));
    put(['--lb-select-text'], componentValue(select, ['text', 'text_color'], componentValue(input, ['text'], text)));
    put(['--lb-select-border', '--lb-select-hover-border'], componentValue(select, ['border'], componentValue(input, ['border'], border)));
    put(['--lb-select-hover-bg', '--lb-select-option-hover-bg'], componentValue(select, ['hover', 'hover_background'], mixColor(componentValue(select, ['background'], surface), -5)));
    put(['--lb-select-hover-text', '--lb-select-option-hover-text'], componentValue(select, ['hover_text'], componentValue(select, ['text'], text)));
    putRaw(['--lb-radius-sm'], normalizeRadius(componentValue(select, ['radius'], ''), '10px'));

    var dropdown = componentsDesign.dropdown || componentsDesign.dropdowns || {};
    put(['--lb-dropdown-menu-bg'], componentValue(dropdown, ['background', 'bg'], componentValue(select, ['background'], surface)));
    put(['--lb-dropdown-menu-text'], componentValue(dropdown, ['text', 'text_color'], componentValue(select, ['text'], text)));
    put(['--lb-tab-popup-item-hover-bg', '--lb-multiselect-option-hover-bg'], componentValue(dropdown, ['hover', 'hover_background'], componentValue(select, ['hover'], primaryHover)));
    put(['--lb-multiselect-menu-border'], componentValue(dropdown, ['border'], componentValue(select, ['border'], border)));
    putRaw(['--lb-multiselect-shadow'], normalizeShadow(componentValue(dropdown, ['shadow'], 'soft')));

    var table = componentsDesign.table || {};
    put(['--lb-table-bg', '--lb-table-row-bg'], componentValue(table, ['background', 'bg'], surface));
    put(['--lb-table-header-bg'], componentValue(table, ['header', 'header_background'], surfaceAlt));
    put(['--lb-table-header-text'], componentValue(table, ['header_text'], text));
    put(['--lb-table-cell-text'], componentValue(table, ['text', 'text_color'], text));
    put(['--lb-table-row-hover-bg'], componentValue(table, ['hover', 'hover_background'], mixColor(primary, 70)));
    put(['--lb-table-border-color'], componentValue(table, ['border'], border));
    put(['--lb-table-cell-border-color', '--lb-table-header-border-color', '--lb-table-row-border-color'], componentValue(table, ['cell_border', 'cell_lines', 'inner_border', 'inner_lines', 'border'], border));

    putRaw(['--lb-table-cell-border-width'], normalizeBorderWidth(componentValue(table, ['cell_border_width', 'cell_line_width', 'cell_lines_width', 'inner_border_width', 'inner_lines_width'], '0px'), '0px'));
    putRaw(['--lb-table-radius'], normalizeRadius(componentValue(table, ['radius'], ''), '12px'));

    var slider = componentsDesign.slider || componentsDesign.range || {};
    var sliderActive = componentValue(slider, ['active', 'fill', 'background', 'bg'], primary);
    var sliderTrack = componentValue(slider, ['track', 'track_background', 'inactive'], surfaceAlt);
    var sliderThumb = componentValue(slider, ['thumb', 'thumb_bg'], '#ffffff');
    var sliderThumbBorder = componentValue(slider, ['thumb_border', 'border'], border);
    put(['--lb-slider-active-bg', '--lb-slider-fill-bg', '--lb-range-active-bg', '--lb-slider-compact-active-bg'], sliderActive);
    put(['--lb-slider-bg', '--lb-slider-track-bg', '--lb-range-track-bg', '--lb-slider-compact-bg'], sliderTrack);
    put(['--lb-slider-thumb-bg', '--lb-slider-compact-thumb-bg'], sliderThumb);
    put(['--lb-slider-thumb-border-color', '--lb-slider-thumb-border', '--lb-slider-compact-thumb-border'], sliderThumbBorder);
    put(['--lb-slider-focus-shadow'], componentValue(slider, ['focus'], primary));

    out['--lb-slider-value-bg'] = colorValue(componentValue(slider, ['value_background', 'value_bg'], surface), surface);
    out['--lb-slider-value-text'] = colorValue(componentValue(slider, ['value_text', 'value_color'], primary), primary);

    var toggle = componentsDesign.toggle || componentsDesign.switch || {};
    var toggleOffBg = colorValue(componentValue(toggle, ['off', 'off_bg', 'background', 'bg'], surfaceAlt), surfaceAlt);
    var toggleOnBg = colorValue(componentValue(toggle, ['active', 'on', 'on_bg'], primary), primary);
    var toggleOffText = colorValue(componentValue(toggle, ['off_text', 'text', 'text_color'], readableTextFor(toggleOffBg, '#f8fafc', '#111827')), readableTextFor(toggleOffBg, '#f8fafc', '#111827'));
    var toggleOnText = colorValue(componentValue(toggle, ['active_text', 'on_text'], readableTextFor(toggleOnBg, '#f8fafc', '#111827')), readableTextFor(toggleOnBg, '#f8fafc', '#111827'));
    put(['--lb-toggle-bg', '--lb-switch-off-bg'], toggleOffBg);
    put(['--lb-toggle-hover-bg'], componentValue(toggle, ['hover'], mixColor(toggleOffBg, -5)));
    put(['--lb-switch-on-bg', '--lb-toggle-active-bg'], toggleOnBg);

    out['--lb-switch-off-text'] = toggleOffText;
    out['--lb-toggle-text'] = toggleOffText;
    out['--lb-switch-on-text'] = toggleOnText;
    out['--lb-toggle-active-text'] = toggleOnText;
    put(['--lb-switch-border'], componentValue(toggle, ['border'], border));
    put(['--lb-switch-thumb-bg', '--lb-toggle-thumb-bg', '--lb-toggle-knob-bg'], componentValue(toggle, ['thumb', 'thumb_bg'], '#ffffff'));

    return out;
  }

  function formatTokenList(tokens) {
    if (!tokens || !tokens.length) return '<em>' + tx('INSPECTOR_NO_MAPPING') + '</em>';
    return tokens.map(function (token) { return '<code>' + token + '</code>'; }).join(' ');
  }

  function openComponentInspector(definition, target) {
    if (!componentInspector || !definition) return;
    selectedComponentTarget = {
      area: definition.area,
      variant: definition.variant,
      property: definition.property,
      tokens: definition.tokens || []
    };
    if (componentInspectorTitle) {
      componentInspectorTitle.textContent = selectionPathLabel(definition.area, definition.variant, definition.property);
    }
    if (componentInspectorMeta) {
      componentInspectorMeta.innerHTML = '' +
        '<div><strong>' + tx('COMPONENT_INSPECTOR_MAPPING') + '</strong></div>' +
        '<div class="cfw-token-list">' + formatTokenList(definition.tokens || []) + '</div>' +
        '<div class="cfw-small-note">' + tx('COMPONENT_INSPECTOR_HINT') + '</div>';
    }
    componentInspector.hidden = false;
    componentInspector.classList.add('is-open');
    if (target) {
      previewRoot.querySelectorAll('.cfw-edit-highlight').forEach(function (node) { node.classList.remove('cfw-edit-highlight'); });
      target.classList.add('cfw-edit-highlight');
      setTimeout(function () { target.classList.remove('cfw-edit-highlight'); }, 1800);
    }
  }

  function ensurePreviewHoverCard() {
    if (previewHoverCard) return previewHoverCard;
    previewHoverCard = document.createElement('div');
    previewHoverCard.className = 'cfw-preview-hover-card';
    previewHoverCard.setAttribute('aria-hidden', 'true');
    document.body.appendChild(previewHoverCard);
    return previewHoverCard;
  }

  function describePreviewTarget(target) {
    if (!target) return null;
    var area = target.getAttribute('data-cfw-area') || '';
    var element = target.getAttribute('data-cfw-element') || '';
    var group = target.getAttribute('data-cfw-group') || 'Grundfarbe';
    var registered = registryLookup(area, element, group) || { area: area, variant: element, property: group, tokens: [] };
    return registered;
  }

  function showPreviewHover(target) {
    var definition = describePreviewTarget(target);
    if (!definition) return;
    previewHoverTarget = target;
    var card = ensurePreviewHoverCard();
    var tokenCount = (definition.tokens || []).length;
    card.innerHTML = '' +
      '<strong>' + selectionPathLabel(definition.area, definition.variant) + '</strong>' +
      '<span>' + displayGroupName(definition.property) + ' \u00b7 ' + tokenCount + ' ' + tx(tokenCount === 1 ? 'TOKENS_TOKEN' : 'TOKENS_TOKENS') + '</span>';
    var rect = target.getBoundingClientRect();
    var top = Math.max(8, rect.top + window.scrollY - card.offsetHeight - 12);
    var left = Math.min(window.scrollX + document.documentElement.clientWidth - 280, Math.max(8, rect.left + window.scrollX));
    card.style.left = left + 'px';
    card.style.top = top + 'px';
    card.classList.add('is-visible');
    target.classList.add('cfw-hover-highlight');
  }

  function hidePreviewHover() {
    if (previewHoverCard) previewHoverCard.classList.remove('is-visible');
    if (previewHoverTarget) previewHoverTarget.classList.remove('cfw-hover-highlight');
    previewHoverTarget = null;
  }

  function openInspectorForCurrentSelection() {
    var area = currentArea();
    var variant = currentElement();
    var property = currentGroup();
    var definition = registryLookup(area, variant, property) || {
      area: area,
      variant: variant,
      property: property,
      tokens: currentMapping()
    };
    if (!definition || !definition.area || !definition.variant) return false;
    openComponentInspector(definition, null);
    if (componentInspector) {
      componentInspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      componentInspector.classList.add('cfw-direct-focus');
      setTimeout(function () { componentInspector.classList.remove('cfw-direct-focus'); }, 1600);
    }
    setStatus(t('MESSAGES_DIRECT_EDITOR_OPENED', 'MESSAGES_DIRECT_EDITOR_OPENED', { path: selectionPathLabel(definition.area, definition.variant, definition.property) }), false);
    return true;
  }

  function markPreviewEditables() {
    if (!previewRoot) return;
    previewRoot.querySelectorAll('[data-cfw-area]').forEach(function (node) {
      node.classList.add('cfw-preview-editable');
      if (node.getAttribute('title')) { node.setAttribute('data-cfw-title', node.getAttribute('title')); node.removeAttribute('title'); }
      node.setAttribute('aria-label', tx('PREVIEW_EDIT_ARIA'));
    });
  }

  function selectEditorTarget(area, element, group) {
    if (isWallpaperOnlyTheme() || !areas[area]) return false;
    hasActiveEditorSelection = true;
    areaSelect.value = area;
    renderElements();
    if (!((areas[area] || {})[element])) element = Object.keys(areas[area] || {})[0];
    elementSelect.value = element;
    renderColorGroups();
    if (!((((areas[area] || {})[element] || {})[group]))) group = Object.keys(((areas[area] || {})[element] || {}))[0];
    colorGroupSelect.value = group;
    loadEntryToControls();
    updateAll();
    previewCaption.textContent = selectionPathLabel(area, element, group) + ' (' + tx('MESSAGES_FROM_PREVIEW_SELECTED') + ')';
    return true;
  }

  function previewSelectionNode(target, definition) {
    if (!target) return target;

    var area = String((definition && definition.area) || target.getAttribute('data-cfw-area') || '').trim();
    var variant = String((definition && definition.variant) || target.getAttribute('data-cfw-element') || '').trim();
    var normalizedVariant = variant.toLowerCase().replace(/[\s_-]+/g, '');

    if (area === 'Buttons' && normalizedVariant === 'buttongruppe') {
      return target.closest('.lb-btn-group, .cfw-preview-btn-group') || target;
    }

    return target;
  }

  function setupPreviewClickToEdit() {
    if (!previewRoot) return;
    markPreviewEditables();
    previewRoot.addEventListener('mouseover', function (event) {
      var target = event.target.closest('[data-cfw-area]');
      if (!target || !previewRoot.contains(target)) return;
      if (target === previewHoverTarget) return;
      hidePreviewHover();
      showPreviewHover(target);
    });
    previewRoot.addEventListener('mouseout', function (event) {
      var target = event.target.closest('[data-cfw-area]');
      if (!target || !previewRoot.contains(target)) return;
      if (event.relatedTarget && target.contains(event.relatedTarget)) return;
      hidePreviewHover();
    });
    previewRoot.addEventListener('click', function (event) {
      if (isWallpaperOnlyTheme()) return;
      var target = event.target.closest('[data-cfw-area]');
      if (!target || !previewRoot.contains(target)) return;
      event.preventDefault();
      var requestedArea = target.getAttribute('data-cfw-area');
      var requestedElement = target.getAttribute('data-cfw-element');
      var requestedGroup = target.getAttribute('data-cfw-group') || 'Grundfarbe';
      var registered = registryLookup(requestedArea, requestedElement, requestedGroup) || {
        area: requestedArea,
        variant: requestedElement,
        property: requestedGroup,
        tokens: []
      };
      var ok = selectEditorTarget(registered.area, registered.variant, registered.property);
      if (!ok) return;
      previewRoot.querySelectorAll('.cfw-preview-selected').forEach(function (node) { node.classList.remove('cfw-preview-selected'); });
      var selectionNode = previewSelectionNode(target, registered);
      selectionNode.classList.add('cfw-preview-selected');
      setStatus(t('MESSAGES_PREVIEW_SELECTED', 'MESSAGES_PREVIEW_SELECTED', { path: selectionPathLabel(currentArea(), currentElement(), currentGroup()) }), false);
    }, true);
  }

  if (previewRoot) {
    previewRoot.querySelectorAll('.cfw-range').forEach(function (range) {
      range.addEventListener('input', updatePreviewRangeFills);
      range.addEventListener('change', updatePreviewRangeFills);
    });
    updatePreviewRangeFills();
  }

  function duplicateCurrentTheme() {
    var source = selectedUserThemeInfo();
    var wallpaper = buildWallpaperPayload();
    var prepare = Promise.resolve(wallpaper.image);
    if (wallpaper.enabled && /^assets\//.test(wallpaper.image)) {
      prepare = fetch(wallpaperPreviewUrl(wallpaper.image)).then(function (response) {
        if (!response.ok) throw new Error(tx('MESSAGES_CSS_READ_ERROR'));
        return response.blob();
      }).then(function (blob) {
        return new Promise(function (resolve,reject) { var reader=new FileReader(); reader.onload=function () { resolve(String(reader.result)); }; reader.onerror=reject; reader.readAsDataURL(blob); });
      });
    }
    prepare.then(function (image) {
      pushUndoSnapshot('duplicate-theme');
      var base = (source ? source.theme.name : themeName.value) + ' ' + tx('REGISTRY_COPY');
      var name = base, suffix=1;
      while (userThemes.some(function (item) { return item.id === slugifyThemeName(name); })) name = base + ' ' + (++suffix);
      var previousId = themeId.value;
      themeName.value = name;
      themeId.value = slugifyThemeName(name);
      if (customCss && previousId) customCss.value = customCss.value.replace(new RegExp('\\.theme-' + previousId + '(?![a-z0-9-])', 'g'), '.theme-' + themeId.value);
      themeVersion.value = '0.1.0';
      if (wallpaperImage) wallpaperImage.value = image || '';
      wallpaperState.image = image || '';
      if (userThemeSelect) { userThemeSelect.value=''; userThemeSelect.setAttribute('data-current-selection',''); }
      updateProtectedStudioThemeMode();
      updateAll(false);
      updateDirtyState();
      openSaveModal();
    }).catch(function (error) { setStatus(error.message || tx('MESSAGES_SAVE_FAILED'),true); });
  }

  window.CFW_DESIGN_STUDIO = { t: t, switchTab: switchTab };

  applyI18n(document);
  document.getElementById('duplicateTheme').addEventListener('click',duplicateCurrentTheme);

  renderColorPresetPalette();
  renderNewThemeColorPalette();
  updateNewThemeColorAnalysis();
  if (newThemeColorToggle && newThemeColorControls) {
    newThemeColorToggle.addEventListener('click', function () {
      newThemeColorControls.hidden = !newThemeColorControls.hidden;
      if (!newThemeColorControls.hidden) {
        updateNewThemeColorPresetSelection();
        updateNewThemeColorAnalysis();
      }
    });
  }
  if (newThemeColorPicker) newThemeColorPicker.addEventListener('input', function () {
    updateNewThemeColorPresetSelection();
    updateNewThemeColorAnalysis();
  });
  if (newThemeColorMode) newThemeColorMode.addEventListener('change', updateNewThemeColorAnalysis);
  if (applyNewThemeColorButton) applyNewThemeColorButton.addEventListener('click', applyLocalThemeColor);
  if (cancelNewThemeColorButton && newThemeColorControls) cancelNewThemeColorButton.addEventListener('click', function () { newThemeColorControls.hidden = true; });

  ['cfwPreviewFrame'].forEach(function (id) {
    var frame = document.getElementById(id);
    if (!frame) return;
    frame.addEventListener('load', function () {
      broadcastEmbeddedFrameTokens(effectivePreviewTokens());
    });
  });

  if (statusModalBack) statusModalBack.addEventListener('click', closeStatusModal);

  if (undoThemeButton) undoThemeButton.addEventListener('click', function () { undoLastChange(); });
  if (redoThemeButton) redoThemeButton.addEventListener('click', function () { redoLastChange(); });
  resetHistory();
  [colorPicker, alphaRange, brightnessRange, radiusRange, borderWidthRange, shadowRange, customCss, wallpaperEnabled, wallpaperImage, wallpaperBrightness, wallpaperOpacity].forEach(bindUndoControl);

  document.getElementById('saveTheme').addEventListener('click', openSaveModal);
  if (validateThemeButton) validateThemeButton.addEventListener('click', function () { runThemeValidation(false); });
  if (validationCancelButton) validationCancelButton.addEventListener('click', closeValidationModal);
  if (validationAutoFixButton) validationAutoFixButton.addEventListener('click', applySelectedValidationFixes);
  if (validationSaveAnywayButton) validationSaveAnywayButton.addEventListener('click', function () { validationModal.hidden = true; pendingValidationSave = false; saveTheme(true); });
  if (deleteThemeButton) deleteThemeButton.addEventListener('click', openDeleteModal);
  if (cancelDeleteButton) cancelDeleteButton.addEventListener('click', closeDeleteModal);
  if (confirmDeleteButton) confirmDeleteButton.addEventListener('click', deleteSelectedTheme);
  document.getElementById('cancelSave').addEventListener('click', closeSaveModal);
  document.getElementById('confirmSave').addEventListener('click', function () { saveTheme(false); });
  if (themeName) {
    themeName.addEventListener('input', updateDirtyState);
    themeName.addEventListener('blur', function () { updateThemeIdentityFromName(); updateDirtyState(); });
  }
  areaSelect.addEventListener('change', renderElements);
  elementSelect.addEventListener('change', renderColorGroups);
  if (affectedTokenSelect) affectedTokenSelect.addEventListener('click', function (event) {
    var button = event.target.closest('[data-token]');
    if (!button || button.disabled) return;
    focusAffectedToken(button.getAttribute('data-token'));
  });
  if (selectedTokenList) selectedTokenList.addEventListener('click', function (event) {
    var action = event.target && event.target.closest ? event.target.closest('.cfw-token-action') : null;
    if (action) focusAffectedToken(action.getAttribute('data-token'));
  });
  colorGroupSelect.addEventListener('change', function () { activeDirectToken = ''; loadEntryToControls(); updateWallpaperControlVisibility(); updateAll(); });
  if (colorPicker) {
    colorPicker.addEventListener('input', function () {
      if (!requireColorEditTarget()) {
        updateColorPresetSelection();
        return;
      }
      updateAll(true, 'color');
    });
    colorPicker.addEventListener('change', function () {
      if (!requireColorEditTarget()) {
        updateColorPresetSelection();
        return;
      }
      updateColorPresetSelection();
      updateAll(true, 'color');
    });
  }

  if (radiusRange) {
    radiusRange.addEventListener('input', function () {
      if (!requireColorEditTarget()) return;
      updateAll(true, 'radius');
    });
  }

  if (borderWidthRange) {
    borderWidthRange.addEventListener('input', function () {
      if (!requireColorEditTarget()) return;
      updateAll(true, 'borderWidth');
    });
  }
  if (cssImportButton && cssImport) { cssImportButton.addEventListener('click', function () { cssImport.click(); }); }
  updateCssImportFileName(null);
  if (cssImport) cssImport.addEventListener('change', function () { var file = cssImport.files && cssImport.files[0]; updateCssImportFileName(file); importCss(file); });
  if (wallpaperEnabled) {
    wallpaperEnabled.addEventListener('change', function () {
      pushUndoSnapshot('wallpaper-enabled');

      if (!wallpaperEnabled.checked) {
        clearWallpaperDraft();
      } else {
        syncWallpaperStateFromControls();
      }

      updateWallpaperLabels();
      updateWallpaperControlVisibility();
      updatePreview();
      updateDirtyState();
    });
  }

  [wallpaperImage, wallpaperBrightness, wallpaperOpacity].forEach(function (node) {
    if (!node) return;
    node.addEventListener('input', function () { syncWallpaperStateFromControls(); updateWallpaperLabels(); updateWallpaperControlVisibility(); updatePreview(); });
    node.addEventListener('change', function () { syncWallpaperStateFromControls(); updateWallpaperLabels(); updateWallpaperControlVisibility(); updatePreview(); });
    node.addEventListener('click', function () { window.setTimeout(function () { syncWallpaperStateFromControls(); updateWallpaperLabels(); updateWallpaperControlVisibility(); updatePreview(); }, 0); });
  });
  if (wallpaperFileButton && wallpaperFile) {
    wallpaperFileButton.addEventListener('click', function () { wallpaperFile.click(); });
  }
  updateWallpaperFileName(null);
  if (wallpaperFile) {
    wallpaperFile.addEventListener('change', function () {
      pushUndoSnapshot('wallpaper-file');
      var file = wallpaperFile.files && wallpaperFile.files[0];
      updateWallpaperFileName(file);
      if (!file) {
        syncWallpaperStateFromControls();
        updatePreview();
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        if (wallpaperImage) wallpaperImage.value = String(reader.result || '');
        if (wallpaperEnabled) wallpaperEnabled.checked = true;
        syncWallpaperStateFromControls();
        updateWallpaperLabels();
        updateWallpaperControlVisibility();
        updatePreview();
      };
      reader.readAsDataURL(file);
    });
  }
  saveModal.addEventListener('click', function (event) { if (event.target === saveModal) closeSaveModal(); });
  document.querySelectorAll('.cfw-tab').forEach(function (button) {
    button.addEventListener('click', function () { switchTab(button.getAttribute('data-cfw-tab')); });
  });
  if (userThemeSelect) userThemeSelect.addEventListener('change', function () {
    var requestedValue = userThemeSelect.value;
    var currentIndex = userThemes.findIndex(function (theme) { return theme && theme.id === (themeId ? themeId.value : ''); });
    var previousValue = userThemeSelect.getAttribute('data-current-selection') || '';
    userThemeSelect.value = previousValue;
    requestThemeSelection(requestedValue);
  });
  if (unsavedModalCancel) unsavedModalCancel.addEventListener('click', closeUnsavedChangesModal);
  if (unsavedModalDiscard) unsavedModalDiscard.addEventListener('click', function () {
    var requestedValue = pendingThemeSelection;
    if (unsavedModal) unsavedModal.hidden = true;
    pendingThemeSelection = null;
    if (userThemeSelect) userThemeSelect.value = requestedValue;
    applyThemeSelection(requestedValue);
  });
  if (unsavedModal) unsavedModal.addEventListener('click', function (event) {
    if (event.target === unsavedModal) closeUnsavedChangesModal();
  });


  if (themeState && typeof themeState.attachFrames === 'function') {
    themeState.attachFrames(['cfwPreviewFrame']);
  }
  var livePreviewFrame = document.getElementById('cfwPreviewFrame');
  if (livePreviewFrame) {
    livePreviewFrame.addEventListener('load', function () {
      window.setTimeout(function () { broadcastEmbeddedFrameTokens(effectivePreviewTokens()); }, 0);
      window.setTimeout(function () { broadcastEmbeddedFrameTokens(effectivePreviewTokens()); }, 120);
    });
  }

  function tokenPersistenceValueKind(token, group) {
    token = String(token || '');
    group = String(group || '');
    if (/border-width/.test(token) || isBorderWidthGroup(group)) return 'borderWidth';
    if (/radius/.test(token) || group === 'Radius') return 'radius';
    if (/shadow/.test(token) || group === 'Schatten') return 'shadow';
    if (/opacity/.test(token)) return 'opacity';
    if (/blur/.test(token)) return 'blur';
    return 'color';
  }

  function runTokenPersistenceAudit() {
    var report = {
      version: 'V402',
      areas: 0,
      elements: 0,
      properties: 0,
      mappedTokens: 0,
      uniqueTokens: 0,
      singleTokenProperties: 0,
      multiTokenProperties: 0,
      mixedTypeProperties: 0,
      unknownCoreTokens: [],
      invalidTokens: [],
      mixedTypeMappings: [],
      conflictingTokenKinds: [],
      ok: true
    };
    var unique = {};
    var tokenKinds = {};
    var areaNames = Object.keys(areas || {});
    report.areas = areaNames.length;

    areaNames.forEach(function (areaName) {
      var elements = areas[areaName] || {};
      Object.keys(elements).forEach(function (elementName) {
        report.elements += 1;
        var properties = elements[elementName] || {};
        Object.keys(properties).forEach(function (propertyName) {
          report.properties += 1;
          var mapped = properties[propertyName] || [];
          if (mapped.length === 1) report.singleTokenProperties += 1;
          else if (mapped.length > 1) report.multiTokenProperties += 1;
          report.mappedTokens += mapped.length;
          var kinds = {};
          mapped.forEach(function (token) {
            unique[token] = true;
            var kind = tokenPersistenceValueKind(token, propertyName);
            kinds[kind] = true;
            tokenKinds[token] = tokenKinds[token] || {};
            tokenKinds[token][kind] = true;
            if (!/^--lb-[a-z0-9-]+$/.test(token)) {
              report.invalidTokens.push({ area: areaName, element: elementName, property: propertyName, token: token });
            }
            if (coreTokens && Object.keys(coreTokens).length && coreTokens[token] === undefined) {
              report.unknownCoreTokens.push({ area: areaName, element: elementName, property: propertyName, token: token });
            }
          });
          if (Object.keys(kinds).length > 1) {
            report.mixedTypeProperties += 1;
            report.mixedTypeMappings.push({ area: areaName, element: elementName, property: propertyName, tokens: mapped.slice(), kinds: Object.keys(kinds) });
          }
        });
      });
    });

    report.uniqueTokens = Object.keys(unique).length;
    Object.keys(tokenKinds).forEach(function (token) {
      var kinds = Object.keys(tokenKinds[token]);
      if (kinds.length > 1) report.conflictingTokenKinds.push({ token: token, kinds: kinds });
    });
    report.ok = !report.invalidTokens.length && !report.conflictingTokenKinds.length;
    window.CFW_TOKEN_PERSISTENCE_AUDIT = report;
    if (window.console && typeof window.console.info === 'function') {
      console.info('[CSS Framework] V402 token persistence audit', report);
      if (!report.ok && typeof window.console.warn === 'function') console.warn('[CSS Framework] V402 audit findings', report);
    }
    return report;
  }

  (function initStudioAuroraPointer() {
    var studioPage = document.querySelector('.cfw-page.cfw-design-studio');
    if (!studioPage || studioPage.getAttribute('data-cfw-aurora-ready') === 'true') return;
    studioPage.setAttribute('data-cfw-aurora-ready', 'true');

    var targetX = 50, targetY = 18, currentX = 50, currentY = 18, frame = 0;

    function render() {
      frame = 0;
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      studioPage.style.setProperty('--cfw-aurora-pointer-x', currentX.toFixed(2) + '%');
      studioPage.style.setProperty('--cfw-aurora-pointer-y', currentY.toFixed(2) + '%');
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = window.requestAnimationFrame(render);
      }
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    studioPage.addEventListener('pointermove', function (event) {
      var rect = studioPage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      targetY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      schedule();
    }, { passive: true });

    studioPage.addEventListener('pointerleave', function () {
      targetX = 50;
      targetY = 18;
      schedule();
    }, { passive: true });
  }());

  (function initWikiNavigation() {
    var wikiPanel = document.getElementById('cfwTabWiki');
    if (!wikiPanel) return;
    wikiPanel.querySelectorAll('.cfw-wiki-nav a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });
  }());

  setupPreviewClickToEdit();
  populateUserThemeSelect();
  updateLiquidGlassWallpaperEditorMode();
  buildComponentRegistry();
  renderAreas();
  renderElements();
  resetHistory();
  markCurrentStateAsSaved();
  runTokenPersistenceAudit();
  setStatus(t('MESSAGES_CORE_READ', 'MESSAGES_CORE_READ', { tokens: Object.keys(coreTokens).length, themes: ((coreData.themes || []).length) }), false);
}());

import { ref } from 'vue';

const theme = ref('system');
const isDark = ref(false);
const primaryHue = ref(35);
const secondaryHue = ref(15);
const intensity = ref(100);
const radius = ref(0.625);
const fontFamily = ref('outfit');
const fontWeight = ref(400);
const borderWidth = ref(1);
const shadowIntensity = ref(100);
const spacing = ref(100);
const backgroundStyle = ref('organic');
const bgIntensity = ref(100);

const FONT_STACKS = {
  'outfit': 'Outfit, ui-sans-serif, system-ui, sans-serif',
  'bricolage-grotesque': 'Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif',
  'ibm-plex-mono': 'IBM Plex Mono, ui-monospace, monospace',
  'instrument-sans': 'Instrument Sans, ui-sans-serif, system-ui, sans-serif',
  'inter': 'Inter, ui-sans-serif, system-ui, sans-serif',
  'nunito': 'Nunito, ui-sans-serif, system-ui, sans-serif',
  'poppins': 'Poppins, ui-sans-serif, system-ui, sans-serif',
  'dm-sans': 'DM Sans, ui-sans-serif, system-ui, sans-serif',
  'system': 'ui-sans-serif, system-ui, sans-serif'
};

const DEFAULTS = {
  primaryHue: 35,
  secondaryHue: 15,
  intensity: 100,
  radius: 0.625,
  fontFamily: 'outfit',
  fontWeight: 400,
  borderWidth: 1,
  shadowIntensity: 100,
  spacing: 100,
  backgroundStyle: 'organic',
  bgIntensity: 100,
};

function modePrefix() {
  return isDark.value ? 'dark' : 'light';
}

function storeModeValue(key, value) {
  localStorage.setItem(`theme.${modePrefix()}.${key}`, value.toString());
}

function loadModeValue(key) {
  return localStorage.getItem(`theme.${modePrefix()}.${key}`);
}

function storeSharedValue(key, value) {
  localStorage.setItem(`theme.${key}`, value.toString());
}

function loadSharedValue(key) {
  return localStorage.getItem(`theme.${key}`);
}

// Migrate old flat keys to per-mode keys (one-time)
function migrateOldKeys() {
  const migrated = localStorage.getItem('theme.migrated');
  if (migrated) return;

  const oldKeyMap = {
    primaryHue: 'primaryHue',
    secondaryHue: 'secondaryHue',
    themeIntensity: 'intensity',
    themeShadowIntensity: 'shadowIntensity',
    themeBgIntensity: 'bgIntensity',
    themeBackgroundStyle: 'backgroundStyle',
  };

  for (const [oldKey, newKey] of Object.entries(oldKeyMap)) {
    const val = localStorage.getItem(oldKey);
    if (val !== null) {
      // Copy old value to both modes
      localStorage.setItem(`theme.light.${newKey}`, val);
      localStorage.setItem(`theme.dark.${newKey}`, val);
      localStorage.removeItem(oldKey);
    }
  }

  const sharedOldKeyMap = {
    themeRadius: 'radius',
    themeFontFamily: 'fontFamily',
    themeFontWeight: 'fontWeight',
    themeBorderWidth: 'borderWidth',
    themeSpacing: 'spacing',
  };

  for (const [oldKey, newKey] of Object.entries(sharedOldKeyMap)) {
    const val = localStorage.getItem(oldKey);
    if (val !== null) {
      localStorage.setItem(`theme.${newKey}`, val);
      localStorage.removeItem(oldKey);
    }
  }

  localStorage.setItem('theme.migrated', '1');
}

export function useTheme() {
  const setTheme = (newTheme) => {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme();
  };

  const applyTheme = () => {
    const root = document.documentElement;
    const wasDark = isDark.value;

    if (theme.value === 'dark') {
      root.classList.add('dark');
      isDark.value = true;
    } else if (theme.value === 'light') {
      root.classList.remove('dark');
      isDark.value = false;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        isDark.value = true;
      } else {
        root.classList.remove('dark');
        isDark.value = false;
      }
    }

    // Reload per-mode settings when mode changes
    if (wasDark !== isDark.value) {
      loadModeSettings();
    }
  };

  const loadModeSettings = () => {
    const storedPrimaryHue = loadModeValue('primaryHue');
    const storedSecondaryHue = loadModeValue('secondaryHue');
    const storedIntensity = loadModeValue('intensity');
    const storedShadowIntensity = loadModeValue('shadowIntensity');
    const storedBgIntensity = loadModeValue('bgIntensity');
    const storedBackgroundStyle = loadModeValue('backgroundStyle');

    primaryHue.value = storedPrimaryHue !== null ? parseInt(storedPrimaryHue, 10) : DEFAULTS.primaryHue;
    secondaryHue.value = storedSecondaryHue !== null ? parseInt(storedSecondaryHue, 10) : DEFAULTS.secondaryHue;
    intensity.value = storedIntensity !== null ? parseInt(storedIntensity, 10) : DEFAULTS.intensity;
    shadowIntensity.value = storedShadowIntensity !== null ? parseInt(storedShadowIntensity, 10) : DEFAULTS.shadowIntensity;
    bgIntensity.value = storedBgIntensity !== null ? parseInt(storedBgIntensity, 10) : DEFAULTS.bgIntensity;
    backgroundStyle.value = storedBackgroundStyle || DEFAULTS.backgroundStyle;

    applyHues();
    applyBackgroundStyle();
  };

  const setPrimaryHue = (hue) => {
    const validHue = Math.max(0, Math.min(360, hue));
    primaryHue.value = validHue;
    storeModeValue('primaryHue', validHue);
    applyHues();
  };

  const setSecondaryHue = (hue) => {
    const validHue = Math.max(0, Math.min(360, hue));
    secondaryHue.value = validHue;
    storeModeValue('secondaryHue', validHue);
    applyHues();
  };

  const setIntensity = (value) => {
    const validIntensity = Math.max(0, Math.min(100, value));
    intensity.value = validIntensity;
    storeModeValue('intensity', validIntensity);
    applyHues();
  };

  const setRadius = (value) => {
    const validRadius = Math.max(0, Math.min(2, value));
    radius.value = validRadius;
    storeSharedValue('radius', validRadius);
    applyHues();
  };

  const setFontFamily = (family) => {
    if (FONT_STACKS[family]) {
      fontFamily.value = family;
      storeSharedValue('fontFamily', family);
      applyHues();
    }
  };

  const setFontWeight = (value) => {
    const validWeight = Math.max(300, Math.min(700, value));
    fontWeight.value = validWeight;
    storeSharedValue('fontWeight', validWeight);
    applyHues();
  };

  const setBorderWidth = (value) => {
    const validWidth = Math.max(0, Math.min(10, value));
    borderWidth.value = validWidth;
    storeSharedValue('borderWidth', validWidth);
    applyHues();
  };

  const setShadowIntensity = (value) => {
    const validIntensity = Math.max(0, Math.min(200, value));
    shadowIntensity.value = validIntensity;
    storeModeValue('shadowIntensity', validIntensity);
    applyHues();
  };

  const setSpacing = (value) => {
    const validSpacing = Math.max(75, Math.min(125, value));
    spacing.value = validSpacing;
    storeSharedValue('spacing', validSpacing);
    applyHues();
  };

  const setBgIntensity = (value) => {
    const valid = Math.max(0, Math.min(200, value));
    bgIntensity.value = valid;
    storeModeValue('bgIntensity', valid);
    applyBackgroundStyle();
  };

  const setBackgroundStyle = (style) => {
    const validStyles = ['solid', 'gradient', 'radial', 'mesh', 'organic'];
    if (validStyles.includes(style)) {
      backgroundStyle.value = style;
      storeModeValue('backgroundStyle', style);
      applyBackgroundStyle();
    }
  };

  const applyBackgroundStyle = () => {
    const body = document.body;
    body.classList.remove('bg-solid', 'bg-gradient', 'bg-radial', 'bg-mesh', 'bg-organic');
    body.classList.add(`bg-${backgroundStyle.value}`);
    document.documentElement.style.setProperty('--bg-intensity', (bgIntensity.value / 100).toString());
  };

  const applyHues = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-hue', primaryHue.value.toString());
    root.style.setProperty('--secondary-hue', secondaryHue.value.toString());
    root.style.setProperty('--theme-intensity', (intensity.value / 100).toString());
    root.style.setProperty('--radius', `${radius.value}rem`);
    const stack = FONT_STACKS[fontFamily.value] || FONT_STACKS['outfit'];
    root.style.setProperty('--font-family', stack);
    root.style.setProperty('--font-family-body', stack);
    root.style.setProperty('--font-weight-base', fontWeight.value.toString());
    root.style.setProperty('--border-width-base', `${borderWidth.value}px`);
    root.style.setProperty('--shadow-intensity', (shadowIntensity.value / 100).toString());
    root.style.setProperty('--spacing-base', `${0.25 * (spacing.value / 100)}rem`);
  };

  const initTheme = () => {
    migrateOldKeys();

    const stored = localStorage.getItem('theme') || 'system';
    theme.value = stored;

    // Determine isDark first (without triggering loadModeSettings via the guard)
    const root = document.documentElement;
    if (stored === 'dark') {
      root.classList.add('dark');
      isDark.value = true;
    } else if (stored === 'light') {
      root.classList.remove('dark');
      isDark.value = false;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        isDark.value = true;
      } else {
        root.classList.remove('dark');
        isDark.value = false;
      }
    }

    // Load shared settings
    const storedRadius = loadSharedValue('radius');
    const storedFont = loadSharedValue('fontFamily');
    const storedFontWeight = loadSharedValue('fontWeight');
    const storedBorderWidth = loadSharedValue('borderWidth');
    const storedSpacing = loadSharedValue('spacing');

    if (storedRadius) radius.value = parseFloat(storedRadius);
    if (storedFont && FONT_STACKS[storedFont]) fontFamily.value = storedFont;
    if (storedFontWeight) fontWeight.value = parseInt(storedFontWeight, 10);
    if (storedBorderWidth) borderWidth.value = parseFloat(storedBorderWidth);
    if (storedSpacing) spacing.value = parseInt(storedSpacing, 10);

    // Load per-mode settings
    loadModeSettings();

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme();
        loadModeSettings();
      }
    });
  };

  const resetToDefaults = () => {
    // Reset per-mode values for current mode
    setPrimaryHue(DEFAULTS.primaryHue);
    setSecondaryHue(DEFAULTS.secondaryHue);
    setIntensity(DEFAULTS.intensity);
    setShadowIntensity(DEFAULTS.shadowIntensity);
    setBgIntensity(DEFAULTS.bgIntensity);
    setBackgroundStyle(DEFAULTS.backgroundStyle);
    // Reset shared values
    setRadius(DEFAULTS.radius);
    setFontFamily(DEFAULTS.fontFamily);
    setFontWeight(DEFAULTS.fontWeight);
    setBorderWidth(DEFAULTS.borderWidth);
    setSpacing(DEFAULTS.spacing);
  };

  return {
    theme,
    isDark,
    primaryHue,
    secondaryHue,
    intensity,
    radius,
    fontFamily,
    fontWeight,
    borderWidth,
    shadowIntensity,
    spacing,
    backgroundStyle,
    bgIntensity,
    FONT_STACKS,
    DEFAULTS,
    setTheme,
    setPrimaryHue,
    setSecondaryHue,
    setIntensity,
    setRadius,
    setFontFamily,
    setFontWeight,
    setBorderWidth,
    setShadowIntensity,
    setSpacing,
    setBackgroundStyle,
    setBgIntensity,
    resetToDefaults,
    initTheme,
  };
}
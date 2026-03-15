import { ref } from 'vue';

const theme = ref('dark');
const isDark = ref(false);
const primaryHue = ref(230);
const secondaryHue = ref(200);
const intensity = ref(100);
const radius = ref(0.625);
const fontFamily = ref('outfit');
const fontWeight = ref(400);
const borderWidth = ref(1);
const shadowIntensity = ref(100);
const spacing = ref(100);
const backgroundStyle = ref('organic');
const bgIntensity = ref(100);
const cursorGlow = ref(true);
const bubblesEnabled = ref(true);
const bubblesRepulse = ref(4);
const bubblesDrift = ref(0.05);
const bubblesMerge = ref(0.7);
const bubblesSat = ref(1.2);
const bubblesSpec = ref(3.0);
const bubblesFresnel = ref(0.35);
const bubblesSize = ref(0.20);
const bubblesFlick = ref(15);
const bubblesSpring = ref(0.8);
const bubblesDamp = ref(0.92);
const bubblesContact = ref(1.2);
const bubblesSharp = ref(0.08);
const bubblesNormal = ref(3.0);
const bubblesRmin = ref(0.02);
const bubblesVignette = ref(0.28);
const bubblesBallCount = ref(32);
const bubblesNoise = ref(0.04);
const bubblesParallax = ref(0.0002);

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
  primaryHue: 230,
  secondaryHue: 200,
  intensity: 100,
  radius: 0.625,
  fontFamily: 'outfit',
  fontWeight: 400,
  borderWidth: 1,
  shadowIntensity: 100,
  spacing: 100,
  backgroundStyle: 'organic',
  bgIntensity: 100,
  cursorGlow: true,
  bubblesEnabled: true,
  bubblesRepulse: 4,
  bubblesDrift: 0.05,
  bubblesMerge: 0.7,
  bubblesSat: 1.2,
  bubblesSpec: 3.0,
  bubblesFresnel: 0.35,
  bubblesSize: 0.20,
  bubblesFlick: 15,
  bubblesSpring: 0.8,
  bubblesDamp: 0.92,
  bubblesContact: 1.2,
  bubblesSharp: 0.08,
  bubblesNormal: 3.0,
  bubblesRmin: 0.02,
  bubblesVignette: 0.28,
  bubblesBallCount: 32,
  bubblesNoise: 0.04,
  bubblesParallax: 0.0002,
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

  const setCursorGlow = (enabled) => {
    cursorGlow.value = !!enabled;
    storeSharedValue('cursorGlow', cursorGlow.value ? '1' : '0');
    applyCursorGlow();
  };

  const applyCursorGlow = () => {
    document.documentElement.style.setProperty('--cursor-glow-enabled', cursorGlow.value ? '1' : '0');
  };

  const setBubblesEnabled = (enabled) => {
    bubblesEnabled.value = !!enabled;
    storeSharedValue('bubblesEnabled', bubblesEnabled.value ? '1' : '0');
  };

  const setBubblesRepulse = (value) => {
    bubblesRepulse.value = Math.max(1, Math.min(15, value));
    storeSharedValue('bubblesRepulse', bubblesRepulse.value);
  };

  const setBubblesDrift = (value) => {
    bubblesDrift.value = Math.max(0.01, Math.min(0.20, value));
    storeSharedValue('bubblesDrift', bubblesDrift.value);
  };

  const setBubblesMerge = (value) => {
    bubblesMerge.value = Math.max(0.3, Math.min(1.0, value));
    storeSharedValue('bubblesMerge', bubblesMerge.value);
  };

  const setBubblesSat = (value) => {
    bubblesSat.value = Math.max(0.5, Math.min(2.5, value));
    storeSharedValue('bubblesSat', bubblesSat.value);
  };

  const setBubblesSpec = (value) => {
    bubblesSpec.value = Math.max(0, Math.min(5, value));
    storeSharedValue('bubblesSpec', bubblesSpec.value);
  };

  const setBubblesFresnel = (value) => {
    bubblesFresnel.value = Math.max(0, Math.min(1, value));
    storeSharedValue('bubblesFresnel', bubblesFresnel.value);
  };

  const setBubblesSize = (value) => {
    bubblesSize.value = Math.max(0.08, Math.min(0.30, value));
    storeSharedValue('bubblesSize', bubblesSize.value);
  };

  const setBubblesFlick = (value) => {
    bubblesFlick.value = Math.max(0, Math.min(30, value));
    storeSharedValue('bubblesFlick', bubblesFlick.value);
  };

  const setBubblesSpring = (value) => {
    bubblesSpring.value = Math.max(0.1, Math.min(3, value));
    storeSharedValue('bubblesSpring', bubblesSpring.value);
  };

  const setBubblesDamp = (value) => {
    bubblesDamp.value = Math.max(0.80, Math.min(0.99, value));
    storeSharedValue('bubblesDamp', bubblesDamp.value);
  };

  const setBubblesContact = (value) => {
    bubblesContact.value = Math.max(0.8, Math.min(3.0, value));
    storeSharedValue('bubblesContact', bubblesContact.value);
  };

  const setBubblesSharp = (value) => {
    bubblesSharp.value = Math.max(0.02, Math.min(0.25, value));
    storeSharedValue('bubblesSharp', bubblesSharp.value);
  };

  const setBubblesNormal = (value) => {
    bubblesNormal.value = Math.max(1.0, Math.min(6.0, value));
    storeSharedValue('bubblesNormal', bubblesNormal.value);
  };

  const setBubblesRmin = (value) => {
    bubblesRmin.value = Math.max(0.01, Math.min(0.08, value));
    storeSharedValue('bubblesRmin', bubblesRmin.value);
  };

  const setBubblesVignette = (value) => {
    bubblesVignette.value = Math.max(0, Math.min(0.5, value));
    storeSharedValue('bubblesVignette', bubblesVignette.value);
  };

  const setBubblesBallCount = (value) => {
    bubblesBallCount.value = Math.max(8, Math.min(32, Math.round(value)));
    storeSharedValue('bubblesBallCount', bubblesBallCount.value);
  };

  const setBubblesNoise = (value) => {
    bubblesNoise.value = Math.max(0, Math.min(0.15, value));
    storeSharedValue('bubblesNoise', bubblesNoise.value);
  };

  const setBubblesParallax = (value) => {
    bubblesParallax.value = Math.max(0, Math.min(0.001, value));
    storeSharedValue('bubblesParallax', bubblesParallax.value);
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
    const storedCursorGlow = loadSharedValue('cursorGlow');
    if (storedCursorGlow !== null) cursorGlow.value = storedCursorGlow === '1';
    applyCursorGlow();

    const storedBubblesEnabled = loadSharedValue('bubblesEnabled');
    if (storedBubblesEnabled !== null) bubblesEnabled.value = storedBubblesEnabled === '1';
    const storedBubblesRepulse = loadSharedValue('bubblesRepulse');
    if (storedBubblesRepulse) bubblesRepulse.value = parseFloat(storedBubblesRepulse);
    const storedBubblesDrift = loadSharedValue('bubblesDrift');
    if (storedBubblesDrift) bubblesDrift.value = parseFloat(storedBubblesDrift);
    const storedBubblesMerge = loadSharedValue('bubblesMerge');
    if (storedBubblesMerge) bubblesMerge.value = parseFloat(storedBubblesMerge);
    const storedBubblesSat = loadSharedValue('bubblesSat');
    if (storedBubblesSat) bubblesSat.value = parseFloat(storedBubblesSat);
    const storedBubblesSpec = loadSharedValue('bubblesSpec');
    if (storedBubblesSpec) bubblesSpec.value = parseFloat(storedBubblesSpec);
    const storedBubblesFresnel = loadSharedValue('bubblesFresnel');
    if (storedBubblesFresnel) bubblesFresnel.value = parseFloat(storedBubblesFresnel);
    const storedBubblesSize = loadSharedValue('bubblesSize');
    if (storedBubblesSize) bubblesSize.value = parseFloat(storedBubblesSize);
    const storedBubblesFlick = loadSharedValue('bubblesFlick');
    if (storedBubblesFlick) bubblesFlick.value = parseFloat(storedBubblesFlick);
    const storedBubblesSpring = loadSharedValue('bubblesSpring');
    if (storedBubblesSpring) bubblesSpring.value = parseFloat(storedBubblesSpring);
    const storedBubblesDamp = loadSharedValue('bubblesDamp');
    if (storedBubblesDamp) bubblesDamp.value = parseFloat(storedBubblesDamp);
    const storedBubblesContact = loadSharedValue('bubblesContact');
    if (storedBubblesContact) bubblesContact.value = parseFloat(storedBubblesContact);
    const storedBubblesSharp = loadSharedValue('bubblesSharp');
    if (storedBubblesSharp) bubblesSharp.value = parseFloat(storedBubblesSharp);
    const storedBubblesNormal = loadSharedValue('bubblesNormal');
    if (storedBubblesNormal) bubblesNormal.value = parseFloat(storedBubblesNormal);
    const storedBubblesRmin = loadSharedValue('bubblesRmin');
    if (storedBubblesRmin) bubblesRmin.value = parseFloat(storedBubblesRmin);
    const storedBubblesVignette = loadSharedValue('bubblesVignette');
    if (storedBubblesVignette) bubblesVignette.value = parseFloat(storedBubblesVignette);
    const storedBubblesBallCount = loadSharedValue('bubblesBallCount');
    if (storedBubblesBallCount) bubblesBallCount.value = parseInt(storedBubblesBallCount, 10);
    const storedBubblesNoise = loadSharedValue('bubblesNoise');
    if (storedBubblesNoise) bubblesNoise.value = parseFloat(storedBubblesNoise);
    const storedBubblesParallax = loadSharedValue('bubblesParallax');
    if (storedBubblesParallax) bubblesParallax.value = parseFloat(storedBubblesParallax);

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
    setCursorGlow(DEFAULTS.cursorGlow);
    setBubblesEnabled(DEFAULTS.bubblesEnabled);
    setBubblesRepulse(DEFAULTS.bubblesRepulse);
    setBubblesDrift(DEFAULTS.bubblesDrift);
    setBubblesMerge(DEFAULTS.bubblesMerge);
    setBubblesSat(DEFAULTS.bubblesSat);
    setBubblesSpec(DEFAULTS.bubblesSpec);
    setBubblesFresnel(DEFAULTS.bubblesFresnel);
    setBubblesSize(DEFAULTS.bubblesSize);
    setBubblesFlick(DEFAULTS.bubblesFlick);
    setBubblesSpring(DEFAULTS.bubblesSpring);
    setBubblesDamp(DEFAULTS.bubblesDamp);
    setBubblesContact(DEFAULTS.bubblesContact);
    setBubblesSharp(DEFAULTS.bubblesSharp);
    setBubblesNormal(DEFAULTS.bubblesNormal);
    setBubblesRmin(DEFAULTS.bubblesRmin);
    setBubblesVignette(DEFAULTS.bubblesVignette);
    setBubblesBallCount(DEFAULTS.bubblesBallCount);
    setBubblesNoise(DEFAULTS.bubblesNoise);
    setBubblesParallax(DEFAULTS.bubblesParallax);
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
    cursorGlow,
    bubblesEnabled,
    bubblesRepulse,
    bubblesDrift,
    bubblesMerge,
    bubblesSat,
    bubblesSpec,
    bubblesFresnel,
    bubblesSize,
    bubblesFlick,
    bubblesSpring,
    bubblesDamp,
    bubblesContact,
    bubblesSharp,
    bubblesNormal,
    bubblesRmin,
    bubblesVignette,
    bubblesBallCount,
    bubblesNoise,
    bubblesParallax,
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
    setCursorGlow,
    setBubblesEnabled,
    setBubblesRepulse,
    setBubblesDrift,
    setBubblesMerge,
    setBubblesSat,
    setBubblesSpec,
    setBubblesFresnel,
    setBubblesSize,
    setBubblesFlick,
    setBubblesSpring,
    setBubblesDamp,
    setBubblesContact,
    setBubblesSharp,
    setBubblesNormal,
    setBubblesRmin,
    setBubblesVignette,
    setBubblesBallCount,
    setBubblesNoise,
    setBubblesParallax,
    resetToDefaults,
    initTheme,
  };
}
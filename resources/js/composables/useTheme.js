import { ref, watch, onMounted } from 'vue';

const theme = ref('system');
const isDark = ref(false);

export function useTheme() {
  const setTheme = (newTheme) => {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme();
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    if (theme.value === 'dark') {
      root.classList.add('dark');
      isDark.value = true;
    } else if (theme.value === 'light') {
      root.classList.remove('dark');
      isDark.value = false;
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        isDark.value = true;
      } else {
        root.classList.remove('dark');
        isDark.value = false;
      }
    }
  };

  const initTheme = () => {
    const stored = localStorage.getItem('theme') || 'system';
    theme.value = stored;
    applyTheme();

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme();
      }
    });
  };

  return {
    theme,
    isDark,
    setTheme,
    initTheme,
  };
}
// ☀️ Climate Weather & Time-of-Day Theme Scheduler Engine

export function initWeatherThemeEngine() {
  const cloudsContainer = document.getElementById('clouds-container');
  
  /**
   * Determine whether it is Day or Night based on current local hour
   * Day: 6 AM to 6 PM (6:00 - 17:59)
   * Night: 6 PM to 6 AM (18:00 - 5:59)
   */
  function getTimeOfDayTheme() {
    const hours = new Date().getHours();
    return (hours >= 6 && hours < 18) ? 'day' : 'night';
  }

  /**
   * Applies the theme attribute to the document body
   */
  function applyTheme(theme) {
    if (theme === 'night') {
      document.body.setAttribute('data-theme', 'night');
    } else {
      document.body.removeAttribute('data-theme');
    }
    
    // Manage clouds rendering in DOM based on theme
    if (cloudsContainer) {
      if (theme === 'day') {
        if (cloudsContainer.children.length === 0) {
          // Mount day-mode clouds dynamically
          cloudsContainer.innerHTML = `
            <div class="cloud cloud-1"></div>
            <div class="cloud cloud-2"></div>
            <div class="cloud cloud-3"></div>
          `;
        }
      } else {
        cloudsContainer.innerHTML = '';
      }
    }
  }

  // Get initial theme preference: manual override > time of day
  const overrideTheme = localStorage.getItem('ecoquest_theme_override');
  const initialTheme = overrideTheme || getTimeOfDayTheme();
  applyTheme(initialTheme);

  return {
    /**
     * Get active theme name
     */
    getCurrentTheme: () => {
      return document.body.getAttribute('data-theme') === 'night' ? 'night' : 'day';
    },

    /**
     * Get descriptive climate string for UI weather cards
     */
    getClimateWeatherText: () => {
      const theme = document.body.getAttribute('data-theme') === 'night' ? 'night' : 'day';
      return theme === 'night' ? 'Starry Night' : 'Sunny Skies';
    },

    /**
     * Toggle theme manually and save preference in storage
     */
    toggleTheme: () => {
      const activeTheme = document.body.getAttribute('data-theme') === 'night' ? 'night' : 'day';
      const targetTheme = activeTheme === 'night' ? 'day' : 'night';
      
      localStorage.setItem('ecoquest_theme_override', targetTheme);
      applyTheme(targetTheme);
      
      // Dispatch custom theme changed event
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: targetTheme } }));
      return targetTheme;
    },

    /**
     * Clear manual override and revert to following live time
     */
    resetToLiveTime: () => {
      localStorage.removeItem('ecoquest_theme_override');
      const liveTheme = getTimeOfDayTheme();
      applyTheme(liveTheme);
      return liveTheme;
    }
  };
}

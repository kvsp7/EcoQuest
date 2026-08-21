// 🔔 Toast Notification Component

/**
 * Show a floating alert toast message
 * @param {string} message - Message text
 * @param {'success'|'error'|'info'|'warning'} type - Toast theme category
 * @param {number} duration - Display time in ms
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message glass-panel ${type}`;

  // Select icon based on category
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-exclamation';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" style="font-size: 1.25rem;"></i>
    <span style="font-family: var(--font-body); font-size: 0.95rem;">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove timer
  const removeTimeout = setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, duration);

  // Click to close
  toast.addEventListener('click', () => {
    clearTimeout(removeTimeout);
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  });
}

// Attach globally for convenience
window.showToast = showToast;

/* --- PTC Library System --- */
/* --- Toast Notification System --- */

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.error('Toast container not found!');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconClass = '';
  switch (type) {
    case 'success':
      iconClass = 'fas fa-check-circle';
      break;
    case 'error':
      iconClass = 'fas fa-times-circle';
      break;
    case 'info':
      iconClass = 'fas fa-info-circle';
      break;
    default:
      iconClass = 'fas fa-info-circle';
  }

  toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;

  container.appendChild(toast);

  // Trigger the fade-in animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // The fade-out animation is handled by CSS, but we need to remove the element
  setTimeout(() => {
    toast.classList.remove('show'); // Trigger fade-out
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000); // Matches the 3s duration (2.5s delay + 0.5s animation)
}
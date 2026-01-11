export class MessageHandler {
  showError(message, container) {
    container.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    setTimeout(() => {
      this.clear(container);
    }, 5000);
  }

  showSuccess(message, container) {
    container.innerHTML = `<div class="success-message">${message}</div>`;
    setTimeout(() => {
      this.clear(container);
    }, 3000);
  }

  clear(container) {
    container.innerHTML = '';
  }
}

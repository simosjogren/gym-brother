

export function showMessage(message, color='green') {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.style.color = color;
    }
}
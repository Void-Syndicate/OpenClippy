class ChatUI {
  constructor() {
    this.chatWindow = document.getElementById('chat-window');
    this.messagesEl = document.getElementById('chat-messages');
    this.inputEl = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('btn-send');
    this.speechBubble = document.getElementById('speech-bubble');
    this.speechText = document.getElementById('speech-text');
    this.visible = false;
    this.currentStreamEl = null;

    this.sendBtn.addEventListener('click', () => this.onSend());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.onSend();
    });

    document.getElementById('btn-close-chat').addEventListener('click', () => this.hide());
    document.getElementById('btn-minimize-chat').addEventListener('click', () => this.hide());
  }

  onSendCallback = null;

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  show() {
    this.visible = true;
    this.chatWindow.style.display = '';
    this.speechBubble.style.display = 'none';
    this.inputEl.focus();
  }

  hide() {
    this.visible = false;
    this.chatWindow.style.display = 'none';
  }

  showSpeechBubble(text) {
    this.speechText.textContent = text;
    this.speechBubble.style.display = 'block';
    setTimeout(() => {
      if (this.speechBubble.style.display === 'block' && !this.visible) {
        this.speechBubble.style.display = 'none';
      }
    }, 8000);
  }

  hideSpeechBubble() {
    this.speechBubble.style.display = 'none';
  }

  addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `msg ${role === 'user' ? 'user-msg' : 'clippy-msg'}`;
    div.textContent = content;
    this.messagesEl.appendChild(div);
    // clearfix
    const clear = document.createElement('div');
    clear.style.clear = 'both';
    this.messagesEl.appendChild(clear);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return div;
  }

  startStreamMessage() {
    const div = document.createElement('div');
    div.className = 'msg clippy-msg';
    div.textContent = '';
    this.messagesEl.appendChild(div);
    const clear = document.createElement('div');
    clear.style.clear = 'both';
    this.messagesEl.appendChild(clear);
    this.currentStreamEl = div;
    return div;
  }

  appendToStream(text) {
    if (this.currentStreamEl) {
      this.currentStreamEl.textContent += text;
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }

  updateStream(fullText) {
    if (this.currentStreamEl) {
      this.currentStreamEl.textContent = fullText;
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }

  endStream() { this.currentStreamEl = null; }

  clearMessages() {
    this.messagesEl.innerHTML = '';
  }

  onSend() {
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.inputEl.value = '';
    if (this.onSendCallback) this.onSendCallback(text);
  }
}

// app.js — Main renderer entry
(async function () {
  const clippy = new ClippyController();
  const chat = new ChatUI();
  const api = new OpenClawAPI();
  await api.init();

  let soundEnabled = true;
  let idleTimer = null;
  let isSending = false;

  const idleSuggestions = [
    "It looks like you're staring at the screen. Need help?",
    "Did you know I was voted most helpful assistant in 1997?",
    "I see you haven't asked me anything. I'm here to help! \ud83d\udcce",
    "It looks like you're procrastinating. Want me to help you get started?",
    "Fun fact: I'm made of 100% recycled pixels! \ud83d\udcce",
    "Need to write a letter? I can help with that!",
    "I'm not just a pretty paperclip, you know. Ask me anything!"
  ];

  // Greeting on start
  clippy.greeting();
  setTimeout(() => {
    chat.showSpeechBubble("Hi! I'm Clippy, your assistant! Click me to chat. \ud83d\udcce");
  }, 500);

  // Idle timer
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!isSending) {
        const msg = idleSuggestions[Math.floor(Math.random() * idleSuggestions.length)];
        clippy.tap();
        setTimeout(() => chat.showSpeechBubble(msg), 600);
      }
      resetIdleTimer();
    }, 60000);
  }
  resetIdleTimer();

  // Click Clippy to toggle chat
  clippy.container.addEventListener('click', (e) => {
    if (e.button === 0) {
      chat.toggle();
      chat.hideSpeechBubble();
      resetIdleTimer();
    }
  });

  // Send message
  chat.onSendCallback = async (text) => {
    if (isSending) return;
    isSending = true;
    resetIdleTimer();
    chat.hideSpeechBubble();
    chat.addMessage('user', text);
    clippy.thinking();
    chat.startStreamMessage();

    await api.sendMessage(
      text,
      (token, full) => {
        clippy.talking();
        chat.updateStream(full);
      },
      (fullResponse, error) => {
        if (error) {
          chat.updateStream('Oops! Something went wrong: ' + error);
        }
        chat.endStream();
        clippy.idle();
        isSending = false;
      }
    );
  };

  // Dragging
  let isDragging = false;
  let dragStartX, dragStartY;

  clippy.container.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      dragStartX = e.screenX;
      dragStartY = e.screenY;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.screenX - dragStartX;
      const dy = e.screenY - dragStartY;
      dragStartX = e.screenX;
      dragStartY = e.screenY;
      window.electronAPI.moveWindow(dx, dy);
    }
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  // Click-through: ignore mouse on transparent areas, detect on interactive
  const interactiveEls = ['#clippy-container', '#chat-window', '#speech-bubble', '#context-menu'];

  document.addEventListener('mouseover', (e) => {
    const isInteractive = interactiveEls.some(sel => e.target.closest(sel));
    window.electronAPI.setIgnoreMouse(!isInteractive);
  });

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
      window.electronAPI.setIgnoreMouse(true);
    }
  });

  // Right-click context menu
  const ctxMenu = document.getElementById('context-menu');

  clippy.container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ctxMenu.style.display = 'block';
    ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 160) + 'px';
    ctxMenu.style.top = Math.max(e.clientY - 120, 0) + 'px';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#context-menu')) {
      ctxMenu.style.display = 'none';
    }
  });

  document.getElementById('ctx-clear').addEventListener('click', () => {
    chat.clearMessages();
    api.clearHistory();
    ctxMenu.style.display = 'none';
  });

  document.getElementById('ctx-sound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    ctxMenu.style.display = 'none';
  });

  document.getElementById('ctx-ontop').addEventListener('click', () => {
    window.electronAPI.toggleAlwaysOnTop();
    ctxMenu.style.display = 'none';
  });

  document.getElementById('ctx-quit').addEventListener('click', () => {
    window.electronAPI.quitApp();
  });

  // IPC: clear chat from tray
  window.electronAPI.clearChat(() => {
    chat.clearMessages();
    api.clearHistory();
  });

})();

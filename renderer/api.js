class OpenClawAPI {
  constructor() {
    this.config = null;
    this.conversationHistory = [];
    this.systemPrompt = "You are Clippy, the classic Microsoft Office assistant. You are helpful, enthusiastic, and a little annoying — in an endearing way. You often start suggestions with 'It looks like you\u0027re trying to...' You use simple, friendly language. You occasionally make paperclip puns. Keep responses concise (2-3 sentences max unless asked for detail).";
  }

  async init() {
    this.config = await window.electronAPI.getConfig();
  }

  addMessage(role, content) {
    this.conversationHistory.push({ role, content });
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  async sendMessage(userMessage, onToken, onDone) {
    this.addMessage('user', userMessage);

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory
    ];

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error ${response.status}: ${err}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              onToken(delta, fullResponse);
            }
          } catch (e) { /* skip unparseable lines */ }
        }
      }

      this.addMessage('assistant', fullResponse);
      onDone(fullResponse);
    } catch (err) {
      onDone(null, err.message);
    }
  }
}

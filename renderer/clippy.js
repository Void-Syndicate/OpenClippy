class ClippyController {
  constructor() {
    this.el = document.getElementById('clippy');
    this.container = document.getElementById('clippy-container');
    this.thinkingDots = document.getElementById('thinking-dots');
    this.state = 'idle';
  }

  setState(state) {
    this.el.className = '';
    this.state = state;
    this.el.classList.add(state);
    if (state === 'thinking') {
      this.thinkingDots.style.display = 'block';
    } else {
      this.thinkingDots.style.display = 'none';
    }
  }

  idle() { this.setState('idle'); }
  thinking() { this.setState('thinking'); }
  talking() { this.setState('talking'); }
  greeting() {
    this.setState('greeting');
    setTimeout(() => this.idle(), 1800);
  }
  tap() {
    this.setState('tapping');
    setTimeout(() => this.idle(), 1200);
  }
}

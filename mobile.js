/**
 * Adaptive Mobile Touch & Virtual Joystick Controller
 */
class MobileController {
  constructor(onShoot, onJump, onDash, onSwitchGun) {
    this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.moveVector = { x: 0, y: 0 };
    this.lookDelta = { x: 0, y: 0 };

    this.onShoot = onShoot;
    this.onJump = onJump;
    this.onDash = onDash;
    this.onSwitchGun = onSwitchGun;

    if (this.isMobile) {
      document.getElementById('mobile-controls').classList.remove('hidden');
      document.getElementById('platform-controls-hint').innerText = 'TOUCH CONTROLS ACTIVE';
      this.initJoystick();
      this.initTouchCamera();
      this.initButtons();
    }
  }

  initJoystick() {
    const base = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    let touchId = null;
    let center = { x: 0, y: 0 };

    base.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = base.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    window.addEventListener('touchmove', (e) => {
      for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
          let dx = touch.clientX - center.x;
          let dy = touch.clientY - center.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 45;

          if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
          }

          stick.style.transform = `translate(${dx}px, ${dy}px)`;
          this.moveVector.x = dx / maxDist;
          this.moveVector.y = dy / maxDist;
        }
      }
    });

    const resetJoystick = (e) => {
      for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
          touchId = null;
          stick.style.transform = 'translate(0px, 0px)';
          this.moveVector = { x: 0, y: 0 };
        }
      }
    };

    window.addEventListener('touchend', resetJoystick);
    window.addEventListener('touchcancel', resetJoystick);
  }

  initTouchCamera() {
    const zone = document.getElementById('touch-camera-zone');
    let touchId = null;
    let lastPos = { x: 0, y: 0 };

    zone.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      lastPos = { x: touch.clientX, y: touch.clientY };
    });

    window.addEventListener('touchmove', (e) => {
      for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
          this.lookDelta.x = (touch.clientX - lastPos.x) * 0.005;
          this.lookDelta.y = (touch.clientY - lastPos.y) * 0.005;
          lastPos = { x: touch.clientX, y: touch.clientY };
        }
      }
    });

    const endLook = (e) => {
      for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
          touchId = null;
          this.lookDelta = { x: 0, y: 0 };
        }
      }
    };

    window.addEventListener('touchend', endLook);
    window.addEventListener('touchcancel', endLook);
  }

  initButtons() {
    document.getElementById('mbtn-fire').addEventListener('touchstart', (e) => { e.preventDefault(); this.onShoot(); });
    document.getElementById('mbtn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); this.onJump(); });
    document.getElementById('mbtn-dash').addEventListener('touchstart', (e) => { e.preventDefault(); this.onDash(); });

    document.querySelectorAll('.mwpn-btn').forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        document.querySelectorAll('.mwpn-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onSwitchGun(parseInt(btn.dataset.slot));
      });
    });
  }

  consumeLookDelta() {
    const delta = { ...this.lookDelta };
    this.lookDelta = { x: 0, y: 0 };
    return delta;
  }
}

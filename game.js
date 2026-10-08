/**
 * Main Roblox Rivals Engine & Mode Controller
 */

class SoundEffects {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playShot(type) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'sniper') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    } else if (type === 'shotgun') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playHit(isHeadshot = false) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isHeadshot ? 1200 : 800, this.ctx.currentTime);
    osc.frequency.setValueAtTime(isHeadshot ? 1600 : 1000, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

const WEAPONS = {
  rifle: { name: 'Assault Rifle', damage: 22, fireRate: 110, ammo: 30, color: 0x333333 },
  shotgun: { name: 'Pump Shotgun', damage: 12, pellets: 8, fireRate: 850, ammo: 8, color: 0x552200 },
  sniper: { name: 'Sniper Rifle', damage: 95, fireRate: 1200, ammo: 5, color: 0x111111 },
  pistol: { name: 'Handgun', damage: 25, fireRate: 220, ammo: 12, color: 0x666666 },
  knife: { name: 'Knife', damage: 60, fireRate: 400, ammo: Infinity, color: 0xaaaaaa }
};

class GameEngine {
  constructor() {
    this.sfx = new SoundEffects();
    this.network = new NetworkManager();
    this.friends = new FriendsManager((code) => this.joinFriendMatch(code));

    this.mode = 'MENU'; // MENU, ONLINE, NPC, RANGE
    this.isGameActive = false;
    this.selectedPrimary = 'rifle';
    this.activeWeaponKey = 'rifle';
    this.health = 100;
    this.playerScore = 0;
    this.enemyScore = 0;
    this.lastShotTime = 0;

    // Range Stats
    this.rangeShots = 0;
    this.rangeHits = 0;
    this.rangeScore = 0;

    this.position = new THREE.Vector3(0, 3, 20);
    this.velocity = new THREE.Vector3();
    this.pitch = 0; this.yaw = 0;

    this.initThree();
    this.initMap();
    this.initUI();
    this.initInputs();

    this.clock = new THREE.Clock();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x68b0d8);
    this.scene.fog = new THREE.FogExp2(0x68b0d8, 0.015);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(40, 80, 20);
    this.scene.add(ambient, sun);

    this.gunGroup = new THREE.Group();
    this.camera.add(this.gunGroup);
    this.scene.add(this.camera);
    this.buildGunMesh();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initMap() {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(90, 2, 90),
      new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
    );
    floor.position.set(0, -1, 0);
    this.scene.add(floor);

    const colors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x2ecc71];
    const addBox = (w, h, d, x, y, z, cIdx) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: colors[cIdx % colors.length] })
      );
      box.position.set(x, y, z);
      this.scene.add(box);
    };

    // Barriers
    addBox(92, 12, 2, 0, 5, -45, 0);
    addBox(92, 12, 2, 0, 5, 45, 0);
    addBox(2, 12, 92, -45, 5, 0, 0);
    addBox(2, 12, 92, 45, 5, 0, 0);

    // Arena Obstacles
    addBox(12, 6, 6, 0, 3, 0, 1);
    addBox(8, 5, 14, -18, 2.5, -12, 2);
    addBox(8, 5, 14, 18, 2.5, 12, 3);
  }

  buildGunMesh() {
    while (this.gunGroup.children.length > 0) this.gunGroup.remove(this.gunGroup.children[0]);
    const wpn = WEAPONS[this.activeWeaponKey];
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.3, 1.1),
      new THREE.MeshStandardMaterial({ color: wpn.color })
    );
    mesh.position.set(0.35, -0.35, -0.6);
    this.gunGroup.add(mesh);
  }

  initUI() {
    // Menu Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.tab).classList.add('active');
      });
    });

    // Weapon Loadout
    document.querySelectorAll('.wpn-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('.wpn-card').forEach(c => c.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.selectedPrimary = target.dataset.wpn;
        this.activeWeaponKey = this.selectedPrimary;
        this.buildGunMesh();
      });
    });

    // Host Online
    document.getElementById('btn-host').addEventListener('click', () => {
      this.network.initHost(this.friends.myCode, (code) => {
        document.getElementById('room-code-display').innerText = code;
        document.getElementById('lobby-panel').classList.remove('hidden');
      });
    });

    // Join Online
    document.getElementById('btn-join').addEventListener('click', () => {
      const code = document.getElementById('join-code-input').value.trim();
      this.joinFriendMatch(code);
    });

    document.getElementById('btn-start-online').addEventListener('click', () => {
      this.network.send({ type: 'START' });
      this.startMatch('ONLINE');
    });

    // Start NPC Mode
    document.getElementById('btn-start-npc').addEventListener('click', () => {
      const diff = document.getElementById('ai-difficulty').value;
      this.bot = new AIBot(this.scene, diff);
      this.startMatch('NPC');
    });

    // Start Shooting Range Mode
    document.getElementById('btn-start-range').addEventListener('click', () => {
      this.targets = [
        new RangeTarget(this.scene, new THREE.Vector3(-10, 3, -15)),
        new RangeTarget(this.scene, new THREE.Vector3(0, 4, -20)),
        new RangeTarget(this.scene, new THREE.Vector3(12, 3, -12))
      ];
      this.startMatch('RANGE');
    });

    document.getElementById('btn-rematch').addEventListener('click', () => window.location.reload());

    this.network.onConnect(() => {
      document.getElementById('lobby-status').innerText = 'OPPONENT CONNECTED!';
      if (this.network.isHost) document.getElementById('btn-start-online').classList.remove('hidden');
    });

    this.network.onData((data) => this.handleNetworkData(data));
  }

  joinFriendMatch(code) {
    if (!code) return alert('Enter a room code!');
    this.network.joinLobby(code, () => {
      document.getElementById('lobby-panel').classList.remove('hidden');
      document.getElementById('lobby-status').innerText = 'Connected! Waiting for host...';
    }, () => alert('Failed to connect to lobby!'));
  }

  initInputs() {
    document.getElementById('game-canvas').addEventListener('click', () => {
      if (this.isGameActive) document.body.requestPointerLock();
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== document.body) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;
      this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
    });

    document.addEventListener('keydown', (e) => {
      if (!this.isGameActive) return;
      if (e.code === 'KeyW') this.moveF = true;
      if (e.code === 'KeyS') this.moveB = true;
      if (e.code === 'KeyA') this.moveL = true;
      if (e.code === 'KeyD') this.moveR = true;
      if (e.code === 'Space' && this.canJump) { this.velocity.y = 12; this.canJump = false; }
      if (e.code === 'ShiftLeft') this.isSprint = true;
      if (e.code === 'Digit1') this.switchGun(this.selectedPrimary);
      if (e.code === 'Digit2') this.switchGun('pistol');
      if (e.code === 'Digit3') this.switchGun('knife');
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW') this.moveF = false;
      if (e.code === 'KeyS') this.moveB = false;
      if (e.code === 'KeyA') this.moveL = false;
      if (e.code === 'KeyD') this.moveR = false;
      if (e.code === 'ShiftLeft') this.isSprint = false;
    });

    document.addEventListener('mousedown', (e) => {
      if (e.button === 0 && document.pointerLockElement === document.body) this.shoot();
    });
  }

  switchGun(key) {
    this.activeWeaponKey = key;
    this.buildGunMesh();
    this.updateHUD();
  }

  startMatch(mode) {
    this.mode = mode;
    this.isGameActive = true;
    this.health = 100;
    this.playerScore = 0;
    this.enemyScore = 0;

    document.getElementById('menu-overlay').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('mode-badge').innerText = `MODE: ${mode}`;

    if (mode === 'RANGE') {
      document.getElementById('range-stats').classList.remove('hidden');
    }

    document.body.requestPointerLock();
    this.updateHUD();
  }

  shoot() {
    const now = Date.now();
    const wpn = WEAPONS[this.activeWeaponKey];
    if (now - this.lastShotTime < wpn.fireRate) return;
    this.lastShotTime = now;

    this.sfx.playShot(this.activeWeaponKey);
    this.gunGroup.position.z += 0.12;
    setTimeout(() => this.gunGroup.position.z = 0, 70);

    if (this.mode === 'RANGE') this.rangeShots++;

    const raycaster = new THREE.Raycaster(this.camera.position, this.camera.getWorldDirection(new THREE.Vector3()));

    if (this.mode === 'NPC' && this.bot) {
      const hits = raycaster.intersectObject(this.bot.mesh, true);
      if (hits.length > 0) {
        const isHead = hits[0].object.userData.isHead;
        const dmg = isHead ? wpn.damage * 2 : wpn.damage;
        this.sfx.playHit(isHead);
        this.showHitmarker();

        this.bot.health -= dmg;
        if (this.bot.health <= 0) {
          this.playerScore++;
          this.addKillFeed('YOU eliminated NPC Bot');
          this.bot.respawn();
          this.checkWin();
        }
      }
    } else if (this.mode === 'RANGE') {
      const targetMeshes = this.targets.map(t => t.mesh);
      const hits = raycaster.intersectObjects(targetMeshes);
      if (hits.length > 0) {
        this.rangeHits++;
        this.rangeScore += 100;
        this.sfx.playHit(true);
        this.showHitmarker();
        const targetObj = this.targets.find(t => t.mesh === hits[0].object);
        if (targetObj) targetObj.hit();
      }
      this.updateRangeHUD();
    }
  }

  showHitmarker() {
    const hm = document.getElementById('hitmarker');
    hm.classList.add('active');
    setTimeout(() => hm.classList.remove('active'), 100);
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.updateHUD();

    if (this.health <= 0) {
      this.enemyScore++;
      this.addKillFeed('Enemy eliminated YOU');
      this.checkWin();
      this.health = 100;
      this.position.set((Math.random() - 0.5) * 20, 3, 20);
      this.updateHUD();
    }
  }

  checkWin() {
    document.getElementById('player-score').innerText = `YOU: ${this.playerScore}`;
    document.getElementById('enemy-score').innerText = `ENEMY: ${this.enemyScore}`;

    if (this.playerScore >= 5 || this.enemyScore >= 5) {
      this.isGameActive = false;
      document.exitPointerLock();
      document.getElementById('game-over-overlay').classList.remove('hidden');
      document.getElementById('winner-title').innerText = this.playerScore >= 5 ? 'VICTORY!' : 'DEFEAT!';
    }
  }

  addKillFeed(txt) {
    const feed = document.getElementById('kill-feed');
    const msg = document.createElement('div');
    msg.className = 'kill-msg';
    msg.innerText = txt;
    feed.appendChild(msg);
    setTimeout(() => msg.remove(), 3500);
  }

  handleNetworkData(data) {
    if (data.type === 'START') this.startMatch('ONLINE');
  }

  updateHUD() {
    const wpn = WEAPONS[this.activeWeaponKey];
    document.getElementById('health-bar-fill').style.width = `${this.health}%`;
    document.getElementById('health-text').innerText = `${this.health} / 100`;
    document.getElementById('weapon-name').innerText = wpn.name;
    document.getElementById('ammo-count').innerText = `${wpn.ammo} / ∞`;
  }

  updateRangeHUD() {
    const acc = this.rangeShots > 0 ? Math.round((this.rangeHits / this.rangeShots) * 100) : 100;
    document.getElementById('range-score').innerText = this.rangeScore;
    document.getElementById('range-acc').innerText = `${acc}%`;
    document.getElementById('range-targets').innerText = `${this.rangeHits} / 20`;
  }

  updatePhysics(delta) {
    if (!this.isGameActive) return;

    const speed = this.isSprint ? 18 : 11;
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= 32.0 * delta;

    const dir = new THREE.Vector3();
    if (this.moveF) dir.z -= 1;
    if (this.moveB) dir.z += 1;
    if (this.moveL) dir.x -= 1;
    if (this.moveR) dir.x += 1;
    dir.normalize();
    dir.applyEuler(new THREE.Euler(0, this.yaw, 0, 'YXZ'));

    if (this.moveF || this.moveB) this.velocity.z += dir.z * speed * 8.0 * delta;
    if (this.moveL || this.moveR) this.velocity.x += dir.x * speed * 8.0 * delta;

    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    this.position.y += this.velocity.y * delta;

    if (this.position.y < 2.5) {
      this.velocity.y = 0;
      this.position.y = 2.5;
      this.canJump = true;
    }

    this.camera.position.copy(this.position);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    if (this.mode === 'NPC' && this.bot) {
      this.bot.update(delta, this.position, (dmg) => this.takeDamage(dmg));
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

let game;
window.onload = () => { game = new GameEngine(); };

function loop() {
  requestAnimationFrame(loop);
  if (game) {
    const delta = Math.min(game.clock.getDelta(), 0.1);
    game.updatePhysics(delta);
    game.render();
  }
}
loop();

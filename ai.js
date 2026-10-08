/**
 * AI Bot Logic & Shooting Range Target Management
 */
class AIBot {
  constructor(scene, difficulty = 'medium') {
    this.scene = scene;
    this.difficulty = difficulty;
    this.health = 100;
    this.position = new THREE.Vector3(0, 3, -20);
    this.velocity = new THREE.Vector3();
    this.lastShot = 0;
    
    // Difficulty Settings
    const settings = {
      easy: { speed: 6, fireRate: 900, accuracy: 0.25, dmg: 10 },
      medium: { speed: 10, fireRate: 500, accuracy: 0.55, dmg: 15 },
      hard: { speed: 14, fireRate: 250, accuracy: 0.85, dmg: 22 }
    };
    this.config = settings[difficulty] || settings.medium;

    this.mesh = this.buildBotMesh();
    this.scene.add(this.mesh);
  }

  buildBotMesh() {
    const group = new THREE.Group();
    const matHead = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
    const matTorso = new THREE.MeshStandardMaterial({ color: 0x34495e });
    const matLimbs = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), matHead);
    head.position.y = 2.4;
    head.userData = { isHead: true };
    group.add(head);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.8), matTorso);
    torso.position.y = 1.1;
    group.add(torso);

    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), matLimbs);
    leg1.position.set(-0.45, -0.6, 0);
    group.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), matLimbs);
    leg2.position.set(0.45, -0.6, 0);
    group.add(leg2);

    group.position.copy(this.position);
    return group;
  }

  update(delta, playerPos, onShootPlayer) {
    if (this.health <= 0) return;

    // Movement AI
    const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    dir.y = 0;
    const dist = dir.length();

    if (dist > 8) {
      dir.normalize();
      this.mesh.position.addScaledVector(dir, this.config.speed * delta);
    }

    this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

    // Shooting AI
    const now = Date.now();
    if (now - this.lastShot > this.config.fireRate && dist < 35) {
      this.lastShot = now;
      if (Math.random() < this.config.accuracy) {
        onShootPlayer(this.config.dmg);
      }
    }
  }

  respawn() {
    this.health = 100;
    this.mesh.position.set((Math.random() - 0.5) * 30, 3, -20);
  }

  remove() {
    this.scene.remove(this.mesh);
  }
}

class RangeTarget {
  constructor(scene, position) {
    this.scene = scene;
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xff3b3b })
    );
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.copy(position);
    this.scene.add(this.mesh);
    this.active = true;
  }

  respawn() {
    this.mesh.position.set((Math.random() - 0.5) * 30, 2 + Math.random() * 4, -10 - Math.random() * 20);
    this.active = true;
    this.mesh.visible = true;
  }

  hit() {
    this.active = false;
    this.mesh.visible = false;
    setTimeout(() => this.respawn(), 1000);
  }

  remove() {
    this.scene.remove(this.mesh);
  }
}

/**
 * Smart AI Bot Engine with Wall Navigation & Strafing
 */
class AdvancedBotAI {
  constructor(scene, mapCollider, difficulty = 'medium') {
    this.scene = scene;
    this.collider = mapCollider;
    this.health = 100;
    this.position = new THREE.Vector3(0, 3, -20);
    this.lastShot = 0;
    this.strafeDir = 1;
    this.nextStrafeChange = 0;

    const settings = {
      easy: { speed: 7, fireRate: 850, accuracy: 0.35, dmg: 10 },
      medium: { speed: 11, fireRate: 450, accuracy: 0.65, dmg: 16 },
      hard: { speed: 15, fireRate: 220, accuracy: 0.88, dmg: 22 }
    };
    this.config = settings[difficulty] || settings.medium;

    this.mesh = this.buildMesh();
    this.scene.add(this.mesh);
  }

  buildMesh() {
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

    const now = Date.now();
    const toPlayer = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();

    // Change Strafe Direction periodically
    if (now > this.nextStrafeChange) {
      this.strafeDir = Math.random() < 0.5 ? 1 : -1;
      this.nextStrafeChange = now + 1200 + Math.random() * 1000;
    }

    // Strafe and move towards player
    toPlayer.normalize();
    const sideVector = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x).multiplyScalar(this.strafeDir);

    const moveStep = new THREE.Vector3()
      .addScaledVector(toPlayer, dist > 10 ? 0.7 : 0.2)
      .addScaledVector(sideVector, 0.8)
      .normalize()
      .multiplyScalar(this.config.speed * delta);

    this.mesh.position.add(moveStep);

    // Wall Collision Resolution for AI
    this.collider.resolveCollision(this.mesh.position, 1.2);

    // Face Player
    this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

    // Attack Player
    if (now - this.lastShot > this.config.fireRate && dist < 40) {
      this.lastShot = now;
      if (Math.random() < this.config.accuracy) {
        onShootPlayer(this.config.dmg);
      }
    }
  }

  respawn() {
    this.health = 100;
    this.mesh.position.set((Math.random() - 0.5) * 30, 3, -25);
  }

  remove() { this.scene.remove(this.mesh); }
}

class TargetDummy {
  constructor(scene, position) {
    this.scene = scene;
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16),
      new THREE.MeshStandardMaterial({ map: TextureGenerator.createTargetTexture() })
    );
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.copy(position);
    this.scene.add(this.mesh);
    this.active = true;
  }

  respawn() {
    this.mesh.position.set((Math.random() - 0.5) * 32, 2 + Math.random() * 4, -10 - Math.random() * 20);
    this.active = true;
    this.mesh.visible = true;
  }

  hit() {
    this.active = false;
    this.mesh.visible = false;
    setTimeout(() => this.respawn(), 900);
  }
}

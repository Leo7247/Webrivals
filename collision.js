/**
 * Rigid Wall & Obstacle Collision Engine (Zero-Clipping)
 */
class MapCollider {
  constructor() {
    this.boxes = [];
  }

  addBox(x, y, z, width, height, depth) {
    const min = new THREE.Vector3(x - width / 2, y - height / 2, z - depth / 2);
    const max = new THREE.Vector3(x + width / 2, y + height / 2, z + depth / 2);
    this.boxes.push(new THREE.Box3(min, max));
  }

  // Resolves player/NPC sphere against all map bounding boxes
  resolveCollision(position, radius = 1.2) {
    const playerBox = new THREE.Box3();

    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes[i];
      playerBox.setFromCenterAndSize(position, new THREE.Vector3(radius * 2, 5.0, radius * 2));

      if (box.intersectsBox(playerBox)) {
        // Calculate penetration depths
        const overlapX1 = box.max.x - playerBox.min.x;
        const overlapX2 = playerBox.max.x - box.min.x;
        const overlapZ1 = box.max.z - playerBox.min.z;
        const overlapZ2 = playerBox.max.z - box.min.z;

        const minX = overlapX1 < overlapX2 ? overlapX1 : -overlapX2;
        const minZ = overlapZ1 < overlapZ2 ? overlapZ1 : -overlapZ2;

        // Push back along smaller axis
        if (Math.abs(minX) < Math.abs(minZ)) {
          position.x += minX;
        } else {
          position.z += minZ;
        }
      }
    }
  }
}

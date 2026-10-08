/**
 * Procedural Canvas Texture Generator
 * Creates studio studs, tiles, wooden crate faces, and target patterns
 */
class TextureGenerator {
  static createStudFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base Floor Tile
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 256, 256);

    // Grid Borders
    ctx.strokeStyle = '#1a252f';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 256);

    // Roblox Studs
    ctx.fillStyle = '#34495e';
    for (let x = 32; x < 256; x += 64) {
      for (let y = 32; y < 256; y += 64) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#243342';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    return texture;
  }

  static createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, 128, 128);

    // Neon Trim Borders
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 128, 128);

    ctx.fillStyle = '#2d3436';
    ctx.fillRect(10, 10, 108, 108);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createCrateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#d35400';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 120, 120);

    // X-Brace Cross
    ctx.beginPath();
    ctx.moveTo(8, 8); ctx.lineTo(120, 120);
    ctx.moveTo(120, 8); ctx.lineTo(8, 120);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  static createTargetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    const rings = [110, 80, 50, 20];
    const colors = ['#e74c3c', '#ffffff', '#e74c3c', '#f1c40f'];

    rings.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  }
}

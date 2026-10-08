# Roblox Rivals Web Edition (v2.0)

A high-performance, responsive 3D arena FPS engine built with **Three.js** and **PeerJS** designed for zero-server deployment on **GitHub Pages**.

## 🚀 Features & Updates
* **Collision Physics (`collision.js`)**: Real-time AABB bounding boxes prevent clipping through walls for both PC players and Smart Bots.
* **Procedural Textures (`textures.js`)**: Dynamic canvas textures (stud floors, neon trim walls, wooden crates, bullseye targets) without broken external images.
* **Adaptive Touch Overlay (`mobile.js`)**: Automatic detection and rendering of virtual joysticks, touch-drag cameras, and buttons for mobile devices.
* **Smart AI Bot Engine (`ai.js`)**: Advanced bots with strafe maneuvers, wall navigation, and predictive aiming.
* **Floating 3D Damage**: Visual popups for body hits and headshots.

---

## 🛠 Deployment Instructions for GitHub Pages

1. **Create Repository**:
   Create a new public repository on GitHub (e.g. `roblox-rivals-web`).

2. **Commit Code Files**:
   Upload all 8 files into the root directory:
   * `index.html`
   * `style.css`
   * `textures.js`
   * `collision.js`
   * `mobile.js`
   * `friends.js`
   * `network.js`
   * `ai.js`
   * `game.js`
   * `README.md`

3. **Enable GitHub Pages**:
   * Go to **Settings** -> **Pages**.
   * Under **Source**, choose `Deploy from a branch`.
   * Pick `main` branch and `/ (root)` folder. Click **Save**.

4. **Play**: Live at `https://<your-username>.github.io/<repo-name>/`!

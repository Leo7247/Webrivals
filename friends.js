/**
 * LocalStorage Friends List Manager
 */
class FriendsManager {
  constructor(onConnectFriend) {
    this.onConnectFriend = onConnectFriend;
    this.friends = JSON.parse(localStorage.getItem('rivals_friends') || '[]');
    this.myCode = this.getOrGenerateCode();
    this.initUI();
  }

  getOrGenerateCode() {
    let code = localStorage.getItem('rivals_my_code');
    if (!code) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('rivals_my_code', code);
    }
    return code;
  }

  initUI() {
    document.getElementById('my-friend-id').innerText = this.myCode;
    
    document.getElementById('btn-add-friend').addEventListener('click', () => {
      const nameInput = document.getElementById('friend-name-input');
      const codeInput = document.getElementById('friend-code-input');
      const name = nameInput.value.trim();
      const code = codeInput.value.trim().toUpperCase();

      if (!name || !code) return alert('Please enter both name and code!');
      if (code === this.myCode) return alert('You cannot add yourself!');

      this.friends.push({ name, code });
      localStorage.setItem('rivals_friends', JSON.stringify(this.friends));
      nameInput.value = '';
      codeInput.value = '';
      this.render();
    });

    this.render();
  }

  render() {
    const listEl = document.getElementById('friends-list');
    listEl.innerHTML = '';

    if (this.friends.length === 0) {
      listEl.innerHTML = '<li style="color:#666">No friends added yet.</li>';
      return;
    }

    this.friends.forEach((f, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span><strong>${f.name}</strong> (${f.code})</span>
        <div class="f-actions">
          <button class="btn-sm accent-btn btn-join-f" data-code="${f.code}">JOIN</button>
          <button class="btn-sm secondary-btn btn-del-f" data-idx="${idx}">X</button>
        </div>
      `;
      listEl.appendChild(li);
    });

    document.querySelectorAll('.btn-join-f').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.target.dataset.code;
        this.onConnectFriend(code);
      });
    });

    document.querySelectorAll('.btn-del-f').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        this.friends.splice(idx, 1);
        localStorage.setItem('rivals_friends', JSON.stringify(this.friends));
        this.render();
      });
    });
  }
}

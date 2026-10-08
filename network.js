/**
 * PeerJS Peer-to-Peer Network Manager
 */
class NetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.onConnectCallback = null;
    this.onDataCallback = null;
  }

  // Initialize Host Room Code
  initHost(onReady) {
    this.isHost = true;
    this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.peer = new Peer('rivals-' + this.roomCode);

    this.peer.on('open', () => {
      if (onReady) onReady(this.roomCode);
    });

    this.peer.on('connection', (connection) => {
      this.conn = connection;
      this.setupConnectionHandlers();
    });

    this.peer.on('error', (err) => {
      alert('Network error: ' + err.type);
    });
  }

  // Join existing host
  joinLobby(code, onSuccess, onError) {
    this.isHost = false;
    this.roomCode = code.toUpperCase();
    this.peer = new Peer();

    this.peer.on('open', () => {
      this.conn = this.peer.connect('rivals-' + this.roomCode);
      this.setupConnectionHandlers();
      if (onSuccess) onSuccess();
    });

    this.peer.on('error', (err) => {
      if (onError) onError(err);
    });
  }

  setupConnectionHandlers() {
    this.conn.on('open', () => {
      if (this.onConnectCallback) this.onConnectCallback();
    });

    this.conn.on('data', (data) => {
      if (this.onDataCallback) this.onDataCallback(data);
    });

    this.conn.on('close', () => {
      alert('Opponent disconnected!');
      window.location.reload();
    });
  }

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  onConnect(cb) {
    this.onConnectCallback = cb;
  }

  onData(cb) {
    this.onDataCallback = cb;
  }
}

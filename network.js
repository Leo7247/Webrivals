/**
 * PeerJS P2P WebRTC Multiplayer Controller
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

  initHost(customCode, onReady) {
    this.isHost = true;
    this.roomCode = customCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    this.peer = new Peer('rivals-' + this.roomCode);

    this.peer.on('open', () => {
      if (onReady) onReady(this.roomCode);
    });

    this.peer.on('connection', (connection) => {
      this.conn = connection;
      this.setupHandlers();
    });

    this.peer.on('error', (err) => alert('Network error: ' + err.type));
  }

  joinLobby(code, onSuccess, onError) {
    this.isHost = false;
    this.roomCode = code.toUpperCase();
    this.peer = new Peer();

    this.peer.on('open', () => {
      this.conn = this.peer.connect('rivals-' + this.roomCode);
      this.setupHandlers();
      if (onSuccess) onSuccess();
    });

    this.peer.on('error', (err) => {
      if (onError) onError(err);
    });
  }

  setupHandlers() {
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
    if (this.conn && this.conn.open) this.conn.send(data);
  }

  onConnect(cb) { this.onConnectCallback = cb; }
  onData(cb) { this.onDataCallback = cb; }
}

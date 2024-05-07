let socket = io.connect('http://localhost:3000');
socket.on('number', (msg) => {
  console.log('Random number: ' + msg);
});

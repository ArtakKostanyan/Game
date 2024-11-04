import { connect } from './socket.js';

export function initializeSocketEvents() {

    const socket = connect().getSocket();

    socket.on('gameCreated', (data) => {
        console.log('Game created:', data);
    });

    socket.on('startGame', (data) => {
        console.log('Game starting:', data);
    });


}

export function createGame(gameData) {
    const socket = connect().getSocket();
    socket.emit('createGame', gameData);
}

export function sendMessage(message) {
    const socket = connect().getSocket();
    socket.emit('sendMessage', message);
}

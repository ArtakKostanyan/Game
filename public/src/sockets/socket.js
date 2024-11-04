let socketInstance = null;

function connect() {

    if (!socketInstance) {
        socketInstance = io();

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    }

    return {
        getSocket
    };
}

export function joinGame(gameId) {
    const socket = getSocket();
    socket.emit('joinGame', gameId);
}

export function getSocket() {
    if (!socketInstance) {
        throw new Error('Socket not connected. Please call connect() first.');
    }
    return socketInstance;
}

export function disconnect() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        console.log('Disconnected from socket server');
    }
}

export { connect };

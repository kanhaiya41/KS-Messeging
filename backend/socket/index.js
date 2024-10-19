import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.URL,
        methods: ['POST', 'GET']
    }
});

let users = [];
// let sockets=[];

export const getReceiverSocketId = (userId) => {
    const user = users.find((user) => user.userId === userId);
    return user ? user.socketId : null;
}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        users.push({ userId, socketId: socket.id });
        console.log("user connected", users);
    }
    io.emit('getOnlineUsers', users.map(user => user.userId));
    socket.on('disconnect', () => {
        if (userId) {
            users = users.filter(id => id !== userId);
            console.log('User disconnected', users);
        }
        io.emit('getOnlineUsers', users);
    });
});

export { app, server, io };


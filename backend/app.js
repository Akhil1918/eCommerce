const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/user');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
// const orderRoutes = require('./routes/order');
// const chatRoutes = require('./routes/chat');
// const adminRoutes = require('./routes/admin');
const http = require('http');
const morgan = require('morgan');
const socketIo = require('socket.io');
const { verifyToken } = require('./middleware/auth');
const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', verifyToken, userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
// app.use('/api/orders', verifyToken, orderRoutes);
// app.use('/api/chat', verifyToken, chatRoutes);
// app.use('/api/admin', verifyToken, adminRoutes);

// Socket.io Chat Implementation
const activeUsers = new Map();
io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        activeUsers.set(userId, socket.id);
    });

    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
        const receiverSocket = activeUsers.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('receiveMessage', { senderId, message });
        }
    });

    socket.on('disconnect', () => {
        activeUsers.forEach((value, key) => {
            if (value === socket.id) {
                activeUsers.delete(key);
            }
        });
    });
});

require('./db/connection');

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketio = require('socket.io');

dotenv.config({ path: './config.env' });

console.log("RAW DATABASE ENV =", process.env.DB_URI);

const app = require('./app');

const server = http.createServer(app);
const io = socketio(server);
app.set("io", io);

// ✅ MongoDB connection (ONLY HERE)
mongoose.connect(process.env.DB_URI)
    .then(() => console.log("✅ DB connection successful!"))
    .catch(err => {
        console.error("❌ DB connection failed:", err.message);
        process.exit(1);
    });

// Socket.io
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("send-location", (data) => {
        io.emit("receive-location", {
            id: socket.id,
            lat: data.lat,
            lng: data.lng,
            time: new Date().toLocaleTimeString(),
            speed: data.speed || 0
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const port = process.env.PORT || 2000;
server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
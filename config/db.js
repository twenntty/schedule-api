const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connection.on('connected', () => console.log('✅ Успешно подключено к MongoDB Atlas'));
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
    mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected — driver will reconnect'));

    // Retry the initial connection instead of crashing the process.
    const connect = async () => {
        try {
            await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
        } catch (err) {
            console.error('❌ Ошибка подключения (повтор через 5с):', err.message);
            setTimeout(connect, 5000);
        }
    };
    connect();
};

module.exports = connectDB;

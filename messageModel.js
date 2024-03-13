const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  room: { type: String, required: true }, // Добавляем поле для хранения информации о комнате
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Создаем модель сообщений
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  timestamp: { type: Date, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, required: true },
  priority: { type: String, required: true },
  sender: { type: String, required: true },
  link: { type: String, required: true },
  authorCode: { type: String, required: true },
  sent: { type: Boolean, default: false },
});

module.exports = mongoose.model('notification', notificationSchema);
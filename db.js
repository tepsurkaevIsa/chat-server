const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://IsaTepsurkaev:IsaTepsurkaev@atlascluster.orjj6ma.mongodb.net/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

module.exports = mongoose.connection;

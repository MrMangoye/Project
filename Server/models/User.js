const mongoose = require('mongoose');  // ✅ add this line

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },   // changed from username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' }
});

module.exports = mongoose.model('User', userSchema);  // ✅ add this line
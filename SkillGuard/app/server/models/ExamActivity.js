const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamAttempt' },
  event: { type: String, enum: ['tab-hidden','copy-attempt','paste-attempt','cut-attempt','context-menu','fullscreen-exit','exam-start','exam-submit'], required: true },
  detail: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('ExamActivity', activitySchema);

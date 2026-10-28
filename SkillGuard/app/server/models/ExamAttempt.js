const mongoose = require('mongoose');
const examAttemptSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  deadline: { type: Date, required: true },
  submittedAt: Date,
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOption: Number }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  status: { type: String, enum: ['in-progress','submitted','expired'], default: 'in-progress' },
  violations: [{ type: { type: String }, at: { type: Date, default: Date.now }, detail: String }]
}, { timestamps: true });
examAttemptSchema.index({ exam: 1, student: 1, createdAt: -1 });
module.exports = mongoose.model('ExamAttempt', examAttemptSchema);

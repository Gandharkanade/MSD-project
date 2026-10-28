const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, trim: true },
  options: { type: [String], validate: v => v.length >= 2, required: true },
  correctOption: { type: Number, required: true, min: 0 },
  points: { type: Number, default: 1, min: 1 }
});
const examSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true },
  instructions: { type: String, default: 'Choose the best answer for each question.' },
  durationMinutes: { type: Number, default: 20, min: 1, max: 240 },
  passMark: { type: Number, default: 70, min: 0, max: 100 },
  maxAttempts: { type: Number, default: 2, min: 1, max: 10 },
  questions: { type: [questionSchema], validate: v => v.length > 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Exam', examSchema);

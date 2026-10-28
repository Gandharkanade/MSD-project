const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true, required: true },
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  course:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course',       required: true },
  // exam and attempt are optional — certificate can be issued on course completion alone
  exam:          { type: mongoose.Schema.Types.ObjectId, ref: 'Exam',         required: false },
  attempt:       { type: mongoose.Schema.Types.ObjectId, ref: 'ExamAttempt',  required: false },
  issuedAt:      { type: Date, default: Date.now }
}, { timestamps: true });

// One certificate per student per course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);

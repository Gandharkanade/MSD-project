const mongoose = require('mongoose');

const enrolmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate enrolment for the same student and course
enrolmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrolment', enrolmentSchema);

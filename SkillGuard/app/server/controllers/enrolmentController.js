const crypto = require('crypto');
const Enrolment = require('../models/Enrolment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');

// @desc    Enrol in a course
// @route   POST /api/enrolments
// @access  Private/Student
const enrolCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required to enrol'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const existingEnrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrolment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const enrolment = await Enrolment.create({
      student: req.user._id,
      course: courseId,
      completedLessons: [],
      progress: 0
    });

    const populatedEnrolment = await Enrolment.findById(enrolment._id).populate('course');

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully!',
      data: populatedEnrolment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's enrolled courses
// @route   GET /api/enrolments/my-enrolments
// @access  Private
const getMyEnrolments = async (req, res, next) => {
  try {
    const enrolments = await Enrolment.find({ student: req.user._id })
      .populate('course')
      .sort({ lastAccessed: -1 });

    res.status(200).json({
      success: true,
      count: enrolments.length,
      data: enrolments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolment details for a specific course
// @route   GET /api/enrolments/course/:courseId
// @access  Private
const getEnrolmentByCourse = async (req, res, next) => {
  try {
    const enrolment = await Enrolment.findOne({
      student: req.user._id,
      course: req.params.courseId
    }).populate('course');

    if (!enrolment) {
      return res.status(404).json({
        success: false,
        isEnrolled: false,
        message: 'Student is not enrolled in this course'
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      data: enrolment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or mark a lesson as completed
// @route   POST /api/enrolments/course/:courseId/lesson/:lessonId
// @access  Private
const toggleLessonProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { status } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let enrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrolment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const lessonIndex = enrolment.completedLessons.findIndex(
      (id) => id.toString() === lessonId.toString()
    );

    if (status === 'completed' && lessonIndex === -1) {
      enrolment.completedLessons.push(lessonId);
    } else if (status === 'uncompleted' && lessonIndex !== -1) {
      enrolment.completedLessons.splice(lessonIndex, 1);
    } else if (!status) {
      if (lessonIndex > -1) {
        enrolment.completedLessons.splice(lessonIndex, 1);
      } else {
        enrolment.completedLessons.push(lessonId);
      }
    }

    // Recalculate progress
    let totalLessonsCount = 0;
    if (course.modules && Array.isArray(course.modules)) {
      course.modules.forEach((mod) => {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          totalLessonsCount += mod.lessons.length;
        }
      });
    }

    if (totalLessonsCount > 0) {
      enrolment.progress = Math.min(
        100,
        Math.round((enrolment.completedLessons.length / totalLessonsCount) * 100)
      );
    } else {
      enrolment.progress = 0;
    }

    enrolment.lastAccessed = Date.now();
    await enrolment.save();

    // --- Auto-issue certificate when course is 100% complete ---
    let certificate = null;
    if (enrolment.progress === 100) {
      try {
        // Check if certificate already exists
        certificate = await Certificate.findOne({
          student: req.user._id,
          course: courseId
        });

        if (!certificate) {
          certificate = await Certificate.create({
            certificateId: 'SG-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
            student: req.user._id,
            course: courseId
          });
        }
      } catch (certErr) {
        // Duplicate key — cert already exists, fetch it
        if (certErr.code === 11000) {
          certificate = await Certificate.findOne({
            student: req.user._id,
            course: courseId
          });
        } else {
          console.error('Certificate auto-issue error:', certErr.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: enrolment.progress === 100
        ? 'Course completed! Certificate issued.'
        : 'Progress updated',
      progress: enrolment.progress,
      completedLessons: enrolment.completedLessons,
      // Include certificate info in response when issued
      certificate: certificate
        ? { certificateId: certificate.certificateId, issuedAt: certificate.issuedAt }
        : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrolCourse,
  getMyEnrolments,
  getEnrolmentByCourse,
  toggleLessonProgress
};

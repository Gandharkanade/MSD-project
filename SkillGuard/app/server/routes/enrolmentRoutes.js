const express = require('express');
const router = express.Router();
const {
  enrolCourse,
  getMyEnrolments,
  getEnrolmentByCourse,
  toggleLessonProgress
} = require('../controllers/enrolmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All enrolment routes require authentication

router.post('/', enrolCourse);
router.get('/my-enrolments', getMyEnrolments);
router.get('/course/:courseId', getEnrolmentByCourse);
router.post('/course/:courseId/lesson/:lessonId', toggleLessonProgress);

module.exports = router;

const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/examController');

// --- Public routes (no auth required) ---
router.get('/verify/:certificateId', c.verifyCertificate);

// --- All routes below require authentication ---
router.use(protect);

// Static "mine" routes — must come BEFORE /:examId to avoid param collision
router.get('/mine/attempts', c.getMyAttempts);
router.get('/mine/certificates', c.myCertificates);

// Admin activity log — must come BEFORE /:examId
router.get('/admin/activities', authorize('Admin'), c.getActivities);

// Attempt routes — must come BEFORE /:examId to avoid "attempt" being captured as examId
router.post('/attempt/:attemptId/submit', c.submitAttempt);
router.post('/attempt/:attemptId/certificate', c.issueCertificate);

// Course exam listing
router.get('/course/:courseId', c.listCourseExams);

// Admin exam creation
router.post('/', authorize('Admin'), c.createExam);

// Dynamic /:examId routes — must come AFTER all static routes
router.get('/:examId', c.getExam);
router.post('/:examId/start', c.startAttempt);
router.post('/:examId/activity', c.logActivity);

module.exports = router;

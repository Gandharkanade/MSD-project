const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { downloadCertificate, getCourseCertificate } = require('../controllers/certificateController');

// Get certificate info for a specific course (student's own)
// Must come BEFORE /:certificateId/pdf to avoid route collision
router.get('/course/:courseId', protect, getCourseCertificate);

// Download certificate PDF by certificateId
router.get('/:certificateId/pdf', protect, downloadCertificate);

module.exports = router;

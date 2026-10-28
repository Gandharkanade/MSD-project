const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Certificate = require('../models/Certificate');

// @desc    Download a certificate as PDF
// @route   GET /api/certificates/:certificateId/pdf
// @access  Private
exports.downloadCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('student', 'name email')
      .populate('course', 'title category');

    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });

    if (req.user.role !== 'Admin' && String(cert.student._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'This certificate belongs to another student' });
    }

    const verifyUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/verify/${cert.certificateId}`;
    const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });
    const qrImage = Buffer.from(qr.split(',')[1], 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SkillGuard-${cert.certificateId}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 48 });
    doc.pipe(res);

    const w = doc.page.width, h = doc.page.height;

    // Border
    doc.rect(20, 20, w - 40, h - 40).lineWidth(3).stroke('#4f46e5');
    doc.rect(30, 30, w - 60, h - 60).lineWidth(1).stroke('#a5b4fc');

    // Header
    doc.fillColor('#312e81').fontSize(17).font('Helvetica-Bold')
      .text('SKILLGUARD • AI & MACHINE LEARNING ACADEMY', { align: 'center', characterSpacing: 1 });
    doc.moveDown(1.2);

    // Title
    doc.fillColor('#111827').fontSize(34).font('Helvetica-Bold')
      .text('CERTIFICATE OF COMPLETION', { align: 'center' });
    doc.moveDown(0.8);

    // Body
    doc.fillColor('#6b7280').fontSize(15).font('Helvetica')
      .text('This certificate is proudly presented to', { align: 'center' });
    doc.moveDown(0.35);
    doc.fillColor('#4338ca').fontSize(30).font('Helvetica-Bold')
      .text(cert.student.name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#374151').fontSize(15).font('Helvetica')
      .text('for successfully completing the course', { align: 'center' });
    doc.moveDown(0.35);
    doc.fillColor('#111827').fontSize(23).font('Helvetica-Bold')
      .text(cert.course.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#4b5563').fontSize(12)
      .text(
        `Issued on ${new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        { align: 'center' }
      );

    // QR code
    doc.image(qrImage, w - 150, h - 145, { width: 88 });

    // Footer text
    doc.fillColor('#6b7280').fontSize(9)
      .text(`Certificate ID: ${cert.certificateId}`, 48, h - 90, { width: 300 });
    doc.fontSize(9)
      .text('Scan QR code to verify this certificate.', w - 230, h - 48, { width: 180, align: 'center' });

    doc.end();
  } catch (e) {
    next(e);
  }
};

// @desc    Get a student's certificate for a specific course
// @route   GET /api/certificates/course/:courseId
// @access  Private
exports.getCourseCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({
      student: req.user._id,
      course: req.params.courseId
    }).populate('course', 'title category');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'No certificate found for this course'
      });
    }

    res.json({
      success: true,
      data: {
        certificateId: cert.certificateId,
        courseTitle: cert.course.title,
        issuedAt: cert.issuedAt
      }
    });
  } catch (e) {
    next(e);
  }
};

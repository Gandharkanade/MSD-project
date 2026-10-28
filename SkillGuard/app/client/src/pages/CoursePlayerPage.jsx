import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProgressBar } from '../components/ProgressBar';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  Award, 
  Download,
  Sparkles
} from 'lucide-react';

export const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolment, setEnrolment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [certificate, setCertificate] = useState(null); // holds { certificateId, issuedAt } when earned
  const [certError, setCertError] = useState('');

  // Active module & lesson indices
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.courses.getById(courseId),
          api.enrolments.getCourseEnrolment(courseId)
        ]);

        setCourse(courseRes.data);
        setEnrolment(enrollRes.data);

        // If already at 100%, fetch existing certificate
        if (enrollRes.data?.progress === 100) {
          api.exams.getCertificateByCourse(courseId)
            .then(r => setCertificate(r.data))
            .catch(() => {}); // no cert yet is fine
        }
      } catch (err) {
        console.error('Failed to load learning player:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [courseId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Preparing your interactive learning room...
      </div>
    );
  }

  if (!course || !enrolment) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Course Access Unavailable</h2>
        <p style={{ margin: '1rem 0 2rem' }}>You must be enrolled to access this learning room.</p>
        <Link to={`/courses/${courseId}`} className="btn btn-primary">
          View Course Details
        </Link>
      </div>
    );
  }

  const currentModule = course.modules?.[activeModuleIdx];
  const currentLesson = currentModule?.lessons?.[activeLessonIdx];

  const isLessonCompleted = (lessonId) => {
    return enrolment.completedLessons?.some((id) => id.toString() === lessonId?.toString());
  };

  const handleToggleLesson = async (lessonId) => {
    if (!lessonId || toggling) return;

    setToggling(true);
    try {
      const res = await api.enrolments.toggleLesson(courseId, lessonId);
      setEnrolment((prev) => ({
        ...prev,
        progress: res.progress,
        completedLessons: res.completedLessons
      }));
      // Server auto-issues certificate at 100% — capture it
      if (res.certificate) {
        setCertificate(res.certificate);
      }
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    } finally {
      setToggling(false);
    }
  };

  // Linear lesson list for Next / Prev navigation
  const allLessons = [];
  course.modules?.forEach((mod, mIdx) => {
    mod.lessons?.forEach((les, lIdx) => {
      allLessons.push({
        moduleIdx: mIdx,
        lessonIdx: lIdx,
        lesson: les,
        moduleTitle: mod.title
      });
    });
  });

  const currentFlatIndex = allLessons.findIndex(
    (item) => item.moduleIdx === activeModuleIdx && item.lessonIdx === activeLessonIdx
  );

  const handleNextLesson = () => {
    if (currentFlatIndex < allLessons.length - 1) {
      const nextItem = allLessons[currentFlatIndex + 1];
      setActiveModuleIdx(nextItem.moduleIdx);
      setActiveLessonIdx(nextItem.lessonIdx);
    }
  };

  const handlePrevLesson = () => {
    if (currentFlatIndex > 0) {
      const prevItem = allLessons[currentFlatIndex - 1];
      setActiveModuleIdx(prevItem.moduleIdx);
      setActiveLessonIdx(prevItem.lessonIdx);
    }
  };

  const isCurrentCompleted = currentLesson ? isLessonCompleted(currentLesson._id) : false;

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      {/* Top Header Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-outline btn-sm" id="btn-back-dashboard">
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: '#fff' }}>{course.title}</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Instructor: {course.instructor} • {allLessons.length} Total Lessons
            </div>
          </div>
        </div>

        {/* Course Progress Widget */}
        <div style={{ minWidth: '220px', maxWidth: '300px', flex: 1 }}>
          <ProgressBar progress={enrolment.progress} />
        </div>
      </div>

      {/* Course Completion & Certificate Banner */}
      {enrolment?.progress === 100 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(79,70,229,0.15) 100%)',
          border: '1px solid rgba(52,211,153,0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Award size={26} color="#34d399" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#34d399' }}>
                Course Completed!
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                You have completed all lessons in <strong style={{ color: '#fff' }}>{course.title}</strong>.
                {certificate
                  ? ' Your certificate is ready to download.'
                  : ' Your certificate of completion has been issued.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {certificate ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    api.exams.downloadCertificate(certificate.certificateId)
                      .catch(e => setCertError(e.message))
                  }
                >
                  <Download size={16} />
                  <span>Download Certificate</span>
                </button>
                <Link to="/certificates" className="btn btn-secondary">
                  View All Certificates
                </Link>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() =>
                  api.exams.getCertificateByCourse(courseId)
                    .then(r => setCertificate(r.data))
                    .catch(e => setCertError(e.message))
                }
              >
                <Sparkles size={16} />
                <span>Get Certificate</span>
              </button>
            )}
          </div>
        </div>
      )}

      {certError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{certError}</div>
      )}

      {/* Main Player Grid */}
      <div className="player-layout">
        {/* Left Sidebar: Syllabus & Lessons */}
        <div className="player-sidebar">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} color="#818cf8" />
            <span>Course Syllabus</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {course.modules?.map((mod, mIdx) => (
              <div key={mod._id || mIdx} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#93c5fd', marginBottom: '0.5rem' }}>
                  Module {mIdx + 1}: {mod.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {mod.lessons?.map((lesson, lIdx) => {
                    const completed = isLessonCompleted(lesson._id);
                    const isActive = mIdx === activeModuleIdx && lIdx === activeLessonIdx;

                    return (
                      <div
                        key={lesson._id || lIdx}
                        onClick={() => {
                          setActiveModuleIdx(mIdx);
                          setActiveLessonIdx(lIdx);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          background: isActive ? 'rgba(79, 70, 229, 0.25)' : 'transparent',
                          border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                          transition: 'var(--transition)'
                        }}
                      >
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLesson(lesson._id);
                          }}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title={completed ? 'Completed' : 'Mark Completed'}
                        >
                          {completed ? (
                            <CheckCircle size={16} color="var(--success)" />
                          ) : (
                            <Circle size={16} color="var(--text-muted)" />
                          )}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '0.825rem', 
                            color: isActive ? '#fff' : completed ? 'var(--text-secondary)' : 'var(--text-main)',
                            fontWeight: isActive ? 600 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {lesson.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Reader Area */}
        <div className="player-content-area">
          {currentLesson ? (
            <>
              {/* Lesson Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-beginner" style={{ marginBottom: '0.5rem' }}>
                    Module {activeModuleIdx + 1} • Lesson {activeLessonIdx + 1} of {currentModule?.lessons?.length || 0}
                  </span>
                  <h1 style={{ fontSize: '1.85rem', color: '#fff', margin: '0.35rem 0' }}>
                    {currentLesson.title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} />
                    <span>Estimated Study Time: {currentLesson.duration || '15 mins'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleLesson(currentLesson._id)}
                  disabled={toggling}
                  className={`btn ${isCurrentCompleted ? 'btn-success' : 'btn-outline'}`}
                  id="btn-toggle-complete-lesson"
                >
                  {isCurrentCompleted ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Completed ✓</span>
                    </>
                  ) : (
                    <>
                      <Circle size={16} />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lesson Content Box */}
              <div style={{ flex: 1, fontSize: '1.05rem', lineHeight: 1.8, color: '#e2e8f0', background: 'rgba(11, 15, 25, 0.4)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                {currentLesson.content}
              </div>

              {/* Bottom Navigation: Prev & Next buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={handlePrevLesson}
                  disabled={currentFlatIndex === 0}
                  className="btn btn-secondary"
                  id="btn-prev-lesson"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Lesson</span>
                </button>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Lesson {currentFlatIndex + 1} of {allLessons.length}
                </div>

                <button
                  onClick={handleNextLesson}
                  disabled={currentFlatIndex === allLessons.length - 1}
                  className="btn btn-primary"
                  id="btn-next-lesson"
                >
                  <span>Next Lesson</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Select a lesson from the syllabus to begin studying.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

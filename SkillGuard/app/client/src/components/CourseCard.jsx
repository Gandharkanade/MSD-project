import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, User, ArrowRight, PlayCircle } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

export const CourseCard = ({ course, enrolment = null }) => {
  const getDifficultyBadgeClass = (diff) => {
    switch (diff) {
      case 'Intermediate':
        return 'badge-intermediate';
      case 'Advanced':
        return 'badge-advanced';
      default:
        return 'badge-beginner';
    }
  };

  // Calculate total lessons
  const totalLessons = course.totalLessons !== undefined 
    ? course.totalLessons 
    : (course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0);

  const fallbackThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="course-card" id={`course-card-${course._id}`}>
      <div className="course-card-thumb-wrap">
        <img 
          src={course.thumbnail || fallbackThumbnail} 
          alt={course.title} 
          className="course-card-thumb"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackThumbnail;
          }}
        />
        <span className="course-card-category">{course.category}</span>
        <span className={`badge course-card-difficulty ${getDifficultyBadgeClass(course.difficulty)}`}>
          {course.difficulty}
        </span>
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-desc">{course.description}</p>

        <div className="course-card-meta">
          <span className="course-meta-item" title="Instructor">
            <User size={14} />
            {course.instructor}
          </span>
          <span className="course-meta-item" title="Duration">
            <Clock size={14} />
            {course.duration}
          </span>
          <span className="course-meta-item" title="Curriculum">
            <BookOpen size={14} />
            {totalLessons} lessons
          </span>
        </div>

        {enrolment && (
          <div style={{ marginBottom: '1rem' }}>
            <ProgressBar progress={enrolment.progress} />
          </div>
        )}

        <div className="course-card-footer">
          {enrolment ? (
            <Link 
              to={`/learn/${course._id}`} 
              className="btn btn-primary btn-block btn-sm"
              id={`btn-resume-${course._id}`}
            >
              <PlayCircle size={16} />
              <span>{enrolment.progress === 100 ? 'Review Course' : 'Resume Learning'}</span>
            </Link>
          ) : (
            <Link 
              to={`/courses/${course._id}`} 
              className="btn btn-secondary btn-block btn-sm"
              id={`btn-view-${course._id}`}
            >
              <span>Explore Course</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

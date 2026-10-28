import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';
import { StatCard } from '../components/StatCard';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  FolderPlus 
} from 'lucide-react';

const CourseExamLinks = ({courseId}) => { const [exams,setExams]=useState([]); useEffect(()=>{api.exams.listForCourse(courseId).then(r=>setExams(r.data||[])).catch(()=>{});},[courseId]); return exams.length ? <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>{exams.map(e=><Link key={e._id} className="btn btn-secondary" to={`/exam/${e._id}`}>Take: {e.title}</Link>)}</div> : null; };

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolments = async () => {
      try {
        const response = await api.enrolments.getMyEnrolments();
        setEnrolments(response.data);
      } catch (err) {
        console.error('Failed to load student enrolments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolments();
  }, []);

  const totalEnrolled = enrolments.length;
  const completedCourses = enrolments.filter((e) => e.progress === 100).length;
  const inProgressCourses = enrolments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrolments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrolled)
    : 0;

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-role-student" style={{ marginBottom: '0.5rem' }}>
            Student Workspace
          </div>
          <h1>Welcome, {user?.name}!</h1>
          <p>Track your enrolled courses, resume active modules, and review your completion milestones.</p>
        </div>

        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Link to="/certificates" className="btn btn-secondary">My Certificates</Link><Link to="/courses" className="btn btn-primary" id="dashboard-btn-browse">
          <BookOpen size={16} />
          <span>Browse More Courses</span>
        </Link></div>
      </div>

      {/* Student Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '3rem' }}>
        <StatCard 
          title="Enrolled Courses" 
          value={totalEnrolled} 
          icon={BookOpen} 
          color="#818cf8"
          id="stat-student-enrolled" 
        />
        <StatCard 
          title="Completed" 
          value={completedCourses} 
          icon={CheckCircle2} 
          color="#34d399"
          id="stat-student-completed" 
        />
        <StatCard 
          title="In Progress" 
          value={inProgressCourses} 
          icon={Clock} 
          color="#fbbf24"
          id="stat-student-inprogress" 
        />
        <StatCard 
          title="Overall Progress" 
          value={`${avgProgress}%`} 
          icon={TrendingUp} 
          color="#38bdf8"
          id="stat-student-avg-progress" 
        />
      </div>

      {/* Enrolled Courses Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>My Enrolled Courses</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {totalEnrolled} Active Enrollment{totalEnrolled === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading your registered courses...
          </div>
        ) : totalEnrolled > 0 ? (
          <div className="grid-3">
            {enrolments.map((enrolment) => (
              enrolment.course ? (
                <div key={enrolment._id}><CourseCard course={enrolment.course} enrolment={enrolment} /><CourseExamLinks courseId={enrolment.course._id} /></div>
              ) : null
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <FolderPlus size={28} />
            </div>
            <h3>No courses enrolled yet</h3>
            <p style={{ maxWidth: '440px', margin: '0.5rem auto 1.5rem' }}>
              You haven't enrolled in any courses so far. Explore our course catalog and start your learning path today!
            </p>
            <Link to="/courses" className="btn btn-primary" id="btn-empty-browse-courses">
              Explore Course Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

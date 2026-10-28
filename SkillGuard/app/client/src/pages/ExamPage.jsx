import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, Clock, AlertTriangle, Award, Download } from 'lucide-react';

export const ExamPage = () => {
  const { examId } = useParams();
  const [exam,setExam]=useState(null); const [attempt,setAttempt]=useState(null); const [answers,setAnswers]=useState({}); const [remaining,setRemaining]=useState(0); const [result,setResult]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [warnings,setWarnings]=useState(0); const [certificateId,setCertificateId]=useState('');
  useEffect(()=>{ api.exams.get(examId).then(r=>setExam(r.data)).catch(e=>setError(e.message)); },[examId]);
  const report=useCallback(async(event,detail='')=>{ try { await api.exams.log(examId,{event,detail,attemptId:attempt?._id}); } catch{} },[examId,attempt]);
  useEffect(()=>{ if(!attempt||result) return; const onVisibility=()=>{if(document.hidden){setWarnings(n=>n+1); report('tab-hidden','Exam tab became hidden');}}; const onCopy=e=>{e.preventDefault();setWarnings(n=>n+1);report('copy-attempt','Copy shortcut or event blocked');}; const onCut=e=>{e.preventDefault();setWarnings(n=>n+1);report('cut-attempt','Cut shortcut or event blocked');}; const onPaste=e=>{e.preventDefault();setWarnings(n=>n+1);report('paste-attempt','Paste shortcut or event blocked');}; const onContext=e=>{e.preventDefault();report('context-menu','Context menu blocked');}; document.addEventListener('visibilitychange',onVisibility); document.addEventListener('copy',onCopy); document.addEventListener('cut',onCut); document.addEventListener('paste',onPaste); document.addEventListener('contextmenu',onContext); const timer=setInterval(()=>{const s=Math.max(0,Math.floor((new Date(attempt.deadline).getTime()-Date.now())/1000));setRemaining(s);if(s===0) clearInterval(timer);},1000); return ()=>{document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('copy',onCopy);document.removeEventListener('cut',onCut);document.removeEventListener('paste',onPaste);document.removeEventListener('contextmenu',onContext);clearInterval(timer);}; },[attempt,result,report]);
  const start=async()=>{setBusy(true);setError('');try{const r=await api.exams.start(examId);setExam(r.exam);setAttempt(r.attempt);setRemaining(Math.max(0,Math.floor((new Date(r.attempt.deadline).getTime()-Date.now())/1000)));}catch(e){setError(e.message)}finally{setBusy(false)}};
  const submit = useCallback(async () => {
    if (!attempt || busy) return;
    setBusy(true);
    setError('');
    try {
      const payload = exam.questions.map(q => ({
        questionId: q._id,
        selectedOption: answers[q._id] === undefined ? -1 : Number(answers[q._id])
      }));
      const r = await api.exams.submit(attempt._id, payload);
      setResult(r.result);
      setAttempt(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [attempt, busy, exam, answers]);
  const issue=async()=>{try{const r=await api.exams.issueCertificate(result.attemptId);setCertificateId(r.data.certificateId)}catch(e){setError(e.message)}};
  useEffect(() => {
    if (attempt && remaining === 0 && !result && !busy) submit();
  }, [remaining, attempt, result, busy, submit]);
  if(!exam&&!error)return <div className="container" style={{padding:'4rem'}}>Loading exam…</div>;
  return <div className="container" style={{paddingTop:'2.5rem',maxWidth:900}}>
    <Link to="/dashboard" className="text-link">← Dashboard</Link><div className="card" style={{marginTop:20,padding:28}}>
      <div className="badge">AI & Machine Learning Assessment</div><h1 style={{marginTop:12}}>{exam?.title||'Exam'}</h1><p>{exam?.instructions}</p>
      {!attempt&&!result&&<><div className="grid-3" style={{margin:'24px 0'}}><div className="stat-card"><Clock/> <strong>{exam?.durationMinutes} minutes</strong><span>Time limit</span></div><div className="stat-card"><ShieldCheck/><strong>{exam?.passMark}%</strong><span>Pass mark</span></div><div className="stat-card"><Award/><strong>{exam?.questions?.length||0}</strong><span>Questions</span></div></div><div className="alert alert-warning"><AlertTriangle size={18}/> Copy/paste is blocked in this exam interface. Tab changes and restricted actions are logged. These browser controls discourage cheating but cannot guarantee prevention of external devices or screenshots.</div><button className="btn btn-primary" disabled={busy} onClick={start}>{busy?'Starting…':'Start timed exam'}</button></>}
      {attempt&&!result&&<><div className="alert alert-warning" style={{marginTop:16}}><Clock size={18}/> Time remaining: <strong>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong> · Warnings recorded: {warnings}</div>{warnings>=3&&<div className="alert alert-warning">Multiple focus-loss or copy/paste events have been recorded. Continue carefully.</div>}<div onCopy={e=>e.preventDefault()} onCut={e=>e.preventDefault()} onPaste={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} style={{userSelect:'none'}}>{exam.questions.map((q,i)=><div key={q._id} className="card" style={{padding:20,margin:'16px 0'}}><h3>{i+1}. {q.prompt}</h3>{q.options.map((opt,j)=><label key={j} style={{display:'flex',gap:10,padding:'10px 0',cursor:'pointer'}}><input type="radio" name={q._id} checked={Number(answers[q._id])===j} onChange={()=>setAnswers(a=>({...a,[q._id]:j}))}/>{opt}</label>)}</div>)}</div><button className="btn btn-primary" disabled={busy} onClick={submit}>{busy?'Submitting…':'Submit exam'}</button> <button className="btn btn-secondary" disabled={busy} onClick={()=>{if(window.confirm('Submit your exam now?'))submit()}}>Finish now</button></>}
      {result&&<div style={{marginTop:24}}><div className={result.passed?'alert alert-success':'alert alert-warning'}><Award/>{result.passed?'Congratulations, you passed!':'Exam submitted'} Your score: <strong>{result.percentage}%</strong> ({result.score}/{result.totalPoints}). Pass mark: {result.passMark}%. Activity events recorded: {result.violations}.</div><p>Certificates are issued after all course lessons are completed and a passing exam is recorded.</p>{result.passed&&!result.certificateId&&<button className="btn btn-primary" onClick={issue}>Check certificate eligibility</button>} {(result.certificateId||certificateId)&&<button className="btn btn-primary" onClick={()=>api.exams.downloadCertificate(result.certificateId||certificateId).catch(e=>setError(e.message))}>Download certificate PDF</button>} <Link className="btn btn-secondary" to="/dashboard">Return to dashboard</Link>{(result.certificateId||certificateId)&&<p>Certificate ID: {result.certificateId||certificateId} · <Link to="/certificates">View certificates</Link></p>}</div>}
      {error&&<div className="alert alert-error" style={{marginTop:16}}>{error}</div>}
    </div>
  </div>;
};

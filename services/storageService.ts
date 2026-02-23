import { ExamResult } from '../types';

const STORAGE_KEY = 'exam_evaluator_db';

export const saveResult = (result: ExamResult) => {
  const existing = getResults();
  
  // Unique Identifier based on USN + Subject + Exam Name to allow updates/overwrites
  const others = existing.filter(r => 
    !(r.usn?.toLowerCase() === result.usn?.toLowerCase() && 
      r.subjectCode === result.subjectCode && 
      r.examName === result.examName)
  );
  
  const updated = [...others, { ...result, timestamp: Date.now() }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getResults = (): ExamResult[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Get all results for a specific student to show history
export const getStudentHistory = (name: string, usn: string): ExamResult[] => {
  const results = getResults();
  return results.filter(r => 
    r.usn?.toLowerCase() === usn.trim().toLowerCase() && 
    r.studentName?.toLowerCase().includes(name.trim().toLowerCase())
  ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
};

// Legacy single fetch (optional, but keeping for compatibility if needed)
export const getStudentResult = (name: string, usn: string): ExamResult | undefined => {
  const history = getStudentHistory(name, usn);
  return history.length > 0 ? history[0] : undefined;
};

export const clearAllResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};
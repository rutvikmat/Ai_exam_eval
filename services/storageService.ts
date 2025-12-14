import { ExamResult } from '../types';

const STORAGE_KEY = 'exam_evaluator_db';

export const saveResult = (result: ExamResult) => {
  const existing = getResults();
  // Filter out previous result for same USN if exists to allow updates
  const others = existing.filter(r => r.usn?.toLowerCase() !== result.usn?.toLowerCase());
  const updated = [...others, { ...result, timestamp: Date.now() }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getResults = (): ExamResult[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getStudentResult = (name: string, usn: string): ExamResult | undefined => {
  const results = getResults();
  return results.find(r => 
    r.usn?.toLowerCase() === usn.trim().toLowerCase() && 
    r.studentName?.toLowerCase().includes(name.trim().toLowerCase())
  );
};

export const clearAllResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};
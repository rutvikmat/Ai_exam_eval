import React, { useState } from 'react';
import { Search, GraduationCap, ArrowLeft, AlertCircle, LogIn, ChevronRight, Calendar, BookOpen, Layers } from 'lucide-react';
import { getStudentHistory } from '../services/storageService';
import { ExamResult } from '../types';
import ResultDashboard from './ResultDashboard';

interface StudentPortalProps {
  onBack: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ onBack }) => {
  const [name, setName] = useState(() => localStorage.getItem('last_student_name') || '');
  const [usn, setUsn] = useState(() => localStorage.getItem('last_student_usn') || '');
  
  // State for view navigation
  const [view, setView] = useState<'LOGIN' | 'LIST' | 'DETAIL'>('LOGIN');
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !usn) {
      setError("Please enter both Name and USN");
      return;
    }

    const foundHistory = getStudentHistory(name, usn);
    
    if (foundHistory.length > 0) {
      localStorage.setItem('last_student_name', name);
      localStorage.setItem('last_student_usn', usn);
      setHistory(foundHistory);
      setView('LIST');
    } else {
      setHistory([]);
      setError("No records found. Please check your details or contact your faculty.");
    }
  };

  const handleSelectResult = (result: ExamResult) => {
    setSelectedResult(result);
    setView('DETAIL');
  };

  const handleBackToList = () => {
    setSelectedResult(null);
    setView('LIST');
  };

  const handleLogout = () => {
    setName('');
    setUsn('');
    localStorage.removeItem('last_student_name');
    localStorage.removeItem('last_student_usn');
    setHistory([]);
    setSelectedResult(null);
    setView('LOGIN');
    setError(null);
  };

  const averageScore = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.totalMarksObtained, 0) / history.length).toFixed(1)
    : 0;
  
  const totalMaxMarks = history.reduce((acc, curr) => acc + curr.totalMaxMarks, 0);
  const totalObtainedMarks = history.reduce((acc, curr) => acc + curr.totalMarksObtained, 0);
  const overallAccuracy = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
          <button 
            onClick={view === 'LOGIN' ? onBack : handleLogout}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {view === 'LOGIN' ? 'Back to Home' : 'Log Out'}
          </button>
          
          {view !== 'LOGIN' && (
              <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                  {name} ({usn})
              </div>
          )}
      </div>

      {view === 'LOGIN' && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="text-center mb-8">
                <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Student Login</h2>
                <p className="text-slate-500 mt-2">Enter your Name and USN to access your academic records.</p>
            </div>
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">USN (Seat Number)</label>
                <input
                  type="text"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. 1RV19CS001"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-start text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex justify-center items-center"
              >
                <LogIn className="w-5 h-5 mr-2" /> View Records
              </button>
            </form>
          </div>
        </div>
      )}

      {view === 'LIST' && (
        <div className="animate-fade-in-up">
           <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h2 className="text-3xl font-bold text-slate-900">Academic History</h2>
               <p className="text-slate-500 mt-2">Select an exam to view detailed performance analytics.</p>
             </div>
             <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Avg. Score</span>
                    <span className="text-xl font-bold text-indigo-600">{averageScore}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Overall Accuracy</span>
                    <span className="text-xl font-bold text-emerald-600">{overallAccuracy}%</span>
                </div>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((exam, index) => (
                  <div 
                    key={index}
                    onClick={() => handleSelectResult(exam)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                            {exam.timestamp ? new Date(exam.timestamp).toLocaleDateString() : 'N/A'}
                        </span>
                     </div>
                     
                     <h3 className="text-lg font-bold text-slate-900 mb-1">{exam.subjectCode || 'Unknown Subject'}</h3>
                     <p className="text-sm font-medium text-emerald-600 mb-4">{exam.examName || 'Exam'}</p>
                     
                     <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-slate-500">
                            <Layers className="w-4 h-4 mr-2" />
                            Class: {exam.className || 'N/A'} (Sem {exam.semester || '-'})
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            Max Marks: {exam.totalMaxMarks}
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Score</span>
                            <span className="text-2xl font-bold text-slate-900">{exam.totalMarksObtained}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                     </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {view === 'DETAIL' && selectedResult && (
        <div className="animate-fade-in-up">
           <div className="flex items-center mb-6">
             <button 
                onClick={handleBackToList}
                className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
             >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
             </button>
             <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedResult.subjectCode} - {selectedResult.examName}</h2>
                <p className="text-sm text-slate-500">Detailed performance analysis</p>
             </div>
           </div>
           <ResultDashboard result={selectedResult} />
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
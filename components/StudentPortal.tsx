import React, { useState } from 'react';
import { Search, GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import { getStudentResult } from '../services/storageService';
import { ExamResult } from '../types';
import ResultDashboard from './ResultDashboard';

interface StudentPortalProps {
  onBack: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !usn) {
      setError("Please enter both Name and USN");
      return;
    }

    const foundResult = getStudentResult(name, usn);
    if (foundResult) {
      setResult(foundResult);
      setSearched(true);
    } else {
      setResult(null);
      setError("No result found for this Name and USN. Please check your details or contact your faculty.");
    }
  };

  const clearSearch = () => {
    setResult(null);
    setName('');
    setUsn('');
    setSearched(false);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </button>

      {!result ? (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Student Portal</h2>
            <p className="text-slate-500 mt-2">Enter your credentials to view your exam results.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
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
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Check Results
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-slate-800">Exam Results</h2>
             <button onClick={clearSearch} className="text-sm font-medium text-slate-500 hover:text-emerald-600">
               Check Another
             </button>
           </div>
           <ResultDashboard result={result} />
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
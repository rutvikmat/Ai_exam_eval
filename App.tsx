import React, { useState } from 'react';
import { GraduationCap, Users, UserCheck } from 'lucide-react';
import TeacherPortal from './components/TeacherPortal';
import StudentPortal from './components/StudentPortal';

type ViewState = 'HOME' | 'TEACHER' | 'STUDENT';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setView('HOME')}
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              AI Exam Evaluator
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main>
        {view === 'HOME' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Smart Exam Management
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                A comprehensive solution for universities. Automate grading with AI and provide instant results to students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div 
                onClick={() => setView('TEACHER')}
                className="group cursor-pointer bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 hover:border-indigo-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <Users className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Teacher Portal</h3>
                <p className="text-slate-500 mb-6">Upload Master copies, grade batches of students, and export class reports to Excel.</p>
                <span className="text-indigo-600 font-semibold group-hover:underline">Login as Faculty &rarr;</span>
              </div>

              <div 
                onClick={() => setView('STUDENT')}
                className="group cursor-pointer bg-white p-8 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-50 hover:border-emerald-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                  <UserCheck className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Student Portal</h3>
                <p className="text-slate-500 mb-6">Check your exam results instantly by entering your Name and USN.</p>
                <span className="text-emerald-600 font-semibold group-hover:underline">Check Results &rarr;</span>
              </div>
            </div>
          </div>
        )}

        {view === 'TEACHER' && <TeacherPortal onBack={() => setView('HOME')} />}
        {view === 'STUDENT' && <StudentPortal onBack={() => setView('HOME')} />}
      </main>
    </div>
  );
};

export default App;
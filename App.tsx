import React, { useState } from 'react';
import { BookOpen, CheckSquare, GraduationCap, ArrowRight, Loader2, Sparkles, Users, UserCheck } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ResultDashboard from './components/ResultDashboard';
import TeacherPortal from './components/TeacherPortal';
import StudentPortal from './components/StudentPortal';
import { evaluateExam } from './services/geminiService';
import { FileData, ExamResult, EvaluationStatus } from './types';

type ViewState = 'HOME' | 'TEACHER' | 'STUDENT';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  // Single User State (Legacy/Demo mode)
  const [questionPaper, setQuestionPaper] = useState<FileData | null>(null);
  const [answerKey, setAnswerKey] = useState<FileData | null>(null);
  const [studentSheet, setStudentSheet] = useState<FileData | null>(null);
  const [status, setStatus] = useState<EvaluationStatus>(EvaluationStatus.IDLE);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEvaluate = questionPaper && answerKey && studentSheet;

  const handleEvaluate = async () => {
    if (!canEvaluate) return;

    setStatus(EvaluationStatus.ANALYZING);
    setError(null);

    try {
      const evaluationResult = await evaluateExam(
        questionPaper,
        answerKey,
        studentSheet
      );
      setResult(evaluationResult);
      setStatus(EvaluationStatus.COMPLETED);
    } catch (err) {
      setError("An error occurred during evaluation. Please try again.");
      setStatus(EvaluationStatus.ERROR);
    }
  };

  const handleReset = () => {
    setQuestionPaper(null);
    setAnswerKey(null);
    setStudentSheet(null);
    setResult(null);
    setStatus(EvaluationStatus.IDLE);
  };

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
        {view === 'HOME' && status === EvaluationStatus.IDLE && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Smart Exam Management
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                A comprehensive solution for universities. Automate grading with AI, transcribe handwriting to text, and provide instant results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              <div 
                onClick={() => setView('TEACHER')}
                className="group cursor-pointer bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 hover:border-indigo-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <Users className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Teacher Portal</h3>
                <p className="text-slate-500 mb-6">Upload Master copies (PDF/Img), grade batches of students, and export class reports.</p>
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
                <p className="text-slate-500 mb-6">Check your exam results and see AI-transcribed copies of your answers instantly.</p>
                <span className="text-emerald-600 font-semibold group-hover:underline">Check Results &rarr;</span>
              </div>
            </div>

            {/* Quick Demo Section */}
            <div className="border-t border-slate-200 pt-12">
               <h3 className="text-center text-slate-400 font-semibold uppercase tracking-wider text-sm mb-8">Or Try a Quick Demo</h3>
               <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <FileUploader 
                      label="1. Question Paper" 
                      description="Upload PDF or Image"
                      fileData={questionPaper} 
                      onFileChange={setQuestionPaper}
                      color="blue"
                    />
                    <FileUploader 
                      label="2. Answer Key" 
                      description="Upload PDF or Image"
                      fileData={answerKey} 
                      onFileChange={setAnswerKey}
                      color="purple"
                    />
                    <FileUploader 
                      label="3. Student Sheet" 
                      description="Upload PDF or Image"
                      fileData={studentSheet} 
                      onFileChange={setStudentSheet}
                      color="emerald"
                    />
                  </div>
                  <div className="mt-10 flex flex-col items-center">
                    <button
                      onClick={handleEvaluate}
                      disabled={!canEvaluate}
                      className={`
                        group relative flex items-center px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300
                        ${canEvaluate 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                      `}
                    >
                      <Sparkles className={`w-5 h-5 mr-2 ${canEvaluate ? 'animate-pulse' : ''}`} />
                      Start Quick Evaluation
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'HOME' && status === EvaluationStatus.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg border border-indigo-100">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-800">Transcribing & Grading...</h3>
            <p className="mt-2 text-slate-500 max-w-md text-center">
              We are reading the PDF/Images, converting handwriting to text, and applying the grading schema.
            </p>
          </div>
        )}

        {view === 'HOME' && status === EvaluationStatus.COMPLETED && result && (
          <div className="max-w-7xl mx-auto px-4 py-8">
             <ResultDashboard result={result} onReset={handleReset} />
          </div>
        )}

        {view === 'HOME' && status === EvaluationStatus.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
             <div className="bg-red-50 p-6 rounded-full mb-6">
               <div className="text-red-500 text-5xl">!</div>
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Evaluation Failed</h3>
             <p className="text-slate-500 mb-8 max-w-md text-center">
               {error || "We couldn't process the documents. Please ensure files are clear and try again."}
             </p>
             <button 
               onClick={() => setStatus(EvaluationStatus.IDLE)}
               className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
             >
               Try Again
             </button>
           </div>
        )}

        {view === 'TEACHER' && <TeacherPortal onBack={() => setView('HOME')} />}
        {view === 'STUDENT' && <StudentPortal onBack={() => setView('HOME')} />}
      </main>
    </div>
  );
};

export default App;
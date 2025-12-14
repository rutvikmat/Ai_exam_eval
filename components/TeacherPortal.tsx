import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Key, Upload, Plus, Download, Save, Trash2, Check, Loader2 } from 'lucide-react';
import FileUploader from './FileUploader';
import ResultDashboard from './ResultDashboard';
import { evaluateExam } from '../services/geminiService';
import { saveResult, getResults, clearAllResults } from '../services/storageService';
import { downloadClassReport } from '../services/csvService';
import { FileData, ExamResult, EvaluationStatus } from '../types';

interface TeacherPortalProps {
  onBack: () => void;
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBack }) => {
  // Session State
  const [questionPaper, setQuestionPaper] = useState<FileData | null>(null);
  const [answerKey, setAnswerKey] = useState<FileData | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  // Grading State
  const [studentName, setStudentName] = useState('');
  const [studentUsn, setStudentUsn] = useState('');
  const [studentSheet, setStudentSheet] = useState<FileData | null>(null);
  
  // Evaluation State
  const [status, setStatus] = useState<EvaluationStatus>(EvaluationStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  
  // Class Data State
  const [classList, setClassList] = useState<ExamResult[]>([]);

  useEffect(() => {
    // Load existing results on mount
    setClassList(getResults());
  }, []);

  const handleStartSession = () => {
    if (questionPaper && answerKey) {
      setSessionActive(true);
    }
  };

  const handleEvaluate = async () => {
    if (!questionPaper || !answerKey || !studentSheet || !studentName || !studentUsn) return;

    setStatus(EvaluationStatus.ANALYZING);
    try {
      const result = await evaluateExam(questionPaper.base64, answerKey.base64, studentSheet.base64);
      // Inject manually entered details
      const finalResult: ExamResult = {
        ...result,
        studentName: studentName,
        usn: studentUsn,
        timestamp: Date.now()
      };
      setCurrentResult(finalResult);
      setStatus(EvaluationStatus.COMPLETED);
    } catch (e) {
      setStatus(EvaluationStatus.ERROR);
    }
  };

  const handleSaveResult = () => {
    if (currentResult) {
      saveResult(currentResult);
      setClassList(getResults()); // Refresh list
      
      // Reset for next student
      setStudentName('');
      setStudentUsn('');
      setStudentSheet(null);
      setCurrentResult(null);
      setStatus(EvaluationStatus.IDLE);
    }
  };

  const handleExport = () => {
    downloadClassReport(classList);
  };

  const handleClearData = () => {
    if(confirm("Are you sure you want to clear all class data? This cannot be undone.")) {
        clearAllResults();
        setClassList([]);
    }
  };

  if (!sessionActive) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Teacher Grading Session</h2>
          <p className="text-slate-500 mb-8">Upload the Master Question Paper and Answer Key to begin batch grading.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <FileUploader 
              label="Master Question Paper" 
              description="Upload the standard question paper"
              fileData={questionPaper} 
              onFileChange={setQuestionPaper}
              color="blue"
            />
            <FileUploader 
              label="Master Answer Key" 
              description="Upload the standard answer key"
              fileData={answerKey} 
              onFileChange={setAnswerKey}
              color="purple"
            />
          </div>

          <button
            onClick={handleStartSession}
            disabled={!questionPaper || !answerKey}
            className={`w-full py-4 rounded-xl text-lg font-semibold transition-all ${
              questionPaper && answerKey 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Start Grading Session
          </button>
        </div>
      </div>
    );
  }

  // Active Grading Session View
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Grading Session Active</h2>
           <p className="text-sm text-slate-500">Grading against: {questionPaper?.file.name}</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={handleExport} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <Download className="w-4 h-4 mr-2" /> Export Excel/CSV
            </button>
            <button onClick={() => setSessionActive(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                End Session
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Grading Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                Evaluate New Student
             </h3>
             
             <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Student Name</label>
                    <input 
                        type="text" 
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Full Name"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">USN</label>
                    <input 
                        type="text" 
                        value={studentUsn}
                        onChange={e => setStudentUsn(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Seat Number"
                    />
                </div>
                
                <div className="pt-2">
                    <FileUploader 
                        label="Student Answer Sheet"
                        description="Upload handwritten script"
                        fileData={studentSheet}
                        onFileChange={setStudentSheet}
                        color="emerald"
                    />
                </div>

                <button
                    onClick={handleEvaluate}
                    disabled={!studentSheet || !studentName || !studentUsn || status === EvaluationStatus.ANALYZING}
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-all ${
                        status === EvaluationStatus.ANALYZING 
                        ? 'bg-indigo-100 text-indigo-400' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                >
                    {status === EvaluationStatus.ANALYZING ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                        "Evaluate Paper"
                    )}
                </button>
             </div>
          </div>

          {/* Class List Mini Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-semibold text-slate-800">Class Results ({classList.length})</h3>
                 <button onClick={handleClearData} className="text-xs text-red-500 hover:text-red-700 flex items-center">
                    <Trash2 className="w-3 h-3 mr-1" /> Clear
                 </button>
             </div>
             <div className="max-h-64 overflow-y-auto">
                 {classList.length === 0 ? (
                     <div className="p-8 text-center text-slate-400 text-sm">No papers graded yet</div>
                 ) : (
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">USN</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classList.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-mono text-slate-600">{r.usn}</td>
                                    <td className="px-4 py-2 font-medium text-slate-800">{r.studentName}</td>
                                    <td className="px-4 py-2 text-right font-bold text-indigo-600">{r.totalMarksObtained}</td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                 )}
             </div>
          </div>
        </div>

        {/* Right Column: Results Area */}
        <div className="lg:col-span-8">
            {currentResult ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Evaluation Result</h3>
                        <div className="flex space-x-3">
                             <button 
                                onClick={() => setCurrentResult(null)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                             >
                                Discard
                             </button>
                        </div>
                    </div>
                    <ResultDashboard 
                        result={currentResult} 
                        customAction={
                            <button 
                                onClick={handleSaveResult}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg flex items-center"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Save & Next Student
                            </button>
                        }
                    />
                </div>
            ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                    <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Ready to Evaluate</p>
                    <p className="text-sm">Select a student and upload their sheet to see results here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
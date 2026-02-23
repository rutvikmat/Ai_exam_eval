import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Key, Upload, Plus, Download, Save, Trash2, Check, Loader2, User, LogIn, Briefcase, Calendar, Layers, GraduationCap, BarChart3 } from 'lucide-react';
import FileUploader from './FileUploader';
import ResultDashboard from './ResultDashboard';
import { evaluateExam } from '../services/geminiService';
import { saveResult, getResults, clearAllResults } from '../services/storageService';
import { downloadClassReport } from '../services/csvService';
import { FileData, ExamResult, EvaluationStatus, ExamConfig } from '../types';

interface TeacherPortalProps {
  onBack: () => void;
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBack }) => {
  // Login & Context State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Configuration for the grading session
  const [teacherName, setTeacherName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [className, setClassName] = useState('');
  const [semester, setSemester] = useState('');
  const [examName, setExamName] = useState('');
  const [totalStudents, setTotalStudents] = useState<number | ''>(''); // New state for batch size

  // File State
  const [questionPaper, setQuestionPaper] = useState<FileData | null>(null);
  const [answerKey, setAnswerKey] = useState<FileData | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  // Individual Student Grading State
  const [studentName, setStudentName] = useState('');
  const [studentUsn, setStudentUsn] = useState('');
  const [studentSheet, setStudentSheet] = useState<FileData | null>(null);
  
  // Evaluation State
  const [status, setStatus] = useState<EvaluationStatus>(EvaluationStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  
  // Database/List State
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [recentConfig, setRecentConfig] = useState<ExamConfig | null>(null);

  useEffect(() => {
    // Load existing results on mount
    setAllResults(getResults());

    // Load last used config
    const saved = localStorage.getItem('last_exam_config');
    if (saved) {
      try {
        setRecentConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  // Filter results for the current session context
  const sessionResults = allResults.filter(r => 
    r.subjectCode === subjectCode && 
    r.examName === examName && 
    r.className === className &&
    r.semester === semester
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(teacherName && subjectCode && className && semester && examName) {
        const config: ExamConfig = {
          teacherName,
          subjectCode,
          className,
          semester,
          examName,
          totalStudents
        };
        localStorage.setItem('last_exam_config', JSON.stringify(config));
        setIsLoggedIn(true);
    }
  };

  const handleExportConfig = () => {
    const config: ExamConfig = {
      teacherName,
      subjectCode,
      className,
      semester,
      examName,
      totalStudents
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_config_${subjectCode || 'template'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string) as ExamConfig;
        setTeacherName(config.teacherName || '');
        setSubjectCode(config.subjectCode || '');
        setClassName(config.className || '');
        setSemester(config.semester || '');
        setExamName(config.examName || '');
        setTotalStudents(config.totalStudents || '');
      } catch (err) {
        alert("Invalid configuration file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleApplyRecentConfig = () => {
    if (recentConfig) {
      setTeacherName(recentConfig.teacherName);
      setSubjectCode(recentConfig.subjectCode);
      setClassName(recentConfig.className);
      setSemester(recentConfig.semester);
      setExamName(recentConfig.examName);
      setTotalStudents(recentConfig.totalStudents);
    }
  };

  const handleStartSession = () => {
    if (questionPaper && answerKey) {
      setSessionActive(true);
    }
  };

  const handleEvaluate = async () => {
    if (!questionPaper || !answerKey || !studentSheet || !studentName || !studentUsn) return;

    setStatus(EvaluationStatus.ANALYZING);
    try {
      const result = await evaluateExam(questionPaper, answerKey, studentSheet);
      
      // Inject session context details
      const finalResult: ExamResult = {
        ...result,
        studentName: studentName,
        usn: studentUsn,
        // Context fields
        teacherName: teacherName, // Optional extension
        className: className,
        semester: semester,
        subjectCode: subjectCode,
        examName: examName,
        timestamp: Date.now()
      };
      
      setCurrentResult(finalResult);
      setStatus(EvaluationStatus.COMPLETED);
    } catch (e) {
      setStatus(EvaluationStatus.ERROR);
    }
  };

  const handleSaveAndNext = () => {
    if (currentResult) {
      saveResult(currentResult);
      setAllResults(getResults()); // Refresh local list
      
      // Reset for next student
      setStudentName('');
      setStudentUsn('');
      setStudentSheet(null);
      setCurrentResult(null);
      setStatus(EvaluationStatus.IDLE);
    }
  };

  const handleDiscard = () => {
    setCurrentResult(null);
    setStatus(EvaluationStatus.IDLE);
  };

  const handleExport = () => {
    downloadClassReport(sessionResults, `${className}_${subjectCode}_${examName}`);
  };

  const handleClearAllData = () => {
    if(confirm("WARNING: This will delete ALL data for ALL exams. Are you sure?")) {
        clearAllResults();
        setAllResults([]);
    }
  };

  // Progress Calculation
  const progressPercentage = totalStudents && typeof totalStudents === 'number' 
    ? Math.min((sessionResults.length / totalStudents) * 100, 100) 
    : 0;

  // 1. Configuration / Login Screen
  if (!isLoggedIn) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </button>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Faculty & Exam Configuration</h2>
                        <div className="flex space-x-2">
                            {recentConfig && (
                                <button 
                                    type="button"
                                    onClick={handleApplyRecentConfig}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100 flex items-center text-xs font-medium"
                                    title="Load Recent Session"
                                >
                                    <Calendar className="w-4 h-4 mr-1" /> Recent
                                </button>
                            )}
                            <button 
                                type="button"
                                onClick={handleExportConfig}
                                className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                title="Export Configuration"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <label 
                                className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                                title="Import Configuration"
                            >
                                <Upload className="w-4 h-4" />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".json" 
                                    onChange={handleImportConfig} 
                                />
                            </label>
                        </div>
                    </div>
                    <p className="text-slate-500 mt-2">Set up the context for this grading session.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Faculty Name</label>
                            <input 
                                type="text" 
                                required
                                value={teacherName}
                                onChange={e => setTeacherName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Dr. Jane Smith"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Subject Code</label>
                             <input 
                                 type="text" 
                                 required
                                 value={subjectCode}
                                 onChange={e => setSubjectCode(e.target.value)}
                                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="e.g. CS501"
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Class / Section</label>
                             <input 
                                 type="text" 
                                 required
                                 value={className}
                                 onChange={e => setClassName(e.target.value)}
                                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="e.g. CSE-A"
                             />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                             <input 
                                 type="text" 
                                 required
                                 value={semester}
                                 onChange={e => setSemester(e.target.value)}
                                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="e.g. 5"
                             />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Exam Name</label>
                             <input 
                                 type="text" 
                                 required
                                 value={examName}
                                 onChange={e => setExamName(e.target.value)}
                                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                 placeholder="e.g. Mid-Term 1"
                             />
                         </div>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Total Students (Batch Size)</label>
                         <input 
                             type="number" 
                             min="1"
                             value={totalStudents}
                             onChange={e => setTotalStudents(parseInt(e.target.value) || '')}
                             className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                             placeholder="e.g. 60"
                         />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center">
                        <Check className="w-5 h-5 mr-2" /> Configure Session
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // 2. File Upload / Session Setup View
  if (!sessionActive) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Config
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <span className="font-bold text-indigo-600">{subjectCode}</span>
                <span className="text-slate-300">|</span>
                <span>{examName}</span>
                <span className="text-slate-300">|</span>
                <span>Class {className}</span>
                <span className="text-slate-300">|</span>
                <span>Sem {semester}</span>
            </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Master Copies</h2>
          <p className="text-slate-500 mb-8">Upload the Question Paper and Answer Key to begin grading for <strong>{className} - {subjectCode}</strong>.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <FileUploader 
              label="Master Question Paper" 
              description="Upload standard question paper"
              fileData={questionPaper} 
              onFileChange={setQuestionPaper}
              color="blue"
            />
            <FileUploader 
              label="Master Answer Key" 
              description="Upload standard answer key"
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

  // 3. Active Grading Session View
  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-slate-900">Grading Active</h2>
                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded border border-indigo-200 font-bold">
                    {subjectCode}
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200 font-bold">
                    {className}
                </span>
           </div>
           
           {/* Progress Bar */}
           {totalStudents && (
             <div className="flex items-center space-x-3 w-full max-w-md">
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                    {sessionResults.length} / {totalStudents} Graded
                </span>
             </div>
           )}
           {!totalStudents && (
               <p className="text-sm text-slate-500">{examName} • Sem {semester} • {teacherName}</p>
           )}
        </div>
        <div className="flex space-x-3">
            <button onClick={handleExport} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
                <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button onClick={() => setSessionActive(false)} className="px-4 py-2 text-slate-600 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 text-sm font-medium">
                Pause Session
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Grading Input (Width 3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                Next Student
             </h3>
             
             <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Student Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        required
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Enter student name"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">USN</label>
                    <input 
                        type="text" 
                        value={studentUsn}
                        onChange={e => setStudentUsn(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Seat No."
                    />
                </div>
                
                <div className="pt-2">
                    <FileUploader 
                        label="Answer Sheet"
                        description="PDF/Image"
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
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                        "Evaluate"
                    )}
                </button>
             </div>
          </div>

          {/* Filtered Class List Mini Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
             <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex flex-col">
                    <h3 className="font-semibold text-slate-800 text-sm">Graded ({sessionResults.length})</h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{className} • {subjectCode}</span>
                 </div>
             </div>
             <div className="flex-1 overflow-y-auto">
                 {sessionResults.length === 0 ? (
                     <div className="p-8 text-center text-slate-400 text-xs">No students graded for this exam/class yet.</div>
                 ) : (
                     <table className="w-full text-xs text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2">USN</th>
                                <th className="px-3 py-2">Marks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sessionResults.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-3 py-2">
                                        <div className="font-mono text-slate-700">{r.usn}</div>
                                        <div className="text-[10px] text-slate-400 truncate w-20">{r.studentName}</div>
                                    </td>
                                    <td className="px-3 py-2 font-bold text-indigo-600">{r.totalMarksObtained}</td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                 )}
             </div>
          </div>
        </div>

        {/* Right Column: Results Area (Width 9) */}
        <div className="lg:col-span-9">
            {currentResult ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Current Evaluation</h3>
                            <p className="text-sm text-slate-500">Review the results before saving to the database.</p>
                        </div>
                        <div className="flex space-x-3">
                             <button 
                                onClick={handleDiscard}
                                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                             >
                                Discard
                             </button>
                             <button 
                                onClick={handleSaveAndNext}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md flex items-center transition-all"
                             >
                                <Save className="w-4 h-4 mr-2" />
                                Save & Next Student
                             </button>
                        </div>
                    </div>
                    <ResultDashboard 
                        result={currentResult} 
                    />
                </div>
            ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                    <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Ready to Evaluate</p>
                    <p className="text-sm">Select a student and upload their sheet to generate results.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
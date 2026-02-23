import React from 'react';
import { ExamResult, GradedQuestion } from '../types';
import { CheckCircle, XCircle, AlertCircle, FileText, TrendingUp, Award, PenTool } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultDashboardProps {
  result: ExamResult;
  onReset?: () => void;
  customAction?: React.ReactNode;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green, Red, Amber

const getGrade = (percentage: number) => {
  if (percentage >= 90) return { label: 'A+', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (percentage >= 80) return { label: 'A', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (percentage >= 70) return { label: 'B', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (percentage >= 60) return { label: 'C', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  if (percentage >= 50) return { label: 'D', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { label: 'F', color: 'text-red-600 bg-red-50 border-red-200' };
};

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onReset, customAction }) => {
  
  const correctCount = result.questions.filter(q => q.status === 'Correct').length;
  const incorrectCount = result.questions.filter(q => q.status === 'Incorrect').length;
  const partialCount = result.questions.filter(q => q.status === 'Partial').length;

  const chartData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: incorrectCount },
    { name: 'Partial', value: partialCount },
  ].filter(d => d.value > 0);

  const grade = getGrade(result.accuracyPercentage);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Student Info Banner if available */}
      {(result.studentName || result.usn) && (
        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold">{result.studentName || 'Student Result'}</h2>
             <p className="text-indigo-200 font-medium">USN: {result.usn || 'N/A'}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
             <div className={`px-4 py-2 rounded-lg font-bold text-lg ${grade.color.replace('text-', 'text-white/90 ').replace('bg-', 'bg-white/10 ').replace('border-', '')}`}>
               Grade: {grade.label}
             </div>
             <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-sm text-indigo-100">Evaluated on {result.timestamp ? new Date(result.timestamp).toLocaleDateString() : 'Just now'}</span>
             </div>
          </div>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Total Score</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{result.totalMarksObtained}</span>
            <span className="text-slate-400 font-medium">/ {result.totalMaxMarks}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Accuracy</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{result.accuracyPercentage}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Final Grade</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${grade.color.split(' ')[0]}`}>{grade.label}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Questions</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{result.totalQuestions}</span>
            <span className="text-slate-400 font-medium">Evaluated</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Split</h3>
            <div className="w-full h-64 relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Detailed List Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800">Detailed Evaluation & Transcription</h3>
            <p className="text-sm text-slate-500 mt-1">{result.summary}</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {result.questions.map((q, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                      {q.questionNumber}
                    </span>
                    <span className="font-medium text-slate-800">Question {q.questionNumber}</span>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold
                    ${q.status === 'Correct' ? 'bg-emerald-100 text-emerald-700' : 
                      q.status === 'Incorrect' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {q.status === 'Correct' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {q.status === 'Incorrect' && <XCircle className="w-3 h-3 mr-1" />}
                    {q.status === 'Partial' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {q.status.toUpperCase()}
                  </div>
                </div>

                <div className="ml-11 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center mb-2">
                        <PenTool className="w-3 h-3 text-slate-400 mr-1" />
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transcribed Answer</p>
                      </div>
                      <p className="text-sm text-slate-800 font-medium">{q.studentAnswer}</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">Correct Answer (Key)</p>
                      <p className="text-sm text-slate-800">{q.correctAnswer}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-2">
                    <p className="text-slate-500">
                      <span className="font-medium text-slate-700">Feedback: </span>
                      {q.feedback}
                    </p>
                    <div className="flex items-center font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md">
                      {q.marksAwarded} / {q.maxMarks} Marks
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8 space-x-4">
        {customAction}
        {onReset && (
          <button 
              onClick={onReset}
              className="px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition-all shadow-sm"
          >
              Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultDashboard;
import { ExamResult } from '../types';

export const downloadClassReport = (results: ExamResult[], filenamePrefix: string = 'Class_Report') => {
  // Define headers
  const headers = [
    'Date',
    'Exam Name',
    'Class',
    'Semester',
    'Subject Code',
    'Student Name', 
    'USN', 
    'Total Marks', 
    'Marks Obtained', 
    'Accuracy (%)', 
    'Summary'
  ];
  
  // Map data to rows
  const rows = results.map(r => [
    r.timestamp ? new Date(r.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
    r.examName || 'N/A',
    r.className || 'N/A',
    r.semester || 'N/A',
    r.subjectCode || 'N/A',
    r.studentName || 'Unknown',
    r.usn || 'N/A',
    r.totalMaxMarks,
    r.totalMarksObtained,
    r.accuracyPercentage,
    `"${r.summary.replace(/"/g, '""')}"` // Escape quotes in summary
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
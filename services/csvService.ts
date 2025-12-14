import { ExamResult } from '../types';

export const downloadClassReport = (results: ExamResult[]) => {
  // Define headers
  const headers = ['Student Name', 'USN', 'Total Marks', 'Marks Obtained', 'Accuracy (%)', 'Summary', 'Date'];
  
  // Map data to rows
  const rows = results.map(r => [
    r.studentName || 'Unknown',
    r.usn || 'N/A',
    r.totalMaxMarks,
    r.totalMarksObtained,
    r.accuracyPercentage,
    `"${r.summary.replace(/"/g, '""')}"`, // Escape quotes in summary
    r.timestamp ? new Date(r.timestamp).toLocaleDateString() : new Date().toLocaleDateString()
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
  link.setAttribute('download', `Class_Exam_Report_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
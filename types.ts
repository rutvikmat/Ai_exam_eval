export interface GradedQuestion {
  questionNumber: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  status: 'Correct' | 'Incorrect' | 'Partial';
  feedback: string;
}

export interface ExamResult {
  // Student Details
  studentName?: string;
  usn?: string;
  
  // Exam Context (Database Keys)
  className?: string;     // e.g., "CSE-A"
  semester?: string;      // e.g., "5"
  subjectCode?: string;   // e.g., "CS501"
  examName?: string;      // e.g., "Mid-Term 1"
  teacherName?: string;   // e.g., "Dr. Smith"
  
  // Results
  timestamp?: number;
  totalQuestions: number;
  totalMaxMarks: number;
  totalMarksObtained: number;
  accuracyPercentage: number;
  summary: string;
  questions: GradedQuestion[];
}

export enum EvaluationStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface ExamConfig {
  teacherName: string;
  subjectCode: string;
  className: string;
  semester: string;
  examName: string;
  totalStudents: number | '';
}
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
  studentName?: string;
  usn?: string;
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
}
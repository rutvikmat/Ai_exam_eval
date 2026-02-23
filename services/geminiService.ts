import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExamResult, FileData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING, description: "Name of student if visible, else 'Unknown'" },
    totalQuestions: { type: Type.NUMBER },
    totalMaxMarks: { type: Type.NUMBER },
    totalMarksObtained: { type: Type.NUMBER },
    accuracyPercentage: { type: Type.NUMBER },
    summary: { type: Type.STRING, description: "Brief performance summary." },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.STRING },
          questionText: { type: Type.STRING },
          studentAnswer: { type: Type.STRING, description: "Full transcription of the student's handwritten answer converted to text." },
          correctAnswer: { type: Type.STRING, description: "Answer from key" },
          marksAwarded: { type: Type.NUMBER },
          maxMarks: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["Correct", "Incorrect", "Partial"] },
          feedback: { type: Type.STRING, description: "Detailed reasoning for the grade, mentioning missing keywords or specific errors." },
        },
        required: ["questionNumber", "studentAnswer", "marksAwarded", "status"],
      },
    },
  },
  required: ["totalQuestions", "totalMarksObtained", "questions", "accuracyPercentage"],
};

export const evaluateExam = async (
  questionPaper: FileData,
  answerKey: FileData,
  studentSheet: FileData
): Promise<ExamResult> => {
  
  const prompt = `
    You are an expert University Professor and Exam Evaluator known for precision and fairness.
    
    **Task:**
    Evaluate the provided Student Answer Sheet against the Question Paper and Answer Key.
    
    **Process (Execute strictly in this order):**
    1. **Analyze Context:** Read the Question Paper to understand the subject matter and maximum marks per question.
    2. **Deep Transcription:** Carefully decipher the Student's handwriting. If a word is ambiguous, use the context of the question to infer the intended word. Do not summarize; transcribe fully.
    3. **Analytical Comparison:** 
       - Compare the student's answer to the Answer Key.
       - Look for *semantic equivalence* rather than just keyword matching. Did the student understand the concept?
       - Check for partial credit opportunities if the answer is incomplete but shows understanding.
    4. **Self-Correction & Validation:** 
       - Before assigning a score, ask yourself: "Does this mark reflect the student's demonstrated knowledge?"
       - Ensure the 'marksAwarded' does not exceed 'maxMarks'.
    5. **Feedback Generation:** Provide constructive feedback explaining *why* marks were deducted (e.g., "Missing definition of X", "Calculation error in step 2").
    
    **Output:**
    Return the final evaluation strictly in the defined JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: questionPaper.mimeType,
              data: questionPaper.base64,
            },
          },
          {
            inlineData: {
              mimeType: answerKey.mimeType,
              data: answerKey.base64,
            },
          },
          {
            inlineData: {
              mimeType: studentSheet.mimeType,
              data: studentSheet.base64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Slightly increased to allow for better handwriting interpretation context
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ExamResult;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw error;
  }
};
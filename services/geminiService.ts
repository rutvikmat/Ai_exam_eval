import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExamResult } from "../types";

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
          studentAnswer: { type: Type.STRING, description: "Transcribed student answer" },
          correctAnswer: { type: Type.STRING, description: "Answer from key" },
          marksAwarded: { type: Type.NUMBER },
          maxMarks: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["Correct", "Incorrect", "Partial"] },
          feedback: { type: Type.STRING, description: "Short reason for the grade" },
        },
        required: ["questionNumber", "studentAnswer", "marksAwarded", "status"],
      },
    },
  },
  required: ["totalQuestions", "totalMarksObtained", "questions", "accuracyPercentage"],
};

export const evaluateExam = async (
  questionPaperBase64: string,
  answerKeyBase64: string,
  studentSheetBase64: string
): Promise<ExamResult> => {
  
  const prompt = `
    Act as a strict and accurate university exam evaluator.
    You are provided with three images:
    1. The Question Paper (contains questions and max marks).
    2. The Answer Key (contains correct answers).
    3. The Student's Answer Sheet (handwritten).

    Your task:
    1. Identify each question from the Question Paper.
    2. Transcribe the student's handwritten answer for that question from the Answer Sheet.
    3. Compare the student's answer against the Answer Key.
    4. Assign marks based on correctness. If max marks aren't explicitly clear, assume 1 mark per question.
    5. Calculate the total score and accuracy.
    6. Return the result strictly in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: questionPaperBase64,
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: answerKeyBase64,
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: studentSheetBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual grading
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
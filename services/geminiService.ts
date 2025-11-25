import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { Agenda, FileData, ChatMessage } from '../types';

const MODEL_NAME = 'gemini-3-pro-preview';

// Helper to get API key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Response Schema for Agenda Generation
const agendaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meetingTitle: { type: Type.STRING, description: "A concise and professional title for the meeting." },
    meetingGoal: { type: Type.STRING, description: "The primary objective of the meeting." },
    stakeholders: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of people or roles who should attend." 
    },
    totalDuration: { type: Type.STRING, description: "Total estimated duration (e.g., '1 hour')." },
    agendaItems: {
      type: Type.ARRAY,
      description: "Ordered list of agenda topics.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Time slot (e.g., '09:00 - 09:15')." },
          duration: { type: Type.STRING, description: "Duration of this item (e.g., '15m')." },
          topic: { type: Type.STRING, description: "Title of the agenda topic." },
          description: { type: Type.STRING, description: "Brief description of what will be discussed." },
          presenter: { type: Type.STRING, description: "Person responsible for leading this topic." },
        },
        required: ["time", "duration", "topic", "description", "presenter"]
      }
    }
  },
  required: ["meetingTitle", "meetingGoal", "stakeholders", "totalDuration", "agendaItems"]
};

export const generateAgendaFromFiles = async (files: FileData[]): Promise<Agenda> => {
  const ai = getClient();

  const fileParts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.content
    }
  }));

  const prompt = `
    Analyze the attached documents. 
    Create a detailed and structured meeting agenda based on the content. 
    Identify key stakeholders, essential topics, and estimate the time required for each.
    Ensure the agenda flows logically.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [...fileParts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: agendaSchema,
        systemInstruction: "You are an expert project manager and meeting facilitator. Your goal is to create efficient, clear, and actionable meeting agendas from raw documentation."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Agenda;
  } catch (error) {
    console.error("Gemini Agenda Generation Error:", error);
    throw error;
  }
};

export const chatWithContext = async (
  currentMessage: string, 
  files: FileData[], 
  history: ChatMessage[]
): Promise<string> => {
  const ai = getClient();
  
  // Format history for the API
  const historyContents: Content[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Add files to the system context or the first message
  // Since Chats are stateful, we often pass context in the first turn.
  // However, for a simple "Chat with Doc" implementation without persistent server-side sessions,
  // we can reconstruct the context in a generateContent call or use a Chat session initialized with the docs.
  
  // Strategy: Initialize chat with files in the first history entry if possible, or just send them with the latest prompt.
  // To keep it simple and stateless regarding the `Chat` object:
  
  const fileParts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.content
    }
  }));

  // We will use generateContent for the single turn with full context to ensure files are always visible
  // Alternatively, creating a chat session is better for multi-turn.
  // Let's use Chat session.
  
  const chat = ai.chats.create({
    model: MODEL_NAME,
    history: [
      {
        role: 'user',
        parts: [...fileParts, { text: "Here are the documents for our reference." }]
      },
      {
        role: 'model',
        parts: [{ text: "I have reviewed the documents. What would you like to know or refine about the agenda?" }]
      },
      ...historyContents.map(h => ({
         role: h.role,
         parts: [{ text: h.text }]
      }))
    ],
    config: {
      systemInstruction: "You are a helpful assistant assisting with meeting planning. Answer questions based on the provided documents and the generated agenda contexts."
    }
  });

  const result = await chat.sendMessage({ message: currentMessage });
  return result.text || "I couldn't generate a response.";
};

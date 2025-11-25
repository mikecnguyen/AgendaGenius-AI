export interface FileData {
  id: string;
  name: string;
  type: string;
  content: string; // Base64 encoded content
}

export interface AgendaItem {
  time: string;
  duration: string;
  topic: string;
  description: string;
  presenter: string;
}

export interface Agenda {
  meetingTitle: string;
  meetingGoal: string;
  stakeholders: string[];
  totalDuration: string;
  agendaItems: AgendaItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum LoadingState {
  IDLE = 'IDLE',
  READING_FILES = 'READING_FILES',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

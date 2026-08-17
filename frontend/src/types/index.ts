export type Role = 'admin' | 'teacher' | 'student';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  university_id?: string;
  role: Role;
  status: AccountStatus;
  department: string;
  course: string;
  semester: number;
  section?: string;
  designation?: string;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  document_type: string;
  department: string;
  course: string;
  semester: number;
  audience: string;
  visibility: string;
  effective_date: string;
  version: number;
  status: 'active' | 'archived';
  uploaded_by: string;
  created_at?: string;
}

export interface Citation {
  document_name: string;
  page_number: number;
  chunk_text: string;
  document_type: string;
  visibility: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  correction_performed?: boolean;
  grade?: string;
  timestamp: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  topic: string;
  source: string;
  page: number;
}

export interface Quiz {
  id?: string;
  title: string;
  course: string;
  semester: number;
  topic: string;
  questions?: QuizQuestion[];
  quiz_questions?: any[];
}

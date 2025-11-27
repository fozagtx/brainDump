export interface Thought {
  id: string;
  session_id: string;
  thought_text: string;
  category?: string;
  theme?: string;
  created_at: string;
}

export interface Session {
  id: string;
  mind_weather: string;
  started_at: string;
  completed_at?: string;
  thoughts_explored: number;
  overall_reflection?: string;
}

const SESSIONS_KEY = 'brain_dump_sessions';
const THOUGHTS_KEY = 'brain_dump_thoughts';

export const storage = {
  getSessions(): Session[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getSession(id: string): Session | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id) || null;
  },

  createSession(session: Omit<Session, 'id'>): Session {
    const newSession: Session = {
      ...session,
      id: crypto.randomUUID(),
    };
    const sessions = this.getSessions();
    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return newSession;
  },

  updateSession(id: string, updates: Partial<Session>): Session | null {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) return null;

    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return sessions[index];
  },

  getThoughts(): Thought[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(THOUGHTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getThoughtsBySession(sessionId: string): Thought[] {
    const thoughts = this.getThoughts();
    return thoughts.filter(t => t.session_id === sessionId);
  },

  createThoughts(thoughts: Omit<Thought, 'id' | 'created_at'>[]): Thought[] {
    const existingThoughts = this.getThoughts();
    const newThoughts: Thought[] = thoughts.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }));

    const allThoughts = [...existingThoughts, ...newThoughts];
    localStorage.setItem(THOUGHTS_KEY, JSON.stringify(allThoughts));
    return newThoughts;
  },

  updateThought(id: string, updates: Partial<Thought>): Thought | null {
    const thoughts = this.getThoughts();
    const index = thoughts.findIndex(t => t.id === id);
    if (index === -1) return null;

    thoughts[index] = { ...thoughts[index], ...updates };
    localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
    return thoughts[index];
  },

  clearAllData(): void {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(THOUGHTS_KEY);
  },
};

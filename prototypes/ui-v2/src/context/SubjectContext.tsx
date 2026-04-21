import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SubjectTheme } from '@/data/mock';

interface SubjectContextValue {
  subject: SubjectTheme;
  setSubject: (s: SubjectTheme) => void;
}

const SubjectContext = createContext<SubjectContextValue | null>(null);

export function SubjectProvider({ children }: { children: ReactNode }) {
  const [subject, setSubject] = useState<SubjectTheme>('chinese');
  return <SubjectContext.Provider value={{ subject, setSubject }}>{children}</SubjectContext.Provider>;
}

export function useSubject() {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error('useSubject must be inside SubjectProvider');
  return ctx;
}

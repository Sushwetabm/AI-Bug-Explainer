export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type AnalysisIssue = {
  lineNumber: number;
  message: string;
  type: string;
  suggestion?: string;
};

export type AnalysisHistoryItem = {
  id: string;
  code: string;
  issues: AnalysisIssue[];
  createdAt: string;
  updatedAt: string;
};

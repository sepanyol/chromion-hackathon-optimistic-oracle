
export type ReviewStatus = 'Approved' | 'Rejected' | 'Pending';

export interface AnswerReview {
  id: string;
  originalQuestion: string;
  submittedAnswer: string;
  sources: {
    type: 'api' | 'screenshot' | 'data';
    description: string;
    url?: string;
    verified?: boolean;
  }[];
  riskAssessment: {
    score: number;
    level: 'Low Risk Score' | 'Medium Risk Score' | 'High Risk Score';
    factors: string[];
  };
  challengeStatus: {
    isDisputed: boolean;
    challengerClaims?: string;
    challengerEvidence?: string[];
  };
}

export interface RecentReview {
  id: string;
  status: ReviewStatus;
}

export interface ReviewPatterns {
  approvalRate: string;
  challengeAgreement: string;
  averageTime: string;
  specialization: string;
}
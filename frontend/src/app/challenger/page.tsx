"use client";
import { ChallengePageWrapper } from "@/components/challenger/PageWrapper";
import NavBar from "@/components/NavBar";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import OracleProvider from "@/components/OracleProvider";
import React from "react";
import { ToastContainer } from "react-toastify";

// interface Answer {
//   id: string;
//   question: string;
//   answer: string;
//   riskScore: number;
//   riskLevel: "High Risk Score" | "Medium Risk Score" | "Low Risk Score";
//   urgency: "URGENT" | "NORMAL";
//   timeRemaining: string;
//   solverBond: string;
//   solver: string;
//   challengeWindow: string;
//   potentialReward: string;
//   chain: string;
//   riskAssessment: {
//     score: number;
//     factors: string[];
//   };
// }

const ChallengerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <NetworkStatusBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OracleProvider>
          <ChallengePageWrapper />
        </OracleProvider>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChallengerPage;

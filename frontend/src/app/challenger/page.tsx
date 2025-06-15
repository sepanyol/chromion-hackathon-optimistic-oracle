// app/challenger/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import ChallengerSubmissionPanel from "@/components/challenger/ChallengerSubmissionPanel";
import MyActiveChallenges from "@/components/challenger/MyActiveChallenges";
import { AlertTriangle, Shield, TrendingUp, DollarSign, CheckCircle } from "lucide-react";

export interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

interface Answer {
  id: string;
  question: string;
  answer: string;
  riskScore: number;
  riskLevel: 'High Risk Score' | 'Medium Risk Score' | 'Low Risk Score';
  urgency: 'URGENT' | 'NORMAL';
  timeRemaining: string;
  solverBond: string;
  solver: string;
  challengeWindow: string;
  potentialReward: string;
  chain: string;
  riskAssessment: {
    score: number;
    factors: string[];
  };
}

interface Challenge {
  id: string;
  description: string;
  status: 'Under Review' | 'Won' | 'Complete';
  timeAgo: string;
  reward: string;
}

const ChallengerPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    riskScoreRange: { min: 7.0, max: 10.0 },
    timeRemaining: 'all',
    chain: 'all',
    minValue: '0.2',
    confidence: 'all'
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats([
        {
          title: 'Available Answers',
          value: '31',
          change: 'Eligible for challenge, 8 high risk',
          changeType: 'positive',
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />
        },
        {
          title: 'My Challenges',
          value: '7',
          change: '5 active disputes, 2 pending review',
          changeType: 'positive',
          icon: <Shield className="w-6 h-6 text-blue-600" />
        },
        {
          title: 'Challenge Success Rate',
          value: '73.2%',
          change: 'Last 50 challenges',
          changeType: 'positive',
          icon: <TrendingUp className="w-6 h-6 text-green-600" />
        },
        {
          title: 'Challenge Earnings',
          value: '1.8 ETH',
          change: '$4,320 USD equivalent',
          changeType: 'positive',
          icon: <DollarSign className="w-6 h-6 text-purple-600" />
        }
      ]);

      const answersData: Answer[] = [
        {
          id: '1',
          question: 'What is the latest Bitcoin price from multiple reliable sources with timestamp verification?',
          answer: 'Bitcoin is currently trading at $43,250 based on CoinGecko data. This represents a 2.3% increase... [truncated]',
          riskScore: 8.5,
          riskLevel: 'High Risk Score',
          urgency: 'URGENT',
          timeRemaining: '22h remaining',
          solverBond: '0.2 ETH',
          solver: '0x1420...',
          challengeWindow: '22h remaining',
          potentialReward: '0.15 ETH',
          chain: 'Ethereum',
          riskAssessment: {
            score: 8.5,
            factors: [
              'Multiple reliable sources cited',
              'Recent timestamp verification passed',
              'Data consistent with market conditions',
              'Methodology clearly explained'
            ]
          }
        },
        {
          id: '2',
          question: 'Analyze the current DeFi TVL trends across major protocols for Q4 2024',
          answer: 'Based on DeFiLlama data, total DeFi TVL stands at... [truncated]',
          riskScore: 6.2,
          riskLevel: 'Medium Risk Score',
          urgency: 'NORMAL',
          timeRemaining: '3d 12h',
          solverBond: '0.5 ETH',
          solver: '0x8420...',
          challengeWindow: '3d 12h',
          potentialReward: '0.12 ETH',
          chain: 'Base',
          riskAssessment: {
            score: 6.2,
            factors: [
              'Multiple reliable sources cited',
              'Recent timestamp verification passed',
              'Data consistent with market conditions',
              'Methodology clearly explained'
            ]
          }
        }
      ];

      setAnswers(answersData);

      setChallenges([
        {
          id: '1',
          description: 'Bitcoin price analysis...',
          status: 'Under Review',
          timeAgo: '4 hours ago',
          reward: '0.12 ETH'
        },
        {
          id: '2',
          description: 'DeFi protocol security...',
          status: 'Complete',
          timeAgo: '2 days ago',
          reward: '0.08 ETH'
        }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSubmitChallenge = (challengeData: any) => {
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      description: challengeData.reason.substring(0, 30) + '...',
      status: 'Under Review',
      timeAgo: 'Just now',
      reward: '0.12 ETH'
    };
    
    setChallenges(prev => [newChallenge, ...prev]);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk Score':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium Risk Score':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low Risk Score':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk Score':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Medium Risk Score':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Low Risk Score':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Compact Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Risk Score Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score Range</label>
                  <div className="text-xs text-gray-600">
                    {filters.riskScoreRange.min} - {filters.riskScoreRange.max}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.riskScoreRange.min}
                    className="w-full h-1 bg-gradient-to-r from-green-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Time</option>
                    <option>&lt; 1 hour</option>
                    <option>&lt; 24 hours</option>
                  </select>
                </div>

                {/* Chain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chain</label>
                  <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Chains</option>
                    <option>Ethereum</option>
                    <option>Base</option>
                  </select>
                </div>

                {/* Min Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Value</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="0.2 ETH"
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confidence</label>
                  <div className="flex space-x-1">
                    <button className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Low</button>
                    <button className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Med</button>
                    <button className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">High</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Answers */}
            <div className="space-y-4">
              {answers.map((answer) => (
                <div
                  key={answer.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(answer.riskLevel)}`}>
                        {getRiskIcon(answer.riskLevel)}
                        <span>{answer.riskLevel}: {answer.riskScore}/10</span>
                      </span>
                      {answer.urgency === 'URGENT' && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-orange-600 text-sm font-medium">{answer.timeRemaining}</div>
                  </div>

                  {/* Question and Answer */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Q: {answer.question}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">A:</span> {answer.answer}
                      </p>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-2">
                      MCP RISK ASSESSMENT:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {answer.riskAssessment.factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Solver Bond:</span>
                      <p className="font-semibold">{answer.solverBond}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Solver:</span>
                      <p className="font-mono">{answer.solver}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Challenge Window:</span>
                      <p className="font-semibold">{answer.challengeWindow}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Potential Reward:</span>
                      <p className="font-semibold text-green-600">{answer.potentialReward}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Challenge Answer
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      View Full Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ChallengerSubmissionPanel onSubmitChallenge={handleSubmitChallenge} />
            <MyActiveChallenges challenges={challenges} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengerPage;
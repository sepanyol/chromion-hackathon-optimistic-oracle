// app/solver/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import SolverFilters from "@/components/solver/SolverFilters";
import AvailableQuestions from "@/components/solver/AvailableQuestions";
import MyRecentAnswers from "@/components/solver/MyRecentAnswers";
import { HelpCircle, MessageSquare, DollarSign, TrendingUp } from "lucide-react";

export interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

interface Question {
  id: string;
  title: string;
  description: string;
  chain: string;
  timeRemaining: string;
  reward: string;
  bondRequired: string;
  riskScore: 'Low' | 'Medium' | 'High';
  answersSubmitted: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface Answer {
  id: string;
  questionPreview: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Challenged';
  submitted: string;
  reward: string;
}

const SolverPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats([
        {
          title: 'Available Questions',
          value: '47',
          change: 'Open with rewards',
          changeType: 'positive',
          icon: <HelpCircle className="w-6 h-6 text-blue-600" />
        },
        {
          title: 'My Answers',
          value: '12',
          change: 'Submitted this month, +1 this week',
          changeType: 'positive',
          icon: <MessageSquare className="w-6 h-6 text-green-600" />
        },
        {
          title: 'Total Earnings',
          value: '3.2 ETH',
          change: '$9,000 USD equivalent',
          changeType: 'positive',
          icon: <DollarSign className="w-6 h-6 text-yellow-600" />
        },
        {
          title: 'Success Rate',
          value: '89.5%',
          change: 'Last 30 answers',
          changeType: 'positive',
          icon: <TrendingUp className="w-6 h-6 text-purple-600" />
        }
      ]);

      const questionsData: Question[] = [
        {
          id: '1',
          title: 'What is the current TVL of Uniswap V3?',
          description: 'Technical analysis question requiring on-chain data verification and comparison with historical trends...',
          chain: 'Ethereum',
          timeRemaining: '2d 14h',
          reward: '0.5 ETH',
          bondRequired: '0.1 ETH',
          riskScore: 'Low',
          answersSubmitted: 3,
          category: 'defi',
          difficulty: 'Easy'
        },
        {
          id: '2',
          title: 'Analyze DeFi protocol risks for lending platforms',
          description: 'Comprehensive risk assessment needed for major DeFi lending protocols including smart contract and market risks...',
          chain: 'Base',
          timeRemaining: '5d 6h',
          reward: '1.2 ETH',
          bondRequired: '0.2 ETH',
          riskScore: 'Medium',
          answersSubmitted: 1,
          category: 'defi',
          difficulty: 'Medium'
        },
        // {
        //   id: '3',
        //   title: 'Weather forecast accuracy for NYC',
        //   description: 'Verify weather prediction accuracy for specific date range in New York City using multiple sources...',
        //   chain: 'Polygon',
        //   timeRemaining: '1d 12h',
        //   reward: '0.3 ETH',
        //   bondRequired: '0.05 ETH',
        //   riskScore: 'Low',
        //   answersSubmitted: 7,
        //   category: 'weather',
        //   difficulty: 'Easy'
        // },
        // {
        //   id: '4',
        //   title: 'Sports betting market analysis',
        //   description: 'Complex analysis of NBA playoff odds across multiple sportsbooks with historical data correlation...',
        //   chain: 'Ethereum',
        //   timeRemaining: '3d 8h',
        //   reward: '0.8 ETH',
        //   bondRequired: '0.15 ETH',
        //   riskScore: 'High',
        //   answersSubmitted: 2,
        //   category: 'sports',
        //   difficulty: 'Hard'
        // }
      ];

      setQuestions(questionsData);
      setFilteredQuestions(questionsData);

      setAnswers([
        {
          id: '1',
          questionPreview: 'What is the current TVL...',
          status: 'Pending',
          submitted: '2 hours ago',
          reward: '0.5 ETH'
        },
        {
          id: '2',
          questionPreview: 'Analyze DeFi protocol risks...',
          status: 'Under Review',
          submitted: '1 day ago',
          reward: '1.2 ETH'
        },
        {
          id: '3',
          questionPreview: 'Market correlation analysis...',
          status: 'Approved',
          submitted: '3 days ago',
          reward: '0.8 ETH'
        }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleFiltersChange = (filters: any) => {
    let filtered = [...questions];

    // Filter by reward range
    if (filters.rewardRange.min || filters.rewardRange.max) {
      filtered = filtered.filter(q => {
        const reward = parseFloat(q.reward.replace(' ETH', ''));
        const min = parseFloat(filters.rewardRange.min) || 0;
        const max = parseFloat(filters.rewardRange.max) || 999;
        return reward >= min && reward <= max;
      });
    }

    // Filter by chain
    if (filters.chain !== 'all') {
      filtered = filtered.filter(q => 
        q.chain.toLowerCase() === filters.chain.toLowerCase()
      );
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => 
        q.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleQuickAnswer = (questionId: string) => {
    // In real app, would navigate to answer form or open modal
    console.log('Quick answer for question:', questionId);
    
    // Simulate adding to answers
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newAnswer: Answer = {
        id: Date.now().toString(),
        questionPreview: question.title.substring(0, 30) + '...',
        status: 'Pending',
        submitted: 'Just now',
        reward: question.reward
      };
      setAnswers(prev => [newAnswer, ...prev]);
    }
  };

  const handleViewDetails = (questionId: string) => {
    // In real app, would navigate to question details page
    console.log('View details for question:', questionId);
  };

  const handleViewAnswer = (answerId: string) => {
    // In real app, would navigate to answer details page
    console.log('View answer:', answerId);
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
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Filters */}
          <SolverFilters onFiltersChange={handleFiltersChange} />

          {/* Available Questions */}
          <AvailableQuestions
            questions={filteredQuestions}
            onQuickAnswer={handleQuickAnswer}
            onViewDetails={handleViewDetails}
          />

          {/* My Recent Answers */}
          <MyRecentAnswers
            answers={answers}
            onViewAnswer={handleViewAnswer}
          />
        </div>
      </div>
    </div>
  );
};

export default SolverPage;
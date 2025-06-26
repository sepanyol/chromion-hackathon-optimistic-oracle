
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";

import { Clock, CheckCircle, Users, Star } from "lucide-react";

import { 
  AnswerReview, 
  RecentReview, 
  ReviewPatterns as ReviewPatternsType
} from "@/types/reviewer";
import ReviewGuidelines from '@/components/reviewer/ReviewGuidelines';
import RecentReviews from '@/components/reviewer/RecentReviews';
import ReviewPatterns from '@/components/reviewer/ReviewPatterns';
import AnswerReviewCard from '@/components/reviewer/AnswerReviewCard';
import { StatData } from '@/types/StatsCards';

const ReviewerPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [currentReview, setCurrentReview] = useState<AnswerReview | null>(null);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [reviewPatterns] = useState<ReviewPatternsType>({
    approvalRate: '73%',
    challengeAgreement: '85%',
    averageTime: '12 minutes',
    specialization: 'Technical Analysis'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats([
        {
          title: 'Review Queue',
          value: '8',
          change: 'Awaiting your review, 2 urgent',
          changeType: 'positive',
          icon: <Clock className="w-6 h-6 text-blue-600" />
        },
        {
          title: 'Reviews Completed',
          value: '156',
          change: 'This month, +12 this week',
          changeType: 'positive',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />
        },
        {
          title: 'Consensus Rate',
          value: '94.2%',
          change: 'Agreement with majority',
          changeType: 'positive',
          icon: <Users className="w-6 h-6 text-purple-600" />
        },
        {
          title: 'Reviewer Reputation',
          value: '4.8/5.0',
          change: 'Quality score, Top 10% reviewer',
          changeType: 'positive',
          icon: <Star className="w-6 h-6 text-yellow-600" />
        }
      ]);

      setCurrentReview({
        id: '1247',
        originalQuestion: 'What is the current gas price on Ethereum mainnet and how does it compare to historical averages?',
        submittedAnswer: 'The current gas price is approximately 25 Gwei based on Etherscan data as of 2024-06-08 14:30 UTC. This represents a moderate network congestion level compared to the 30-day average of 22 Gwei. The price reflects...',
        sources: [
          {
            type: 'api',
            description: 'Etherscan API endpoint (etherscan.io/gastracker)',
            verified: true
          },
          {
            type: 'screenshot',
            description: 'Gas tracker screenshots (timestamp verified)',
            verified: true
          },
          {
            type: 'data',
            description: 'Historical comparison data (30-day trend)',
            verified: false
          }
        ],
        riskAssessment: {
          score: 2.1,
          level: 'Low Risk Score',
          factors: [
            'Multiple reliable sources cited',
            'Recent timestamp verification passed',
            'Data consistent with market conditions',
            'Methodology clearly explained'
          ]
        },
        challengeStatus: {
          isDisputed: true,
          challengerClaims: 'Data appears outdated by 4 hours',
          challengerEvidence: [
            'More recent gas tracker showing 30 Gwei',
            'Claims 4-hour delay in answer timestamp',
            'Alternative data source comparison'
          ]
        }
      });

      setRecentReviews([
        { id: '1245', status: 'Approved' },
        { id: '1243', status: 'Rejected' },
        { id: '1241', status: 'Approved' }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSubmitReview = (decision: 'support' | 'reject', comments?: string) => {
    // In real app, would make API call
    console.log('Review submitted:', { decision, comments });
    
    // Add to recent reviews
    if (currentReview) {
      const newReview: RecentReview = {
        id: currentReview.id,
        status: decision === 'support' ? 'Approved' : 'Rejected'
      };
      setRecentReviews(prev => [newReview, ...prev.slice(0, 2)]);
    }
    

    setCurrentReview(null);
    setTimeout(() => {

      console.log('Loading next review...');
    }, 1000);
  };

  const handleSkipReview = () => {

    console.log('Review skipped');
    setCurrentReview(null);
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
      
          <div className="lg:col-span-3 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

         
            {currentReview ? (
              <AnswerReviewCard
                review={currentReview}
                onSubmitReview={handleSubmitReview}
                onSkipReview={handleSkipReview}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Reviews Complete!</h3>
                <p className="text-gray-600">No more reviews in your queue. Check back later for new submissions.</p>
              </div>
            )}
          </div>

     
          <div className="space-y-6">
            <ReviewGuidelines />
            <RecentReviews reviews={recentReviews} />
            <ReviewPatterns patterns={reviewPatterns} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerPage;
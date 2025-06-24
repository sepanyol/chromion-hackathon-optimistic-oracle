// app/solver/page.tsx
"use client";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import AvailableRequests from "@/components/solver/AvailableRequests";
import MyRecentProposals from "@/components/solver/MyRecentProposals";
import SolverFilters from "@/components/solver/SolverFilters";
import { useUserProposer } from "@/hooks/useUserProposer";
import { SolverProposalsType, SolverRequestsType } from "@/types/Requests";
import { StatData } from "@/types/StatsCards";
import { defaultChain } from "@/utils/appkit/context";
import { getReadableRequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import {
  DollarSign,
  HelpCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { decodeAbiParameters, formatUnits } from "viem";
import { useAccount } from "wagmi";

const SolverPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [requests, setRequests] = useState<SolverRequestsType[]>([]);
  const [proposals, setProposals] = useState<SolverProposalsType[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<
    SolverRequestsType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const { address, chainId, isConnected } = useAccount();
  const proposer = useUserProposer(address!);

  useEffect(() => {
    if (!proposer.isSuccess) return;
    if (!proposer.data) {
      // TODO control screem when user is not existing
      return;
    }

    setStats([
      {
        title: "Requests available",
        value: (
          Number(proposer.data.dashboard.totalRequests) -
          Number(proposer.data.dashboard.proposals)
        ).toString(),
        change: null, //"Open with rewards",
        changeType: null, //"positive",
        icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
      },
      {
        title: "My Answers",
        value: !proposer.data.user
          ? "0"
          : Number(proposer.data.user.stats.proposals).toString(),
        change: null, //"Submitted this month, +1 this week",
        changeType: null, //"positive",
        icon: <MessageSquare className="w-6 h-6 text-green-600" />,
      },
      {
        title: "Total Earnings",
        value: `${
          !proposer.data.user
            ? "0"
            : formatUnits(
                BigInt(proposer.data.user.stats.earningsInUSD),
                6
              ).toString()
        } USDC`,
        change: null, //"$9,000 USD equivalent",
        changeType: null, //"positive",
        icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
      },
      {
        title: "Success Rate",
        value: `${
          !proposer.data.user
            ? "0"
            : Number(proposer.data.user.stats.successRate).toString()
        }%`,
        change: null, //"Last 30 answers",
        changeType: null, //"positive",
        icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      },
    ]);

    if (proposer.data.user) {
      const newProposals = proposer.data.user.proposals.map(
        (proposal: any) =>
          ({
            id: proposal.request.id,
            created: timeAgo.format(Number(proposal.createdAt) * 1000),
            question: proposal.request.question,
            reward: `${formatUnits(BigInt(proposal.request.rewardAmount), 6)}`,
            status: getReadableRequestStatus(proposal.request.status),
          } as SolverProposalsType)
      );
      setProposals(newProposals);

      if (proposer.data.requests) {
        const newRequests = proposer.data.requests.map(
          (request: any) =>
            ({
              id: request.id,
              bondRequired: "100 USDC",
              category: request.answerType === 0 ? "Yes/No" : "Valuation",
              chain: request.isCrossChain ? "cross chain" : defaultChain.name,
              createdAt: timeAgo.format(Number(request.createdAt) * 1000),
              description: request.context,
              reward: `${formatUnits(BigInt(request.rewardAmount), 6)} USDC`,
              riskScore: request.scoring
                ? Number(request.scoring.final_decision)
                : 0,
              title: request.question,
            } as SolverRequestsType)
        );
        setRequests(newRequests);
      }
    }
  }, [proposer.data, proposer.isSuccess]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      //     const questionsData: SolverRequestsType[] = [
      //       // {
      //       //   id: '1',
      //       //   title: 'What is the current TVL of Uniswap V3?',
      //       //   description: 'Technical analysis question requiring on-chain data verification and comparison with historical trends...',
      //       //   chain: 'Ethereum',
      //       //   timeRemaining: '2d 14h',
      //       //   reward: '0.5 ETH',
      //       //   bondRequired: '0.1 ETH',
      //       //   riskScore: 'Low',
      //       //   answersSubmitted: 3,
      //       //   category: 'defi',
      //       //   difficulty: 'Easy'
      //       // },
      //       // {
      //       //   id: '2',
      //       //   title: 'Analyze DeFi protocol risks for lending platforms',
      //       //   description: 'Comprehensive risk assessment needed for major DeFi lending protocols including smart contract and market risks...',
      //       //   chain: 'Base',
      //       //   timeRemaining: '5d 6h',
      //       //   reward: '1.2 ETH',
      //       //   bondRequired: '0.2 ETH',
      //       //   riskScore: 'Medium',
      //       //   answersSubmitted: 1,
      //       //   category: 'defi',
      //       //   difficulty: 'Medium'
      //       // },
      //       // {
      //       //   id: '3',
      //       //   title: 'Weather forecast accuracy for NYC',
      //       //   description: 'Verify weather prediction accuracy for specific date range in New York City using multiple sources...',
      //       //   chain: 'Polygon',
      //       //   timeRemaining: '1d 12h',
      //       //   reward: '0.3 ETH',
      //       //   bondRequired: '0.05 ETH',
      //       //   riskScore: 'Low',
      //       //   answersSubmitted: 7,
      //       //   category: 'weather',
      //       //   difficulty: 'Easy'
      //       // },
      //       // {
      //       //   id: '4',
      //       //   title: 'Sports betting market analysis',
      //       //   description: 'Complex analysis of NBA playoff odds across multiple sportsbooks with historical data correlation...',
      //       //   chain: 'Ethereum',
      //       //   timeRemaining: '3d 8h',
      //       //   reward: '0.8 ETH',
      //       //   bondRequired: '0.15 ETH',
      //       //   riskScore: 'High',
      //       //   answersSubmitted: 2,
      //       //   category: 'sports',
      //       //   difficulty: 'Hard'
      //       // }
      //     ];

      //     setRequests(questionsData);
      //     setFilteredQuestions(questionsData);

      //     setProposals([
      //       // {
      //       //   id: '1',
      //       //   questionPreview: 'What is the current TVL...',
      //       //   status: 'Pending',
      //       //   submitted: '2 hours ago',
      //       //   reward: '0.5 ETH'
      //       // },
      //       // {
      //       //   id: '2',
      //       //   questionPreview: 'Analyze DeFi protocol risks...',
      //       //   status: 'Under Review',
      //       //   submitted: '1 day ago',
      //       //   reward: '1.2 ETH'
      //       // },
      //       // {
      //       //   id: '3',
      //       //   questionPreview: 'Market correlation analysis...',
      //       //   status: 'Approved',
      //       //   submitted: '3 days ago',
      //       //   reward: '0.8 ETH'
      //       // }
      // ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleFiltersChange = (filters: any) => {
    let filtered = [...requests];

    // // Filter by reward range
    // if (filters.rewardRange.min || filters.rewardRange.max) {
    //   filtered = filtered.filter((q) => {
    //     const reward = parseFloat(q.reward.replace(" ETH", ""));
    //     const min = parseFloat(filters.rewardRange.min) || 0;
    //     const max = parseFloat(filters.rewardRange.max) || 999;
    //     return reward >= min && reward <= max;
    //   });
    // }

    // // Filter by chain
    // if (filters.chain !== "all") {
    //   filtered = filtered.filter(
    //     (q) => q.chain.toLowerCase() === filters.chain.toLowerCase()
    //   );
    // }

    // // Filter by category
    // if (filters.category !== "all") {
    //   filtered = filtered.filter((q) => q.category === filters.category);
    // }

    // // Filter by difficulty
    // if (filters.difficulty !== "all") {
    //   filtered = filtered.filter(
    //     (q) => q.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
    //   );
    // }

    setFilteredQuestions(filtered);
  };

  // const handleQuickAnswer = (questionId: string) => {
  //   // In real app, would navigate to answer form or open modal
  //   console.log("Quick answer for question:", questionId);

  //   // Simulate adding to answers
  //   const question = questions.find((q) => q.id === questionId);
  //   if (question) {
  //     const newAnswer: Answer = {
  //       id: Date.now().toString(),
  //       questionPreview: question.title.substring(0, 30) + "...",
  //       status: "Pending",
  //       submitted: "Just now",
  //       reward: question.reward,
  //     };
  //     setProposals((prev) => [newAnswer, ...prev]);
  //   }
  // };

  const handleViewDetails = (questionId: string) => {
    // In real app, would navigate to question details page
    console.log("View details for question:", questionId);
  };

  const handleViewAnswer = (answerId: string) => {
    // In real app, would navigate to answer details page
    console.log("View answer:", answerId);
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
          {/* <SolverFilters onFiltersChange={handleFiltersChange} /> */}

          {/* Available Questions */}
          <AvailableRequests
            requests={requests}
            onQuickAnswer={() => {}}
            onViewDetails={() => {}}
          />

          {/* My Recent Proposals */}
          <MyRecentProposals
            proposals={proposals}
            onViewAnswer={handleViewAnswer}
          />
        </div>
      </div>
    </div>
  );
};

export default SolverPage;

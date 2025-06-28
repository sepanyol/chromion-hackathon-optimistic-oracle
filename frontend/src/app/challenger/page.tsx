// app/challenger/page.tsx
"use client";
import { Button } from "@/components/Button";
import Navbar from "@/components/Navbar";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import StatCard from "@/components/StatCard";
import ChallengerSubmissionPanel from "@/components/challenger/ChallengerSubmissionPanel";
import MyActiveChallenges from "@/components/challenger/MyActiveChallenges";
import { ShortAddress } from "@/components/utilities/ShortAddress";
import { useUserChallenger } from "@/hooks/useUserChallenger";
import {
  AvailableReviewsType,
  FullRequestChallengeType,
} from "@/types/Requests";
import { StatData } from "@/types/StatsCards";
import { isInvolvedInRequest } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Address, formatUnits, hexToBool, trim } from "viem";
import { useAccount } from "wagmi";

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

interface Challenge {
  id: string;
  description: string;
  status: "Under Review" | "Won" | "Complete";
  timeAgo: string;
  reward: string;
}

const ChallengerPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [requests, setRequests] = useState<FullRequestChallengeType[]>([]);
  // const [answers, setAnswers] = useState<Answer[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const challenger = useUserChallenger(address!);

  useEffect(() => {
    if (!challenger.isSuccess || !challenger.data) return;

    setStats([
      {
        title: "Available proposals",
        value: (
          Number(challenger.data.dashboard.proposals) -
          Number(challenger.data.dashboard.challenges)
        ).toString(),
        change: null,
        changeType: null,
        icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      },
      {
        title: "My Challenges",
        value: challenger.data.user
          ? challenger.data.user.stats.challenges
          : "0",
        change: null,
        changeType: null,
        icon: <Shield className="w-6 h-6 text-blue-600" />,
      },
      {
        title: "Challenge Success Rate",
        value: `${challenger.data.dashboard.challengeSuccessRate}%`,
        change: null, // 'Last 50 challenges',
        changeType: null, // 'positive',
        icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      },
      {
        title: "Challenge Earnings",
        value: `${
          challenger.data.user
            ? formatUnits(BigInt(challenger.data.user.stats.earningsInUSD), 6)
            : "0"
        } USDC`,
        change: null, // '$4,320 USD equivalent',
        changeType: null, // 'positive',
        icon: <DollarSign className="w-6 h-6 text-purple-600" />,
      },
    ]);

    if (challenger.data.requests) setRequests(challenger.data.requests);
    else setRequests([]);
  }, [challenger.data, challenger.isSuccess]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // setStats([
      //   {
      //     title: "Available Answers",
      //     value: "31",
      //     change: null, // 'Eligible for challenge, 8 high risk',
      //     changeType: null, // 'positive',
      //     icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      //   },
      //   {
      //     title: "My Challenges",
      //     value: "7",
      //     change: null, // '5 active disputes, 2 pending review',
      //     changeType: null, // 'positive',
      //     icon: <Shield className="w-6 h-6 text-blue-600" />,
      //   },
      //   {
      //     title: "Challenge Success Rate",
      //     value: "73.2%",
      //     change: null, // 'Last 50 challenges',
      //     changeType: null, // 'positive',
      //     icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      //   },
      //   {
      //     title: "Challenge Earnings",
      //     value: "1.8 ETH",
      //     change: null, // '$4,320 USD equivalent',
      //     changeType: null, // 'positive',
      //     icon: <DollarSign className="w-6 h-6 text-purple-600" />,
      //   },
      // ]);

      setChallenges([
        {
          id: "1",
          description: "Bitcoin price analysis...",
          status: "Under Review",
          timeAgo: "4 hours ago",
          reward: "0.12 ETH",
        },
        {
          id: "2",
          description: "DeFi protocol security...",
          status: "Complete",
          timeAgo: "2 days ago",
          reward: "0.08 ETH",
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSubmitChallenge = (challengeData: any) => {
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      description: challengeData.reason.substring(0, 30) + "...",
      status: "Under Review",
      timeAgo: "Just now",
      reward: "0.12 ETH",
    };

    setChallenges((prev) => [newChallenge, ...prev]);
  };

  const getRiskColor = (final_decision: number) => {
    switch (final_decision) {
      case 3:
        return "bg-red-100 text-red-800 border-red-200";
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // const getRiskLabel = (final_decision: number) => {
  //   switch (final_decision) {
  //     case 3:
  //       return "bg-red-100 text-red-800 border-red-200";
  //     case 2:
  //       return "bg-orange-100 text-orange-800 border-orange-200";
  //     case 1:
  //       return "bg-green-100 text-green-800 border-green-200";
  //     default:
  //       return "bg-gray-100 text-gray-800 border-gray-200";
  //   }
  // };

  const getRiskIcon = (final_decision: number) => {
    if (final_decision === 1) return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
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

      {/* Network Status Bar */}
      <NetworkStatusBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Grid */}
          <div className="col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Available Answers */}
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex gap-1 items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(
                          Number(
                            request.scoring ? request.scoring.final_decision : 0
                          )
                        )}`}
                      >
                        {getRiskIcon(
                          Number(
                            request.scoring ? request.scoring.final_decision : 0
                          )
                        )}
                        {request.scoring ? (
                          <>
                            {request.scoring.final_decision == 1 && "Low"}
                            {request.scoring.final_decision == 2 && "Medium"}
                            {request.scoring.final_decision == 3 &&
                              "High"}: {request.scoring.score / 10}/10
                          </>
                        ) : (
                          <span>waiting for assessment...</span>
                        )}
                      </span>

                      {Number(request.proposal.createdAt) * 1000 - Date.now() <
                        21600000 && (
                        <span className="bg-gray-300 text-gray-600 px-2 py-1 rounded text-xs font-bold animate-pulse justify-self-end">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">
                      created{" "}
                      {timeAgo.format(
                        Number(request.proposal.createdAt) * 1000
                      )}
                    </div>
                  </div>

                  {/* Question and Answer */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Q: {request.question}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">A:</span>{" "}
                        {request.answerType === 0 && (
                          <span>
                            {["0x01", "0x00"].includes(
                              trim(request.proposal.answer as Address)
                            )
                              ? hexToBool(request.proposal.answer as Address, {
                                  size: 32,
                                })
                                ? "YES"
                                : "NO"
                              : "NO"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Proposer Bond:</span>
                      <p className="font-semibold">100 USDC</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Proposer:</span>
                      <ShortAddress address={request.proposal.proposer.id} />
                    </div>
                    <div>
                      <span className="text-gray-500">Challenge Window:</span>
                      <p className="font-semibold">
                        {timeAgo.format(
                          (Number(request.proposal.createdAt) +
                            Number(request.challengeWindow)) *
                            1000,
                          "twitter"
                        )}{" "}
                        remaining
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Potential Reward:</span>
                      <p className="font-semibold text-green-600">
                        {90 + Number(formatUnits(request.rewardAmount, 6))} USDC
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 justify-end">
                    <Link href={`/challenger/${request.id}`}>
                      <Button className="from-red-600! to-red-600! text-white! hover:from-red-700! hover:to-red-700!">
                        {isInvolvedInRequest(
                          request.requester.id,
                          request.proposal.proposer.id,
                          (request as any).challenge &&
                            (request as any).challenge.challenger.id,
                          address
                        )
                          ? "View"
                          : "Challenge"}{" "}
                        Answer
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MyActiveChallenges challenges={challenges} />
            <ChallengerSubmissionPanel
              onSubmitChallenge={handleSubmitChallenge}
            />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChallengerPage;

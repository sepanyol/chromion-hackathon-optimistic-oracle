"use client";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import StatCard from "@/components/StatCard";
import AvailableRequests from "@/components/solver/AvailableRequests";
import MyRecentProposals from "@/components/solver/MyRecentProposals";
import { useUserProposer } from "@/hooks/useUserProposer";
import { SolverProposalsType, SolverRequestsType } from "@/types/Requests";
import { StatData } from "@/types/StatsCards";
import { defaultChain } from "@/utils/appkit/context";
import { getReadableRequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import {
  DollarSign,
  HelpCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatUnits, hexToBigInt } from "viem";
import NavBar from "../NavBar";
import { useOracleContext } from "../OracleProvider";
import { getChainById } from "@/utils/chains";

export const SolverPageWrapper = () => {
  const { account } = useEvmClients();
  const { assetSymbol, proposerBond, assetDecimals } = useOracleContext();

  const [stats, setStats] = useState<StatData[]>([]);
  const [requests, setRequests] = useState<SolverRequestsType[]>([]);
  const [proposals, setProposals] = useState<SolverProposalsType[]>([]);

  const proposer = useUserProposer(account!);

  useEffect(() => {
    if (!proposer.isSuccess || !proposer.data) return;

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
        title: `Total Earnings in ${assetSymbol}`,
        value: `${
          !proposer.data.user
            ? "0"
            : Number(
                formatUnits(
                  BigInt(proposer.data.user.stats.earningsInUSD),
                  assetDecimals!
                )
              ).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
        }`,
        change: null, //"$9,000 USD equivalent",
        changeType: null, //"positive",
        icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
      },
      {
        title: "Success Rate",
        value: `${
          !proposer.data.user
            ? "0"
            : Number(proposer.data.user.stats.successRate).toLocaleString(
                navigator.language,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )
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
            challengePeriod: timeAgo.format(
              (Number(proposal.createdAt) +
                Number(proposal.request.challengeWindow)) *
                1000
            ),
            reward: `${formatUnits(
              BigInt(proposal.request.rewardAmount),
              assetDecimals!
            )} ${assetSymbol}`,
            status: getReadableRequestStatus(proposal.request.status),
          } as SolverProposalsType)
      );
      setProposals(newProposals);
    }

    if (proposer.data.requests) {
      const newRequests = proposer.data.requests.map(
        (request: any) =>
          ({
            id: request.id,
            bondRequired: `${formatUnits(
              proposerBond!,
              assetDecimals!
            )} ${assetSymbol}`,
            category: request.answerType === 0 ? "Yes/No" : "Valuation",
            chain:
              request.originChainId != "0x"
                ? getChainById(Number(hexToBigInt(request.originChainId))).name
                : defaultChain.name,
            createdAt: timeAgo.format(Number(request.createdAt) * 1000),
            description: request.context,
            reward: `${formatUnits(
              BigInt(request.rewardAmount),
              assetDecimals!
            )} ${assetSymbol}`,
            riskScore: request.scoring
              ? Number(request.scoring.final_decision)
              : 0,
            title: request.question,
          } as SolverRequestsType)
      );
      setRequests(newRequests);
    }
  }, [proposer.data, proposer.isSuccess]);

  if (proposer.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Network Status Bar */}
      <NetworkStatusBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Available Questions */}
          <AvailableRequests requests={requests} />

          {/* My Recent Proposals */}
          <MyRecentProposals proposals={proposals} />
        </div>
      </div>
    </div>
  );
};

// app/dashboard/page.tsx
"use client";
import ActivityFeed from "@/components/ActivityFeed";
import CrossChainStatus from "@/components/CrossChainStatus";
import { Loader } from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import QuickActions from "@/components/QuickActions";
import { CreateRequest } from "@/components/request/CreateRequest";
import CreateRequestProvider, {
  ActionTypes,
  useCreateRequestContext,
} from "@/components/request/CreateRequestProvider";
import RequestModal from "@/components/request/RequestModal";
import RequestsTable from "@/components/RequestsTable";
import StatCard from "@/components/StatCard";
import { useActiveRequests } from "@/hooks/useActiveRequests";
import { useDashboard } from "@/hooks/useDashboard";
import { useRecentActivity } from "@/hooks/useRecentActivities";
import { ActivityItem, ActivityItemStatus } from "@/types/Activities";
import { ActiveRequest } from "@/types/Requests";
import { StatData } from "@/types/StatsCards";
import { getReadableRequestStatus, RequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { lowerCase, upperFirst } from "lodash";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Address, formatUnits } from "viem";
import { useConnectors } from "wagmi";

export interface CrossChainNetwork {
  network: string;
  status: "Active" | "Syncing";
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [requests, setRequests] = useState<ActiveRequest[]>([]);
  const [networks, setNetworks] = useState<CrossChainNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "all" | "open" | "proposed" | "challenged"
  >("all");

  // create request context
  const createContext = useCreateRequestContext();

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      setNetworks([
        { network: "Avalanche", status: "Active" },
        { network: "Ethereum", status: "Active" },
        { network: "Base", status: "Active" },
        { network: "Arbitrum", status: "Active" },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // get dashboard
  const dashboard = useDashboard();

  useEffect(() => {
    if (!dashboard.isSuccess) return;
    if (!dashboard.data) return;

    setStats([
      {
        title: "Total Requests",
        value: Number(dashboard.data.totalRequests).toLocaleString(
          navigator.language
        ),
        change: null,
        changeType: null,
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      },
      {
        title: "Active Disputes",
        value: Number(dashboard.data.activeChallenges).toLocaleString(
          navigator.language
        ),
        change: null,
        changeType: null,
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      },
      {
        title: "Success Rate",
        value: `${Number(dashboard.data.proposalSuccessRate).toLocaleString(
          navigator.language,
          {
            maximumFractionDigits: 2,
            maximumSignificantDigits: 2,
            minimumFractionDigits: 2,
            minimumSignificantDigits: 2,
          }
        )}%`,

        change: null,
        changeType: null,
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      },
    ]);
    dashboard.data;
  }, [dashboard.data, dashboard.isSuccess]);

  // get most recent activity
  const recentActivity = useRecentActivity();

  useEffect(() => {
    if (!recentActivity.isSuccess) return;
    if (!recentActivity.data) return;
    if (!recentActivity.data.data) return;
    if (recentActivity.data.data.recentActivities) {
      setActivities(
        recentActivity.data.data.recentActivities.map(
          (activity: any) =>
            ({
              id: activity.id,
              title: `${activity.request.question}`,
              user: activity.user ? activity.user.id : null,
              time: timeAgo.format(Number(activity.createdAt) * 1000),
              status: upperFirst(
                lowerCase(activity.activity)
              ) as ActivityItemStatus,
            } as ActivityItem)
        )
      );
    }
  }, [recentActivity.isSuccess, recentActivity.data]);

  // get active requests
  const [statusForActiveRequests, setStatusForActiveRequests] =
    useState<RequestStatus>();
  const activeRequests = useActiveRequests(statusForActiveRequests);

  useEffect(() => {
    if (!activeRequests.isSuccess) return;
    if (!activeRequests.data) return;
    setRequests(
      activeRequests.data.map((request: any) => {
        return {
          id: request.id,
          request: request.question,
          type: request.answerType == 0 ? "Boolean" : "RWA Valuation",
          reward: `${formatUnits(BigInt(request.rewardAmount), 6)} USDC`,
          statusLabel: getReadableRequestStatus(request.status),
          status: request.status,
          timeLeft:
            request.proposal !== null && request.challenge === null
              ? timeAgo.format(
                  (Number(request.proposal.createdAt) +
                    Number(request.challengeWindow)) *
                    1000,
                  { future: true }
                )
              : request.challenge === null
              ? "unchallenged"
              : timeAgo.format(
                  (Number(request.challenge.createdAt) + 86400) * 1000,
                  "mini-minute-now",
                  { future: true }
                ),
          requestedTime: timeAgo.format(Number(request.createdAt) * 1000),
        };
      })
    );
  }, [activeRequests.isSuccess, activeRequests.data]);

  // Filter requests based on search and tab
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.request.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      selectedTab === "all" ||
      request.statusLabel.toLowerCase() === selectedTab;
    return matchesSearch && matchesTab;
  });

  useEffect(() => {
    switch (selectedTab) {
      case "all":
        return setStatusForActiveRequests(undefined);
      case "open":
        return setStatusForActiveRequests(RequestStatus.Open);
      case "proposed":
        return setStatusForActiveRequests(RequestStatus.Proposed);
      case "challenged":
        return setStatusForActiveRequests(RequestStatus.Challenged);
    }
  }, [selectedTab]);

  const handlePropose = (requestId: string) => {
    // In real app, would make API call
  };

  const handleChallenge = (requestId: string) => {
    // In real app, would make API call
  };

  const handleOnNewRequest = () => {
    createContext.dispatch({ type: ActionTypes.OpenModal });
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
    <CreateRequestProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar showNavigation />

        {/* Network Status Bar */}
        <NetworkStatusBar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 mb-18 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </div>

              {/* Recent Activity */}
              <ActivityFeed activities={activities} />

              {/* Requests Section */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CrossChainStatus networks={networks} />
              <QuickActions />
            </div>
          </div>

          <div className="bg-white mt-5 rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Requests
                </h2>

                <div className="flex items-center space-x-4">
                  {/* Search */}
                  {/* <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border text-gray-700 placeholder:text-gray-400 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                /> */}

                  {/* Filter Tabs */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(["all", "open", "proposed", "challenged"] as const).map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setSelectedTab(tab)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                            selectedTab === tab
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {upperFirst(tab)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {activeRequests.isLoading || activeRequests.isFetching ? (
              <div className="p-4 flex flex-row justify-center items-center">
                <Loader size={36} />
              </div>
            ) : (
              <RequestsTable
                requests={filteredRequests}
                onPropose={handlePropose}
                onChallenge={handleChallenge}
              />
            )}
          </div>
        </div>

        <CreateRequest />
      </div>
    </CreateRequestProvider>
  );
};

export default Dashboard;

// app/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import ActivityFeed from "@/components/ActivityFeed";
import RequestsTable from "@/components/RequestsTable";
import QuickActions from "@/components/QuickActions";
import CrossChainStatus from "@/components/CrossChainStatus";
import RequestModal from "@/components/RequestModal";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "@/utils/api/fetchRecentActivity";
import { lowerCase, upperFirst } from "lodash";
import { ActivityItem, ActivityItemStatus } from "@/types/Activities";
import { useRecentActivity } from "@/hooks/useRecentActivities";
import { useDashboard } from "@/hooks/useDashboard";
import { StatData } from "@/types/StatsCards";
import { timeAgo } from "@/utils/time-ago";

export interface ActiveRequest {
  id: string;
  request: string;
  type: string;
  reward: string;
  status: "Open" | "Proposed" | "Challenged";
  timeLeft: string;
  requestedTime: string;
}

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

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRequests([
        {
          id: "1",
          request: "Will TSLA stock price exceed $300 by Q1 2024?",
          type: "Boolean",
          reward: "500 USDC",
          status: "Open",
          timeLeft: "22h 15m",
          requestedTime: "2 hours ago",
        },
        {
          id: "2",
          request: "Current market value of 123 Main St, NYC",
          type: "RWA Valuation",
          reward: "1,200 USDC",
          status: "Proposed",
          timeLeft: "18h 42m",
          requestedTime: "5 hours ago",
        },
        {
          id: "3",
          request: "BTC price on December 31, 2024",
          type: "Price Feed",
          reward: "800 USDC",
          status: "Challenged",
          timeLeft: "6h 30m",
          requestedTime: "1 day ago",
        },
      ]);

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
              user:
                activity.user === null
                  ? null
                  : `${activity.user.id.slice(0, 6)}...${activity.user.id.slice(
                      -4
                    )}`,
              time: timeAgo.format(Number(activity.createdAt) * 1000),
              status: upperFirst(
                lowerCase(activity.activity)
              ) as ActivityItemStatus,
            } as ActivityItem)
        )
      );
    }
  }, [recentActivity.isSuccess, recentActivity.data]);

  // Filter requests based on search and tab
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.request.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      selectedTab === "all" || request.status.toLowerCase() === selectedTab;
    return matchesSearch && matchesTab;
  });

  const handlePropose = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "Proposed" as const } : req
      )
    );
    // In real app, would make API call
  };

  const handleChallenge = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "Challenged" as const } : req
      )
    );
    // In real app, would make API call
  };

  const handleNewRequest = (requestData: any) => {
    const newRequest: ActiveRequest = {
      id: Date.now().toString(),
      request: requestData.description,
      type: requestData.type,
      reward: `${requestData.reward} USDC`,
      status: "Open",
      timeLeft: "24h 0m",
      requestedTime: "Just now",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setShowRequestModal(false);
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
            <QuickActions onNewRequest={() => setShowRequestModal(true)} />
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
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />

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
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <RequestsTable
            requests={filteredRequests}
            onPropose={handlePropose}
            onChallenge={handleChallenge}
          />
        </div>
      </div>

      {/* Request Modal */}
      {/* {showRequestModal && (
        <RequestModal
          onSubmit={handleNewRequest}
          onClose={() => setShowRequestModal(false)}
        />
      )} */}
    </div>
  );
};

export default Dashboard;

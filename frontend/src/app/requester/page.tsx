// app/requester/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import RequesterQuickActions from "@/components/Requester/RequesterQuickActions";
import MyQuestions from "@/components/Requester/MyQuestions";
import RequestModal from "@/components/request/RequestModal";
import { TrendingUp, CheckCircle, Clock, Plus } from "lucide-react";

export interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
}

interface Question {
  id: string;
  question: string;
  description: string;
  status: "Completed" | "Pending" | "Awaiting Review" | "Challenged";
  reward: string;
  timeAgo: string;
  chains: string[];
}

const RequesterPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats([
        {
          title: "Questions Submitted",
          value: "24",
          change: "+12% from last month",
          changeType: "positive",
          icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
        },
        {
          title: "Success Rate",
          value: "96.5%",
          change: "+2.1% from last month",
          changeType: "positive",
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        },
        {
          title: "Avg Resolution Time",
          value: "2.4h",
          change: "-15min from last month",
          changeType: "positive",
          icon: <Clock className="w-6 h-6 text-orange-600" />,
        },
      ]);

      setQuestions([
        {
          id: "1247",
          question: "Weather data for NYC on Dec 15",
          description: "Weather data for NYC on Dec 15 • Ethereum → Base",
          status: "Completed",
          reward: "+$45 USDC",
          timeAgo: "2 minutes ago",
          chains: ["Ethereum", "Base"],
        },
        {
          id: "1248",
          question: "Stock price for AAPL on specific date",
          description: "Stock price for AAPL • Base → Ethereum",
          status: "Pending",
          reward: "$25 USDC",
          timeAgo: "15 minutes ago",
          chains: ["Base", "Ethereum"],
        },
        {
          id: "1249",
          question: "BTC price at market close",
          description: "Bitcoin price at market close • Ethereum",
          status: "Awaiting Review",
          reward: "$50 USDC",
          timeAgo: "1 hour ago",
          chains: ["Ethereum"],
        },
        {
          id: "1250",
          question: "Sports game result verification",
          description: "NBA game result Lakers vs Warriors • Polygon",
          status: "Challenged",
          reward: "$30 USDC",
          timeAgo: "3 hours ago",
          chains: ["Polygon"],
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleNewQuestion = () => {
    setShowRequestModal(true);
  };

  const handleUseTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics page or show analytics modal
    console.log("View analytics clicked");
  };

  const handleNewRequest = (requestData: any) => {
    const newQuestion: Question = {
      id: (Date.now() % 10000).toString(),
      question: requestData.description,
      description: requestData.description,
      status: "Pending",
      reward: `$${requestData.reward} USDC`,
      timeAgo: "Just now",
      chains: ["Ethereum"], // Default to Ethereum
    };

    setQuestions((prev) => [newQuestion, ...prev]);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Quick Actions */}
          {/* <RequesterQuickActions
            onNewQuestion={handleNewQuestion}
            onUseTemplate={handleUseTemplate}
            onViewAnalytics={handleViewAnalytics}
          /> */}

          {/* My Questions */}
          <MyQuestions questions={questions} />
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleNewQuestion}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 z-50"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Request Modal */}
      {/* {showRequestModal && (
        <RequestModal
          onSubmit={handleNewRequest}
          onClose={() => setShowRequestModal(false)}
        />
      )} */}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal onClose={() => setShowTemplateModal(false)} />
      )}
    </div>
  );
};

// Template Modal Component
const TemplateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const templates = [
    {
      id: 1,
      name: "Stock Price Query",
      description: "Get current or historical stock prices",
      category: "Finance",
      popular: true,
    },
    {
      id: 2,
      name: "Weather Data",
      description: "Current weather conditions for any location",
      category: "Environment",
      popular: true,
    },
    {
      id: 3,
      name: "Sports Results",
      description: "Game results and sports statistics",
      category: "Sports",
      popular: false,
    },
    {
      id: 4,
      name: "Crypto Price Feed",
      description: "Real-time cryptocurrency prices",
      category: "Crypto",
      popular: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Choose a Template
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Start with a pre-built template to save time
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    {template.popular && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequesterPage;

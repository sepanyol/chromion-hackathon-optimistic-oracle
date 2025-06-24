// app/requester/page.tsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import RequesterQuickActions from "@/components/Requester/RequesterQuickActions";
import MyRequests from "@/components/Requester/MyRequests";
import RequestModal from "@/components/request/RequestModal";
import { TrendingUp, CheckCircle, Clock, Plus } from "lucide-react";
import { useAccount } from "wagmi";
import { StatData } from "@/types/StatsCards";
import { useUserRequester } from "@/hooks/useUserRequester";
import CreateRequestProvider, {
  ActionTypes,
  CreateRequestContext,
} from "@/components/request/CreateRequestProvider";
import { CreateRequest } from "@/components/request/CreateRequest";
import { MyRequestsType } from "@/types/Requests";
import { formatEther, formatUnits } from "viem";
import { getReadableRequestStatus, RequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { FloatingCreateRequestAction } from "@/components/Requester/FloatingCreateRequestAction";

const RequesterPage: React.FC = () => {
  const { address, chainId, isConnected } = useAccount();
  const createRequest = useContext(CreateRequestContext);
  const requester = useUserRequester(address!);

  const [stats, setStats] = useState<StatData[]>([]);
  const [questions, setQuestions] = useState<MyRequestsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleNewQuestion = () => {
    createRequest.dispatch({ type: ActionTypes.OpenModal });
  };

  const handleUseTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics page or show analytics modal
    console.log("View analytics clicked");
  };

  const handleNewRequest = (requestData: any) => {
    const newQuestion: MyRequestsType = {
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

  useEffect(() => {
    if (!requester.isSuccess) return;
    if (!requester.data) {
      // TODO control screem when user is not existing
      return;
    }

    setStats([
      {
        title: "Requests created",
        value: requester.data.stats.requests,
        change: null,
        changeType: null,
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      },
      {
        title: "Requests active",
        value: requester.data.stats.requestsActive,
        change: null,
        changeType: null,
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      },
      {
        title: "Success Rate",
        value: requester.data.stats.successRate,
        change: null,
        changeType: null,
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      },
      {
        title: "Avg Resolution Time",
        value: `24h`, //`${requester.data.stats.requestAvgResolution}h`,
        change: null,
        changeType: null,
        icon: <Clock className="w-6 h-6 text-orange-600" />,
      },
    ]);

    setQuestions(
      requester.data.requests.map(
        (request: any): MyRequestsType => ({
          id: request.id,
          chains: null,
          description: request.context,
          reward: `${formatUnits(BigInt(request.rewardAmount), 6)} USDC`,
          question: request.question,
          status: getReadableRequestStatus(request.status as RequestStatus),
          timeAgo: timeAgo.format(Number(request.createdAt) * 1000),
        })
      )
    );
  }, [requester.data, requester.isSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex gap-2 items-center justify-center h-32 bg-white rounded-lg shadow-sm border border-gray-200">
              <span>Please</span> <appkit-connect-button />{" "}
              <span>wallet in order to see this section</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!requester.data ? (
            <span>TODO no requests for you for now. Create one</span>
          ) : (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <MyRequests questions={questions} />
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingCreateRequestAction />

        {/* Request Modal */}
        {/* {showRequestModal && (
        <RequestModal
          onSubmit={handleNewRequest}
          onClose={() => setShowRequestModal(false)}
        />
      )} */}

        {/* Template Modal */}
        {/* {showTemplateModal && (
          <TemplateModal onClose={() => setShowTemplateModal(false)} />
        )} */}
        <CreateRequest />
      </div>
    </CreateRequestProvider>
  );
};

// TODO good for a prediction market platform, not needed here for manual request generation
// // Template Modal Component
// const TemplateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const templates = [
//     {
//       id: 1,
//       name: "Stock Price Query",
//       description: "Get current or historical stock prices",
//       category: "Finance",
//       popular: true,
//     },
//     {
//       id: 2,
//       name: "Weather Data",
//       description: "Current weather conditions for any location",
//       category: "Environment",
//       popular: true,
//     },
//     {
//       id: 3,
//       name: "Sports Results",
//       description: "Game results and sports statistics",
//       category: "Sports",
//       popular: false,
//     },
//     {
//       id: 4,
//       name: "Crypto Price Feed",
//       description: "Real-time cryptocurrency prices",
//       category: "Crypto",
//       popular: true,
//     },
//   ];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">
//               Choose a Template
//             </h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Start with a pre-built template to save time
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
//           >
//             <Plus className="w-5 h-5 rotate-45" />
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {templates.map((template) => (
//               <div
//                 key={template.id}
//                 className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                       {template.name}
//                     </h3>
//                     {template.popular && (
//                       <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                         Popular
//                       </span>
//                     )}
//                   </div>
//                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                     {template.category}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600 mb-4">
//                   {template.description}
//                 </p>
//                 <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium">
//                   Use Template
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default RequesterPage;

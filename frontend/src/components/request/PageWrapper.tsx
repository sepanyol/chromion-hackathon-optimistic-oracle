"use client";
import NavBar  from "@/components/NavBar";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { useOracleContext } from "@/components/OracleProvider";
import { FloatingCreateRequestAction } from "@/components/Requester/FloatingCreateRequestAction";
import MyRequests from "@/components/Requester/MyRequests";
import StatCard from "@/components/StatCard";
import { CreateRequest } from "@/components/request/CreateRequest";
import { NoRequestsYet } from "@/components/request/NoRequestsYet";
import { useUserRequester } from "@/hooks/useUserRequester";
import { MyRequestsType } from "@/types/Requests";
import { StatData } from "@/types/StatsCards";
import { defaultChain } from "@/utils/appkit/context";
import { getChainById } from "@/utils/chains";
import { getReadableRequestStatus, RequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";

export const RequestPageWrapper = () => {
  const { account: address, isConnected, isReady } = useEvmClients();
  const { assetDecimals, assetSymbol, isOracleLoaded } = useOracleContext();
  const requester = useUserRequester(address!);
  const [stats, setStats] = useState<StatData[]>([]);
  const [questions, setQuestions] = useState<MyRequestsType[]>([]);

  useEffect(() => {
    if (!requester.isSuccess || !requester.data) return;

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
          chains: [getChainById(defaultChain.id).name].filter((a) => a),
          description: request.context,
          reward: `${formatUnits(
            BigInt(request.rewardAmount),
            assetDecimals!
          )} ${assetSymbol}`,
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
        <NavBar />

        {/* Network Status Bar */}
        <NetworkStatusBar />

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

  if (!isOracleLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />

        {/* Network Status Bar */}
        <NetworkStatusBar />

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
        {!requester.data ? (
          <NoRequestsYet />
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

      {isReady && (
        <>
          {/* Floating Action Button */}
          <FloatingCreateRequestAction />

          {/* Template Modal */}
          {/* {showTemplateModal && (
          <TemplateModal onClose={() => setShowTemplateModal(false)} />
        )} */}
          <CreateRequest />
        </>
      )}
    </div>
  );
};

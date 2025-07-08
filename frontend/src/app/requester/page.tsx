"use client";
import Navbar from "@/components/Navbar";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import OracleProvider from "@/components/OracleProvider";
import CreateRequestProvider from "@/components/request/CreateRequestProvider";
import { RequestPageWrapper } from "@/components/request/PageWrapper";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import React from "react";
import { ToastContainer } from "react-toastify";

const RequesterPage: React.FC = () => {
  const { isConnected } = useEvmClients();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showNavigation />

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

  return (
    <OracleProvider>
      <CreateRequestProvider>
        <RequestPageWrapper />
        <ToastContainer />
      </CreateRequestProvider>
    </OracleProvider>
  );
};

export default RequesterPage;

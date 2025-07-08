"use client";
import { BackLinkBar } from "@/components/BackLinkBar";
import { ChallengerRequestDetails } from "@/components/challenger/details/ChallengerRequestDetails";
import Navbar from "@/components/Navbar";
import OracleProvider from "@/components/OracleProvider";
import RequestProvider from "@/components/RequestProvider";
import { useParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { Address } from "viem";

const ChallengeRequestPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: Address }>();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      <BackLinkBar href="/challenger" label="Back to Overview" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <OracleProvider>
          <RequestProvider requestId={requestId}>
            <ChallengerRequestDetails />
          </RequestProvider>
        </OracleProvider>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChallengeRequestPage;

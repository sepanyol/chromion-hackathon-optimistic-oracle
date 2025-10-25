import { BackLinkBar } from "@/components/BackLinkBar";
import Navbar from "@/components/Navbar";
import RequestProvider from "@/components/RequestProvider";
import { SolverRequestDetails } from "@/components/solver/details/SolverRequestDetails";
import { ToastContainer } from "react-toastify";
import { Address } from "viem";

const ProposeAnswerPage: React.FC<{
  params: Promise<{ requestId: Address }>;
}> = async ({ params }) => {
  const { requestId } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      <BackLinkBar href="/solver" label="Back to Overview" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <RequestProvider requestId={requestId}>
          <SolverRequestDetails />
        </RequestProvider>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProposeAnswerPage;

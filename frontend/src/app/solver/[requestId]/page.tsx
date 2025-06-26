import Navbar from "@/components/Navbar";
import { SolverRequestDetails } from "@/components/solver/details/SolverRequestDetails";
import { Address } from "viem";

const ProposeAnswerPage: React.FC<{
  params: Promise<{ requestId: Address }>;
}> = async ({ params }) => {
  const { requestId } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      TODO add back link
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SolverRequestDetails requestId={requestId} />
      </div>
    </div>
  );
};

export default ProposeAnswerPage;

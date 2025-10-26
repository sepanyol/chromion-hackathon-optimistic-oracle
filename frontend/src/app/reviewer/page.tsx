"use client";
import Navbar from "@/components/Navbar";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { AvailableReviews } from "@/components/reviewer/AvailableReviews";
import { MyReviews } from "@/components/reviewer/MyReviews";
import StatCard from "@/components/StatCard";
import { useAvailableReviews } from "@/hooks/useAvailableReviews";
import { useUserReviewer } from "@/hooks/useUserReviewer";
import { AvailableReviewsType, MyReviewsType } from "@/types/Requests";
import { StatData } from "@/types/StatsCards";
import { Check, DollarSign, Handshake, Scale, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

const ReviewerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatData[]>([]);
  const [myReviews, setMyReviews] = useState<MyReviewsType[]>([]);
  const [availableReviews, setAvailableReviews] = useState<
    AvailableReviewsType[]
  >([]);

  const { address: accountAddress } = useAccount();
  const reviewer = useUserReviewer(accountAddress!);
  const reviews = useAvailableReviews();

  useEffect(() => {
    if (!reviews.isSuccess) return;
    setAvailableReviews(reviews.data ? reviews.data : []);
  }, [reviews.data, reviews.isSuccess]);

  useEffect(() => {
    if (!reviewer.isSuccess || !reviewer.data) return;

    setStats([
      {
        change: null,
        changeType: "positive",
        icon: <Scale className="w-6 h-6 text-purple-600" />,
        title: "Review Queue",
        value: reviewer.data.dashboard.activeChallenges,
      },
      {
        change: null,
        changeType: "positive",
        icon: <Check className="w-6 h-6 text-green-600" />,
        title: "Reviews Completed",
        value: reviewer.data.user
          ? Number(reviewer.data.user.stats.reviews) -
            Number(reviewer.data.user.stats.reviewsActive)
          : "0",
      },
      {
        change: null,
        changeType: "positive",
        icon: <DollarSign className="w-6 h-6 text-blue-600" />,
        title: "Earned",
        value: reviewer.data.user
          ? `${Number(
              formatUnits(reviewer.data.user.stats.earningsInUSD, 6)
            ).toLocaleString(navigator.language)} USDC`
          : "0",
      },
      {
        change: null,
        changeType: "positive",
        icon: <Star className="w-6 h-6 text-yellow-600" />,
        title: "Reviewer Reputation",
        value: "4.8/5",
      },
    ]);

    if (reviewer.data.user && reviewer.data.user.reviews) {
      setMyReviews([...reviewer.data.user.reviews]);
    } else setMyReviews([]);

    setIsLoading(false);
  }, [reviewer.isSuccess, reviewer.data]);

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Grid */}
          <div className="col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-4 space-y-8">
            {/* Available Challenges */}
            <div className="space-y-4">
              <AvailableReviews reviews={availableReviews} />
              <MyReviews reviews={myReviews} />
            </div>
            {/* Already Reviewd Challenges */}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ReviewerPage;

import Navbar from "@/components/Navbar";
import { Main } from "@/components/rwa/Main";
import React from "react";

const RealWorldAssets: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Main />
      </div>
    </div>
  );
};

export default RealWorldAssets;

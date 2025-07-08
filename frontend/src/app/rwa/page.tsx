"use client";
import Navbar from "@/components/Navbar";
import OracleProvider from "@/components/OracleProvider";
import CreateRequestProvider from "@/components/request/CreateRequestProvider";
import { Main } from "@/components/rwa/Main";
import React from "react";
import { ToastContainer } from "react-toastify";

const RealWorldAssets: React.FC = () => {
  return (
    <OracleProvider>
      <CreateRequestProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar showNavigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Main />
          </div>
          <ToastContainer />
        </div>
      </CreateRequestProvider>
    </OracleProvider>
  );
};

export default RealWorldAssets;

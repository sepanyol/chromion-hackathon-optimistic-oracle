"use client";
import OracleProvider from "@/components/OracleProvider";
import { SolverPageWrapper } from "@/components/solver/PageWrapper";
import React from "react";
import { ToastContainer } from "react-toastify";

const SolverPage: React.FC = () => {
  return (
    <OracleProvider>
      <SolverPageWrapper />
      <ToastContainer />
    </OracleProvider>
  );
};

export default SolverPage;

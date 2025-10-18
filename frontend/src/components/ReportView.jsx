import React from "react";
import BasicDetails from "./BasicDetails";
import ReportSummary from "./ReportSummary";
import CreditAccounts from "./CreditAccounts";

export default function ReportView({ report }) {
  if (!report) return <div>No report</div>;

  return (
    <div>
      <BasicDetails basic={report.basic} />
      <ReportSummary summary={report.summary} />
      <CreditAccounts creditAccounts={report.creditAccounts} />
    </div>
  );
}

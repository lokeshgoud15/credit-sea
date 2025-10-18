import React from "react";

export default function ReportSummary({ summary }) {
  if (!summary) return <p>No summary available</p>;

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-2">Report Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-2 bg-white rounded shadow">
          Total Accounts: {summary.totalAccounts || 0}
        </div>
        <div className="p-2 bg-white rounded shadow">
          Active Accounts: {summary.activeAccounts || 0}
        </div>
        <div className="p-2 bg-white rounded shadow">
          Closed Accounts: {summary.closedAccounts || 0}
        </div>
        <div className="p-2 bg-white rounded shadow">
          Current Balance:{" "}
          {summary.currentBalance ?? summary.currentBalanceAmount ?? 0}
        </div>
        <div className="p-2 bg-white rounded shadow">
          Secured Accounts:{" "}
          {summary.securedAccounts ?? summary.securedAccountsAmount ?? 0}
        </div>
        <div className="p-2 bg-white rounded shadow">
          Unsecured Accounts:{" "}
          {summary.unsecuredAccounts ?? summary.unsecuredAccountsAmount ?? 0}
        </div>
        <div className="p-2 bg-white rounded shadow">
          Last 7 Days Enquiries: {summary.last7DaysEnquiries || 0}
        </div>
      </div>
    </div>
  );
}

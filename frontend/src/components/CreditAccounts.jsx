import React from "react";

export default function CreditAccounts({ creditAccounts }) {
  if (!creditAccounts || creditAccounts.length === 0)
    return <p>No credit accounts available</p>;

  const renderCell = (v) => {
    if (v == null || v === "") return "-";
    if (typeof v === "object") {
      // common shape: address objects or nested holder objects
      // try to flatten useful string fields
      const keys = [
        "First_Line_Of_Address_non_normalized",
        "Second_Line_Of_Address_non_normalized",
        "Third_Line_Of_Address_non_normalized",
        "City_non_normalized",
        "ZIP_Postal_Code_non_normalized",
      ];
      const parts = [];
      for (const k of keys) if (v[k]) parts.push(v[k]);
      // fallback: if object has string values, join them
      if (parts.length) return parts.join(", ");
      const strValues = Object.values(v).filter(
        (x) => typeof x === "string" && x.trim() !== ""
      );
      if (strValues.length) return strValues.join(", ");
      try {
        return JSON.stringify(v);
      } catch (e) {
        return "-";
      }
    }
    return String(v);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-2">Credit Accounts</h3>
      <div className="overflow-auto max-h-[300px]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Bank</th>
              <th className="p-2 text-left">Account Number</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Amount Overdue</th>
              <th className="p-2 text-left">Current Balance</th>
            </tr>
          </thead>
          <tbody>
            {creditAccounts?.map((acc, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-2">{acc.type || "-"}</td>
                <td className="p-2">{acc.institution || "-"}</td>
                <td className="p-2">{acc.accountNumber || "-"}</td>
                <td className="p-2">{renderCell(acc.address)}</td>
                <td className="p-2">
                  {Number(acc.amountOverdue || 0).toLocaleString()}
                </td>
                <td className="p-2">
                  {Number(acc.currentBalance || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

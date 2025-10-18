import React from "react";

export default function BasicDetails({ basic }) {
  if (!basic) return <p>No basic details available</p>;

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Basic Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <strong>Name:</strong> {basic.name || "-"}
        </div>
        <div>
          <strong>Mobile:</strong> {basic.mobilePhone || "-"}
        </div>
        <div>
          <strong>PAN:</strong> {basic.pan || "-"}
        </div>
        {/* <div>
          <strong>Credit Score:</strong> {basic.creditScore || "-"}
        </div> */}
      </div>
    </div>
  );
}

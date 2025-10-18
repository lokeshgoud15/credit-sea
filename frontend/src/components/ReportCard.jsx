import React from "react";

export default function ReportCard({ report, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-3 border rounded hover:bg-gray-50 shadow-sm"
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">{report.basic?.name || "Unnamed"}</div>
          <div className="text-sm text-gray-500">
            PAN: {report?.basic?.pan || "-"}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {report?.uploadedAt
            ? new Date(report?.uploadedAt).toLocaleString()
            : "-"}
        </div>
      </div>
    </div>
  );
}

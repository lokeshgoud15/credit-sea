import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports, fetchReportById } from "../features/reportsSlice";

import FileUpload from "../components/FileUpload";
import ReportCard from "../components/ReportCard";
import ReportView from "../components/ReportView";

export default function Home() {
  const dispatch = useDispatch();
  const { list, current, status } = useSelector((s) => s.reports);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  useEffect(() => {
    if (selectedId) dispatch(fetchReportById(selectedId));
  }, [selectedId, dispatch]);

  const onUpload = async (uploadResult) => {
    
    await dispatch(fetchReports());
    const newId =
      uploadResult?.id ||
      (typeof uploadResult === "string" ? uploadResult : null);
    if (newId) setSelectedId(newId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-1">
        <div className="bg-white p-4 rounded shadow">
          <FileUpload onUpload={onUpload} />
        </div>

        <div className="mt-4 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Reports</h2>
          {status === "loading" ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {list.map((r) => (
                <ReportCard
                  key={r._id}
                  report={r}
                  onClick={() => setSelectedId(r._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 md:col-span-2">
        <div className="bg-white p-4 rounded shadow min-h-[60vh]">
          {current ? (
            <ReportView report={current} />
          ) : (
            <div>Select a report to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}

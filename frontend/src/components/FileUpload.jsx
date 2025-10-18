import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadReport, fetchReports } from "../features/reportsSlice";

const FileUpload = ({ onUpload }) => {
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  // uploadState: 'idle' | 'uploading' | 'succeeded' | 'failed'
  const [uploadState, setUploadState] = useState("idle");
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // reset local UI state when choosing a new file
    setUploadState("idle");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an XML file first.");
      return;
    }

    try {
      setUploadState("uploading");
      setError(null);

      // use unwrap to get the fulfilled payload or throw the rejected error
      const res = await dispatch(uploadReport(file)).unwrap();

      // optional parent callback
      if (typeof onUpload === "function") onUpload(res);

      // refresh list in-place as a best-effort (parent may also refresh)
      dispatch(fetchReports());

      setUploadState("succeeded");
      setFile(null);
    } catch (err) {
      setUploadState("failed");
      setError(err?.message || String(err));
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Upload XML Report</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-md p-2 w-full sm:w-1/2 cursor-pointer"
        />

        <button
          type="submit"
          disabled={uploadState === "uploading"}
          className={`px-4 py-2 rounded-md text-white cursor-pointer ${
            uploadState === "uploading"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploadState === "uploading" ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="mt-4">
        {uploadState === "idle" && (
          <p className="text-gray-600">No file yet to be uploaded.</p>
        )}

        {uploadState === "uploading" && (
          <p className="text-gray-500">Uploading, please wait...</p>
        )}

        {uploadState === "succeeded" && (
          <p className="text-green-600 mt-2">File uploaded successfully!</p>
        )}

        {uploadState === "failed" && (
          <p className="text-red-600 mt-2">Upload failed: {error}</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

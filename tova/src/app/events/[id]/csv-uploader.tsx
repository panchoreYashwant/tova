"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadGuestsCSV } from "./actions";

type CSVImportResult = {
  added: number;
  duplicates: number;
  invalid: number;
  errors: string[];
};

export default function CSVUploader({ eventId }: { eventId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("eventId", eventId);

    const uploadResult = await uploadGuestsCSV(formData);

    if (uploadResult.error) {
      setError(uploadResult.error);
    } else if (uploadResult.result) {
      setResult(uploadResult.result);
      router.refresh();
    }

    setIsUploading(false);
    setFile(null); // Reset file input
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Import from CSV</h2>
      <div className="mt-4 rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Upload a CSV file with "Name" and "Email" columns to add guests in
          bulk.
        </p>
        <div className="mt-4">
          <label htmlFor="csv-upload" className="sr-only">
            Choose a CSV file
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="inline-flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {result && (
          <div className="mt-4 rounded-md bg-gray-50 p-4 text-sm">
            <h3 className="font-semibold text-gray-900">Import Complete</h3>
            <p className="text-green-600">Added: {result.added}</p>
            <p className="text-yellow-600">Duplicates: {result.duplicates}</p>
            <p className="text-red-600">Invalid rows: {result.invalid}</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold text-gray-900">Errors:</h4>
                <ul className="list-disc list-inside text-red-600">
                  {result.errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

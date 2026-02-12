"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CsvImportProps = {
  eventId: string;
};

export default function CsvImport({ eventId }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    added: number;
    duplicates: number;
    invalid: number;
    errors: string[];
  } | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file to import.");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    const response = await fetch("/api/guests/import", {
      method: "POST",
      body: formData,
    });

    setIsImporting(false);

    if (response.ok) {
      const result = await response.json();
      setImportResult(result);
      router.refresh();
    } else {
      alert("Failed to import CSV.");
    }
  };

  return (
    <div className="p-4 mt-8 border-t">
      <h2 className="text-2xl font-bold mb-4">Import Guests from CSV</h2>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <button
          onClick={handleImport}
          disabled={!file || isImporting}
          className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isImporting ? "Importing..." : "Import"}
        </button>
      </div>
      {importResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold">Import Summary</h3>
          <p>Added: {importResult.added}</p>
          <p>Duplicates: {importResult.duplicates}</p>
          <p>Invalid entries: {importResult.invalid}</p>
          {importResult.errors.length > 0 && (
            <div>
              <h4 className="font-semibold mt-2">Errors:</h4>
              <ul className="list-disc list-inside text-red-600">
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

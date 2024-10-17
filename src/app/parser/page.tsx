"use client";

import { useState } from "react";
import Papa from "papaparse";
import DataGrid, { textEditor } from "react-data-grid";
import "react-data-grid/lib/styles.css";

export default function CSVUpload() {
  const [columns, setColumns] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const calculateColumnWidth = (header: string, rows: any[], key: string) => {
    const maxLength = Math.max(
      header.length,
      ...rows.map((row) => (row[key] ? String(row[key]).length : 0))
    );

    return Math.max(80, maxLength * 10);
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];

    // Clear previous data
    setColumns([]);
    setRows([]);

    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result: any) => {
          const parsedData = result.data;

          if (parsedData.length > 0) {
            const headers = Object.keys(parsedData[0]);

            const gridColumns = headers.map((header) => ({
              key: header,
              name: header,
              resizable: true,
              sortable: true,
              editable: true,
              renderEditCell: textEditor,
              width: calculateColumnWidth(header, parsedData, header),
            }));

            setColumns(gridColumns);
            setRows(parsedData);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const rowKeyGetter = (row: any) => {
    return row[columns.length > 0 ? columns[0].key : ""];
  };

  const handleRowsChange = (newRows: any[]) => {
    setRows(newRows);
  };

  return (
    <div className=" mx-auto p-6 bg-white">
      <h1 className="text-2xl font-semibold mb-4 mx-auto text-center">
        CSV Upload Demo
      </h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
      />

      {rows.length > 0 && columns.length > 0 && (
        <div>
          <DataGrid
            columns={columns}
            rows={rows}
            rowKeyGetter={rowKeyGetter}
            onRowsChange={handleRowsChange}
            defaultColumnOptions={{
              sortable: true,
              resizable: true,
            }}
            className="bg-gray-50 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      )}
    </div>
  );
}

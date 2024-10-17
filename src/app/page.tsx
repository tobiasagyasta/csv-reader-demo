"use client";

import { useState } from "react";
import Papa from "papaparse";
import DataGrid, { textEditor } from "react-data-grid";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CSVUpload() {
  const [columns, setColumns] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  // Helper function to calculate dynamic column width
  const calculateColumnWidth = (header: string, rows: any[], key: string) => {
    const maxLength = Math.max(
      header.length,
      ...rows.map((row) => (row[key] ? String(row[key]).length : 0))
    );
    return Math.max(80, maxLength * 10); // Minimum 80px or based on length
  };

  // Handle CSV file upload
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setColumns([]);
    setRows([]);

    if (file) {
      setFileName(file.name);
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
              width: Math.max(
                100,
                calculateColumnWidth(header, parsedData, header)
              ),
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

  // Function to return row id based on the first column
  const rowKeyGetter = (row: any) =>
    row[columns.length > 0 ? columns[0].key : ""];

  // Convert the DataGrid content to PDF using jsPDF and autoTable
  const handleSavePDF = () => {
    const doc = new jsPDF({
      orientation: "landscape", // Landscape to give more horizontal space
      unit: "mm",
      format: [420, 297],
    });

    // Prepare column headers as strings for autoTable
    const pdfColumns = columns.map((col) => col.name); // Extract the names of columns

    // Prepare rows for autoTable
    const pdfRows = rows.map(
      (row) => columns.map((col) => row[col.key]) // Extract row data based on the column keys
    );

    // Add title to the PDF
    doc.text(fileName.replace(".csv", ""), 14, 16);

    // Add autoTable to the PDF
    autoTable(doc, {
      head: [pdfColumns], // Table header
      body: pdfRows, // Table body
      startY: 20, // Start after the title
      theme: "grid", // Optional: Theme for the table (grid, plain, etc.)
      headStyles: { lineWidth: 0.3 },
      styles: { fontSize: 10, cellPadding: 2, halign: "center" }, // Adjust font size and cell padding
      columnStyles: {
        // Adjust individual column widths, or apply the same width to all columns
        0: { cellWidth: "auto" }, // You can set specific widths for columns, 'auto' allows resizing
      },
      margin: { top: 30 }, // Adjust top margin to make space for title
      pageBreak: "auto", // Automatically break pages
    });

    // Save the generated PDF
    doc.save(`${fileName.replace(".csv", "")}.pdf`);
  };

  return (
    <div>
      <h1 className="mx-auto text-center my-8 text-3xl">Upload CSV Demo</h1>
      <input
        className="ml-4 mb-8"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {rows.length > 0 && columns.length > 0 && (
        <>
          <div id="dataGridContainer">
            <DataGrid
              columns={columns.map((col) => ({
                ...col,
                name: <div className="min-w-[100px]">{col.name}</div>, // Using Tailwind for min-width
              }))}
              rows={rows}
              rowKeyGetter={rowKeyGetter}
              onRowsChange={setRows}
              defaultColumnOptions={{
                sortable: true,
                resizable: true,
              }}
              className="ml-4"
            />
          </div>
          {/* Button to trigger PDF save */}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ml-4"
            onClick={handleSavePDF}
          >
            Save as PDF
          </button>
        </>
      )}
    </div>
  );
}

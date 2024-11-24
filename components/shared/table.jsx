"use client";

import { formatCurrency } from "@/utils";
import React, { useState } from "react";

function Table() {
  // Initial data array
  const [tableData, setTableData] = useState([
    [
      "Row 1 Col 1",
      "Row 1 Col 2",
      "Row 1 Col 3",
      "Row 1 Col 4",
      "Row 1 Col 5",
      "Row 1 Col 6",
    ],
    [
      "Row 2 Col 1",
      "Row 2 Col 2",
      "Row 2 Col 3",
      "Row 2 Col 4",
      "Row 2 Col 5",
      "Row 2 Col 6",
    ],
    [
      "Row 3 Col 1",
      "Row 3 Col 2",
      "Row 3 Col 3",
      "Row 3 Col 4",
      "Row 3 Col 5",
      "Row 3 Col 6",
    ],
  ]);

  return (
    <div className=" bg-gray-50 p-6 ">
      {/* Table */}
      <table className="table-auto border-collapse border border-gray-300 w-full max-w-full bg-white shadow-md rounded-md overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 p-2">№</th>
            <th className="border border-gray-300 p-2">Наличные</th>
            <th className="border border-gray-300 p-2">Карточка</th>
            <th className="border border-gray-300 p-2">Click</th>
            <th className="border border-gray-300 p-2">Pay me</th>
            <th className="border border-gray-300 p-2">Uzum</th>
            <th className="border border-gray-300 p-2">Заем</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(10000)} СУМ</td>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(3000)} СУМ</td>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(500000)} СУМ</td>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(45000)} СУМ</td>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(95000)} СУМ</td>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(74000)} СУМ</td>
            <td className="border border-gray-300 p-2 text-center">{formatCurrency(32000)} СУМ</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Table;

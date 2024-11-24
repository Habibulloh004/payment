"use client";

import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";

import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme CSS

export default function DatePicker({ range, setRange, setShowDate, fetchTransaction }) {
  const predefinedRanges = [
    {
      label: "Сегодня",
      range: { startDate: new Date(), endDate: new Date() }, // Today
    },
    {
      label: "Вчера",
      range: {
        startDate: addDays(new Date(), -1),
        endDate: addDays(new Date(), -1),
      }, // Yesterday
    },
    {
      label: "Последние 7 дней",
      range: {
        startDate: addDays(new Date(), -7),
        endDate: new Date(),
      }, // Last 7 days
    },
    {
      label: "Последние 30 дней",
      range: {
        startDate: addDays(new Date(), -30),
        endDate: new Date(),
      }, // Last 30 days
    },
  ];

  return (
    <div className="bg-gray-100 p-5 rounded-md">
      <DateRange
        editableDateInputs={true}
        onChange={(item) => setRange([item.selection])} // Update the selected range
        moveRangeOnFirstSelection={false}
        ranges={range} // Pass the range state
        months={2} // Show two months side by side
        direction="horizontal"
      />

      <button
        onClick={() => {
          setShowDate((prev) => !prev);
          fetchTransaction()
        }}
        style={{
          marginTop: "10px",
          padding: "5px 10px",
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Применить
      </button>

      <div style={{ marginTop: "10px" }}>
        {predefinedRanges.map((preset, index) => (
          <button
            key={index}
            onClick={() => setRange([preset.range])}
            style={{
              margin: "5px",
              padding: "5px",
              background: "#e0e0e0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

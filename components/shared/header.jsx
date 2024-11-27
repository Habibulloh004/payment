"use client";
import React, { useRef, useState } from "react";
import DatePicker from "@/components/shared/date-picker";

const Header = ({ range, setRange, transaction, fetchTransaction }) => {
  const [showDate, setShowDate] = useState(false);
  const inputRef = useRef();

  // Function to format the month and day in Russian
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long" })
      .format(date)
      .replace(/(^|\s)\S/g, (l) => l.toUpperCase()); // Capitalize the first letter
  };

  return (
    <header className="h-20">
      <div className="flex justify-between items-center w-full p-3">
        <span className="flex items-end gap-3">
          <h1 className="text-xl">Оплаты</h1>
          {/* <span>{transaction.count}</span> */}
          <span>{transaction.count}</span>
        </span>

        <div className="flex gap-3">
          <span className="relative">
            <button
              className="bg-gray-200 rounded-md py-2 px-3"
              onClick={() => setShowDate((prev) => !prev)}
            >
              {`${formatDate(range[0].startDate)} - ${formatDate(
                range[0].endDate
              )}`}
            </button>
            <div
              className={`${
                showDate ? "block" : "hidden"
              } absolute right-0 mt-3 mr-5`}
            >
              <DatePicker
                range={range}
                setRange={setRange}
                setShowDate={setShowDate}
                fetchTransaction={fetchTransaction}
              />
            </div>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

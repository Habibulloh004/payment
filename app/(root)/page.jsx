"use client";
import Header from "@/components/shared/header";
import Table from "@/components/shared/table";

import { subMonths } from "date-fns";
import { useState, useEffect } from "react";
import { getCookies, getCookie } from "cookies-next/client";
import Pagination from "@/components/shared/pagination";
import Script from "next/script";

export default function Home() {
  const [token, setToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState([10, 20, 30, 40, 50]);
  const [currentLimit, setCurrentLimit] = useState(limit[0]);
  const [totalPage, setTotalPage] = useState(1);
  const [transaction, setTransaction] = useState({});
  const [range, setRange] = useState([
    {
      startDate: subMonths(new Date(), 1), // Today's date as the default start date
      endDate: new Date(), // 7 days from today as the default end date
      key: "selection",
    },
  ]);

  function fetchTransaction() {
    fetch(
      `/api/getTransaction?token=${token}&date_from=${range[0].startDate
        .toISOString()
        .slice(0, 10)}&date_to=${range[0].endDate.toISOString().slice(0, 10)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return response.json();
      })
      .then((data) => {
        setTransaction(data);
        setTotalPage(Math.ceil(data.count / currentLimit));
        console.log(Math.ceil(data.count / currentLimit));
        console.log(data);
      })
      .catch((error) => console.error("Error fetching transaction:", error));
  }

  useEffect(() => {
    window.addEventListener(
      "load",
      function () {
        top.postMessage({ hideSpinner: true }, "*");
      },
      false
    );
  }, []);

  useEffect(() => {
    // window.addEventListener(
    //   "load",
    //   function () {
    //     top.postMessage({ hideSpinner: true }, "*");
    //   },
    //   false
    // );
    const cook = getCookie("authToken");
    setToken(cook);
  }, []);

  useEffect(() => {
    if (token && token.length) {
      fetchTransaction();
    }
  }, [token]); // Fetch transactions when token changes

  return (
    <>
      {token && token.length ? (
        <>
          <Header
            range={range}
            setRange={setRange}
            transaction={transaction}
            fetchTransaction={fetchTransaction}
          />
          <Table transaction={transaction} />
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
          />
        </>
      ) : (
        <div className="h-screen w-screen flex justify-center items-center">
          <button
            onClick={() => {
              window.location.href = `https://joinposter.com/api/auth?application_id=3771&redirect_uri=${process.env.NEXT_PUBLIC_URL}/auth&response_type=code`;
            }}
          >
            Авторизация
          </button>
        </div>
      )}
    </>
  );
}

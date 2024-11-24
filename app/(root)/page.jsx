"use client";
import Loader from "@/components/shared/Loader/Loader";
import Header from "@/components/shared/header";
import Table from "@/components/shared/table";
import { subMonths } from "date-fns";
import { useState, useEffect } from "react";

export default function Home() {
  const [transaction, setTransaction] = useState({});
  const [token, setToken] = useState("");
  const [range, setRange] = useState([
    {
      startDate: subMonths(new Date(), 1), // Today's date as the default start date
      endDate: new Date(), // 7 days from today as the default end date
      key: "selection",
    },
  ]);

  // Use useEffect to handle localStorage on the client side only
  useEffect(() => {
    const storedToken = localStorage.getItem("paymentToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); // Empty dependency array ensures this runs only once after component mounts

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
        setTransaction(data); // Store the data in state
        console.log("Fetched Data:", data);
      })
      .catch((error) => console.error("Error fetching transaction:", error));
  }

  useEffect(() => {
    if (token && token.length) {
      fetchTransaction();
    }
  }, [token]); // Fetch transactions when token changes

  // Optionally handle the case when data is loading
  // if (!transaction || !transaction.count) {
  //   return <Loader />;
  // }

  return (
    <>
      <Header
        range={range}
        setRange={setRange}
        transaction={transaction}
        fetchTransaction={fetchTransaction}
        token={token}
        setToken={setToken}
      />
      <Table />
    </>
  );
}

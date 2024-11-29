"use client";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.addEventListener(
      "load",
      function () {
        top.postMessage({ hideSpinner: true }, "*");
      },
      false
    );
    window.location.href = `${process.env.NEXT_PUBLIC_URL}`;
  }, []);
  return <div>Extra</div>;
};

export default Page;

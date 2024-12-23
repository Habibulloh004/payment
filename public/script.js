document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;
  let currentLimit = 10;
  let dateRange = getLastMonthRange(); // Default date range: o'tgan oyning shu kuni

  // fetch("/token")
  //   .then((data) => data.json())
  //   .then((d) => {
  //     if (d == false) {
  //       window.location.href = `https://joinposter.com/api/auth?application_id=3771&redirect_uri=http://localhost:3000/auth&response_type=code`;
  //     }
  //   });

  // Dinamik sanalar oralig'ini hisoblash
  function getLastMonthRange() {
    const today = new Date();
    const lastMonthDate = new Date(today);
    lastMonthDate.setMonth(today.getMonth() - 1);

    const formatDate = (date) => date.toISOString().slice(0, 10);
    return [formatDate(lastMonthDate), formatDate(today)];
  }

  function getDynamicRanges() {
    const today = new Date();
    const formatDate = (date) => date.toISOString().slice(0, 10);

    return [
      { label: "Сегодня", range: [formatDate(today), formatDate(today)] },
      {
        label: "Вчера",
        range: [
          formatDate(new Date(today.setDate(today.getDate() - 1))),
          formatDate(today),
        ],
      },
      {
        label: "Последние 7 дней",
        range: [
          formatDate(new Date(today.setDate(today.getDate() - 7))),
          formatDate(new Date()),
        ],
      },
      {
        label: "Последние 30 дней",
        range: [
          formatDate(new Date(today.setDate(today.getDate() - 30))),
          formatDate(new Date()),
        ],
      },
    ];
  }

  // Predefined range tugmalarini yaratish
  function renderPredefinedRanges() {
    const ranges = getDynamicRanges();
    const container = document.getElementById("week-datepicker");

    ranges.forEach((range, index) => {
      const button = document.createElement("button");
      button.textContent = range.label;
      button.className = "bg-gray-200 p-2 m-1 rounded border";
      button.addEventListener("click", () => {
        dateRange = range.range;
        console.log("Selected Range:", dateRange);
        fetchTransaction();
      });
      container.appendChild(button);
    });
  }

  // Fetch and display transactions
  function fetchTransaction() {
    const [startDate, endDate] = dateRange;
    const url = window.location.href;

    // Parse the URL
    const urlParams = new URLSearchParams(new URL(url).search);

    // Get the value of the 'access_token' query parameter
    const token = urlParams.get("access_token");
    // Validate date range before making the API call
    if (!startDate || !endDate) {
      console.error("Invalid date range selected");
      return;
    }

    fetch(
      `/api/getTransaction?access_token=${token}&date_from=${startDate}&date_to=${endDate}&page=${currentPage}&limit=${currentLimit}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        return response.json();
      })
      .then((res) => {
        updateTable(res.data);
        console.log(res);
        document.getElementById(
          "transaction-count"
        ).innerText = `(${res.count})`;
      })
      .catch((error) => console.error("Error fetching transaction:", error));
  }

  // Format currency for display
  function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return "0.00";
    const [integerPart, fractionalPart] = parseFloat(amount)
      .toFixed(2)
      .toString()
      .split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${fractionalPart}`;
  }

  // Update the transactions table
  function updateTable(transactions) {
    const parsedData = transactions.map((item) => {
      const extras = JSON.parse(item.extras?.combo_box || "{}");
      return {
        cash: parseFloat(extras.cash) || 0,
        card: parseFloat(extras.card) || 0,
        click: parseFloat(extras.click) || 0,
        uzum: parseFloat(extras.uzum) || 0,
        payme: parseFloat(extras.payme) || 0,
        loan: parseFloat(extras.loan) || 0,
      };
    });

    const tbody = document.querySelector("#transactionTable tbody");
    tbody.innerHTML = "";

    parsedData.forEach((item, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border border-gray-300 p-2 text-center">${idx + 1}</td>
        <td class="border border-gray-300 p-2 text-center">${formatCurrency(
          item.cash
        )} СУМ</td>
        <td class="border border-gray-300 p-2 text-center">${formatCurrency(
          item.card
        )} СУМ</td>
        <td class="border border-gray-300 p-2 text-center">${formatCurrency(
          item.click
        )} СУМ</td>
        <td class="border border-gray-300 p-2 text-center">${formatCurrency(
          item.payme
        )} СУМ</td>
        <td class="border border-gray-300 p-2 text-center">${formatCurrency(
          item.loan
        )} СУМ</td>
        <td class="border border-gray-300 p-2 text-center">${formatCurrency(
          item.uzum
        )} СУМ</td>
      `;
      tbody.appendChild(row);
    });

    // Calculate totals
    const totals = parsedData.reduce(
      (acc, item) => {
        acc.cash += item.cash;
        acc.card += item.card;
        acc.click += item.click;
        acc.uzum += item.uzum;
        acc.payme += item.payme;
        acc.loan += item.loan;
        return acc;
      },
      { cash: 0, card: 0, click: 0, uzum: 0, payme: 0, loan: 0 }
    );

    // Append totals row
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
      <td class="border border-gray-300 p-2 text-center font-bold">Total</td>
      <td class="border border-gray-300 p-2 text-center font-bold">${formatCurrency(
        totals.cash
      )} СУМ</td>
      <td class="border border-gray-300 p-2 text-center font-bold">${formatCurrency(
        totals.card
      )} СУМ</td>
      <td class="border border-gray-300 p-2 text-center font-bold">${formatCurrency(
        totals.click
      )} СУМ</td>
      <td class="border border-gray-300 p-2 text-center font-bold">${formatCurrency(
        totals.payme
      )} СУМ</td>
      <td class="border border-gray-300 p-2 text-center font-bold">${formatCurrency(
        totals.loan
      )} СУМ</td>
      <td class="border border-gray-300 p-2 text-center font-bold">${formatCurrency(
        totals.uzum
      )} СУМ</td>
    `;
    tbody.appendChild(totalRow);
  }

  // Date picker setup
  flatpickr("#dateRangePicker", {
    mode: "range",
    // maxDate: "tomorrow",
    defaultDate: dateRange,
    dateFormat: "Y-m-d",
    onClose: (selectedDates) => {
      if (selectedDates.length === 2) {
        dateRange = [
          selectedDates[0].toISOString().slice(0, 10),
          selectedDates[1].toISOString().slice(0, 10),
        ];
      }
    },
  });

  // Toggle date picker visibility when clicking the dateButton
  document.getElementById("dateButton").addEventListener("click", (event) => {
    // Prevent the event from bubbling up to the document
    event.stopPropagation();
    document.getElementById("datePicker").classList.toggle("hidden");
  });

  // Close the datePicker when clicking anywhere outside of it
  document.addEventListener("click", (event) => {
    const datePicker = document.getElementById("datePicker");
    const dateButton = document.getElementById("dateButton");

    // Check if the click is outside the dateButton and datePicker
    if (
      !dateButton.contains(event.target) &&
      !datePicker.contains(event.target)
    ) {
      datePicker.classList.add("hidden");
    }
  });

  renderPredefinedRanges();

  // Apply date range
  document.getElementById("applyDateButton").addEventListener("click", () => {
    fetchTransaction();
  });

  fetchTransaction();
});

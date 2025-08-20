document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;
  let currentLimit = 10;
  let selectedSpots = []; // ['1','2', ...]
  let spotsCache = []; // API dan kelgan to‘liq spotlar

  let dateRange = getLastMonthRange(); // Default date range: o'tgan oyning shu kuni

  // fetch("/token")
  //   .then((data) => data.json())
  //   .then((d) => {
  //     if (d == false) {
  //       window.location.href = `https://joinposter.com/api/auth?application_id=3771&redirect_uri=http://localhost:3000/auth&response_type=code`;
  //     }
  //   });

  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getSpots() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    const token = urlParams.get("access_token");

    fetch("/getSpots?access_token=" + token)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch spots");
        return response.json();
      })
      .then((data) => {
        spotsCache = data || [];
        renderSpotList();
        updateSpotChips();
      })
      .catch((error) => console.error("Error fetching spots:", error));
  }

  getSpots();
  // Dinamik sanalar oralig'ini hisoblashformatDate
  function getLastMonthRange() {
    const today = new Date();
    const lastMonthDate = new Date(today);
    lastMonthDate.setMonth(today.getMonth() - 1);

    const formatDate = (date) => formatDateLocal(date);
    return [formatDate(lastMonthDate), formatDate(today)];
  }

  function getDynamicRanges() {
    const today = new Date();

    return [
      {
        label: "Сегодня",
        range: [formatDateLocal(today), formatDateLocal(today)],
      },
      {
        label: "Вчера",
        range: [
          formatDateLocal(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          ),
          formatDateLocal(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          ),
        ],
      },
      {
        label: "Последние 7 дней",
        range: [
          formatDateLocal(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
          ),
          formatDateLocal(today),
        ],
      },
      {
        label: "Последние 30 дней",
        range: [
          formatDateLocal(
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - 30
            )
          ),
          formatDateLocal(today),
        ],
      },
    ];
  }

  function renderSpotList(filterText = "") {
    const list = document.getElementById("spotList");
    list.innerHTML = "";
    const filtered = spotsCache.filter((s) =>
      (s.name || "").toLowerCase().includes(filterText.toLowerCase())
    );

    filtered.forEach((spot) => {
      const id = String(spot.spot_id);
      const label = document.createElement("label");
      label.className = "flex items-center gap-2 p-1 hover:bg-gray-50 rounded";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = id;
      input.checked = selectedSpots.includes(id);
      input.addEventListener("change", (e) => {
        if (e.target.checked) {
          if (!selectedSpots.includes(id)) selectedSpots.push(id);
        } else {
          selectedSpots = selectedSpots.filter((x) => x !== id);
        }
        updateSpotChips(false);
        // SelectAll holatini yangilaymiz
        document.getElementById("spotSelectAll").checked =
          selectedSpots.length === spotsCache.length && spotsCache.length > 0;
      });

      const span = document.createElement("span");
      span.textContent = spot.name;

      label.appendChild(input);
      label.appendChild(span);
      list.appendChild(label);
    });

    document.getElementById("spotSelectAll").checked =
      selectedSpots.length === spotsCache.length && spotsCache.length > 0;

    updateSpotCount();
  }

  function updateSpotCount() {
    document.getElementById("spotCount").textContent = selectedSpots.length
      ? selectedSpots.length
      : "Все";
  }

  function updateSpotChips(reRenderList = true) {
    const chips = document.getElementById("spotChips");
    chips.innerHTML = "";

    if (selectedSpots.length === 0) {
      const span = document.createElement("span");
      span.className = "text-gray-500 text-sm";
      span.textContent = "Все точки";
      chips.appendChild(span);
    } else {
      selectedSpots.forEach((id) => {
        const s = spotsCache.find((x) => String(x.spot_id) === id);
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.innerHTML = `${
          s ? s.name : id
        } <button class="chip-remove" aria-label="remove">×</button>`;
        chip.querySelector("button").addEventListener("click", () => {
          selectedSpots = selectedSpots.filter((x) => x !== id);
          if (reRenderList) {
            const q = document.getElementById("spotSearch").value || "";
            renderSpotList(q);
          }
          updateSpotChips();
        });
        chips.appendChild(chip);
      });
    }

    updateSpotCount();
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
        fetchTransaction(selectedSpots); // <— tanlangan spotlar bilan
      });
      container.appendChild(button);
    });
  }

  // Fetch and display transactions
  function fetchTransaction(spotIds = []) {
    const [startDate, endDate] = dateRange;
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    const token = urlParams.get("access_token");

    if (!startDate || !endDate) {
      console.error("Invalid date range selected");
      return;
    }

    fetch(
      `/api/getTransaction?access_token=${token}&date_from=${startDate}&date_to=${endDate}&page=${currentPage}&limit=${currentLimit}`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch transactions");
        return response.json();
      })
      .then((res) => {
        if (Array.isArray(spotIds) && spotIds.length > 0) {
          const ids = spotIds.map(String);
          res.data = res.data.filter((item) =>
            ids.includes(String(item.spot_id))
          );
        }
        updateTable(res.data);
        document.getElementById(
          "transaction-count"
        ).innerText = `(${res.data.length})`;
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
        bonus: parseFloat(extras.bonus) || 0,
      };
    });

    const tbody = document.querySelector("#transactionTable tbody");
    tbody.innerHTML = "";

    parsedData.forEach((item, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border border-gray-300 p-2 text-center">${
          transactions[idx].transaction_id
        }</td>
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
          item.bonus
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
        acc.bonus += item.bonus;
        return acc;
      },
      { cash: 0, card: 0, click: 0, uzum: 0, payme: 0, bonus: 0 }
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
        totals.bonus
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

  // Dropdownni ochish/yopish
  document.getElementById("spotButton").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("spotDropdown").classList.toggle("hidden");
  });

  // Tashqariga bosilganda yopish
  document.addEventListener("click", (ev) => {
    const dd = document.getElementById("spotDropdown");
    const btn = document.getElementById("spotButton");
    if (!btn.contains(ev.target) && !dd.contains(ev.target)) {
      dd.classList.add("hidden");
    }
  });

  // Qidiruv
  document.getElementById("spotSearch").addEventListener("input", (e) => {
    renderSpotList(e.target.value);
  });

  // Select All
  document.getElementById("spotSelectAll").addEventListener("change", (e) => {
    if (e.target.checked) {
      selectedSpots = spotsCache.map((s) => String(s.spot_id));
    } else {
      selectedSpots = [];
    }
    const q = document.getElementById("spotSearch").value || "";
    renderSpotList(q);
    updateSpotChips();
  });

  // Reset
  document.getElementById("clearSpots").addEventListener("click", () => {
    selectedSpots = [];
    renderSpotList(document.getElementById("spotSearch").value || "");
    updateSpotChips();
    fetchTransaction(); // hammasi
  });

  // Qo‘llash
  document.getElementById("applySpots").addEventListener("click", () => {
    fetchTransaction(selectedSpots);
    document.getElementById("spotDropdown").classList.add("hidden");
  });

  renderPredefinedRanges();

  // Apply date range
  document.getElementById("applyDateButton").addEventListener("click", () => {
    fetchTransaction(selectedSpots);
  });

  fetchTransaction();
});

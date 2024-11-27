import { formatCurrency } from "@/utils";

function Table({ transaction }) {
  const parsedData = transaction.data?.map((item) => {
    const extras = JSON.parse(item.extras.combo_box);
    return {
      ...extras,
    };
  });

  function calculateSum(tr) {
    return tr?.reduce(
      (acc, t) => {
        acc.cash += parseFloat(t.cash || 0); // Add cash
        acc.card += parseFloat(t.card || 0); // Add card
        acc.click += parseFloat(t.click || 0); // Add click
        acc.uzum += parseFloat(t.uzum || 0); // Add click
        acc.payme += parseFloat(t.payme || 0); // Add click
        acc.loan += parseFloat(t.loan || 0); // Add click
        return acc;
      },
      { cash: 0, card: 0, click: 0, uzum: 0, payme: 0, loan: 0 } // Initial accumulator
    );
  }

  const total = calculateSum(parsedData);

  return (
    <div className=" bg-gray-50 p-6 ">
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
          {parsedData?.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(idx + 1) || "0"}
              </td>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(item.cash) || "0"} СУМ
              </td>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(item.card) || "0"} СУМ
              </td>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(item.click) || "0"} СУМ
              </td>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(item.payme) || "0"} СУМ
              </td>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(item.uzum) || "0"} СУМ
              </td>
              <td className="border border-gray-300 p-2 text-center lowercase">
                {formatCurrency(item.loan) || "0"} СУМ
              </td>
            </tr>
          ))}

          <tr>
            <td className="border border-gray-300 p-2 text-center font-semibold">Итого</td>

            {total &&
              Object.entries(total).map(([key, value], idx) => (
                <td
                  key={idx}
                  className="border border-gray-300 p-2 text-center lowercase"
                >
                  {formatCurrency(value) || "0"} СУМ
                </td>
              ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Table;

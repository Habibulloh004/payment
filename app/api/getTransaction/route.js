export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token");
  const dateFrom = request.nextUrl.searchParams.get("date_from");
  const dateTo = request.nextUrl.searchParams.get("date_to");
  try {
    // const result = await fetch(
    //   `https://joinposter.com/api/dash.getTransactions?token=${token}&dateFrom=${
    //     dateFrom.includes("-") ? dateFrom.replace(/-/g, "") : dateFrom
    //   }&dateTo=${dateTo.includes("-") ? dateTo.replace(/-/g, "") : dateTo}`
    // );
    const result = await fetch(
      `https://joinposter.com/api/transactions.getTransactions?token=${token}&date_from=${dateFrom}&date_to=${dateTo}`
    );

    if (!result.ok) {
      throw new Error(`Failed to fetch: ${result.statusText}`);
    }

    const data = await result.json(); // Parse the JSON data from the response

    return new Response(JSON.stringify(data.response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Server error:", e);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

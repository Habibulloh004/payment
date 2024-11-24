export const formatCurrency = (amount) => {
  // Split into integer and fractional parts
  const [integerPart, fractionalPart] = amount.toString().split(".");

  // Add commas to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine integer and fractional parts
  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

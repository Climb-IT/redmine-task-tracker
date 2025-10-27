export function arrayToCSV(data, headers) {
  const csvHeaders = headers.map((h) => parseString(h.name)).join(",");
  const csvRows = data.map((row) =>
    headers.map((h) => parseString(row[h.key])).join(",")
  );
  return [csvHeaders, ...csvRows].join("\n");
}

export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link); // Important for Firefox
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseString(value) {
  if (value == null) return "";

  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma/newline/quote
  return stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"') ||
    /\s/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

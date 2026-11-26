const DEPARTMENTS = ["Police", "Ambulance", "Fire Brigade"];

function normalizeDepartment(value) {
  const input = String(value || "").trim().toLowerCase();
  if (input.includes("police") || input.includes("crime")) return "Police";
  if (input.includes("ambulance") || input.includes("medical") ||
      input.includes("hospital")) return "Ambulance";
  if (input.includes("fire") || input.includes("rescue")) return "Fire Brigade";
  return null;
}

function normalizeDepartments(services) {
  return [...new Set((Array.isArray(services) ? services : [])
    .map(normalizeDepartment).filter(Boolean))];
}

function departmentsForIncident(type, aiDepartment) {
  const input = String(type || "").toLowerCase();
  const departments = new Set();
  const classified = normalizeDepartment(aiDepartment);
  if (classified) departments.add(classified);
  if (/accident|collision|injur|medical|health|ambulance/.test(input)) departments.add("Ambulance");
  if (/accident|collision|crime|assault|theft|police/.test(input)) departments.add("Police");
  if (/fire|smoke|explosion|flood|rescue/.test(input)) departments.add("Fire Brigade");
  if (!departments.size) departments.add("Police");
  return [...departments];
}

module.exports = {
  DEPARTMENTS, normalizeDepartment, normalizeDepartments, departmentsForIncident,
};

import React from "react";

type Employee = {
  _id: string;
  firstname: string;
  lastname: string;
  roleId?: string;
};

type CommissionEntry = {
  totalCommission: number;
  employee: Employee;
  date: string; // ISO format
};

type Props = {
  data: CommissionEntry[];
};

const TherapistCommissionTable: React.FC<Props> = ({ data }) => {
  const employeeMap: Record<
    string,
    {
      name: string;
      daily: Record<string, number>;
      total: number;
    }
  > = {};

  data.forEach(({ employee, totalCommission, date }) => {
    const empId = employee._id;
    const empName = `${employee.firstname.trim()} ${employee.lastname.trim()}`;
    if (!employeeMap[empId]) {
      employeeMap[empId] = {
        name: empName,
        daily: {},
        total: 0,
      };
    }
    employeeMap[empId].daily[date] = totalCommission;
    employeeMap[empId].total += totalCommission;
  });

  const allDates = Array.from(new Set(data.map((item) => item.date))).sort();
  const rows = Object.entries(employeeMap);

  return (
    <div className="overflow-x-auto rounded shadow-sm border border-gray-200 bg-gradient-to-b from-white via-blue-50 to-purple-50" style={{ height: "calc(100vh - 150px)" }}>
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gradient-to-r from-indigo-200 to-purple-200 text-gray-700 text-xs uppercase sticky top-0 shadow z-10">
          <tr>
            <th className="border px-3 py-3 text-center font-semibold">#</th>
            <th className="border px-4 py-3 text-left font-semibold">Therapist</th>
            {allDates.map((date) => (
              <th key={date} className="border px-2 py-3 text-center font-semibold">
                {new Date(date).getDate()}
              </th>
            ))}
            <th className="border px-4 py-3 text-center font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([empId, emp], index) => (
            <tr
              key={empId}
              className={
                index % 2 === 0
                  ? "bg-white hover:bg-blue-50 transition"
                  : "bg-gray-50 hover:bg-indigo-50 transition"
              }
            >
              <td className="border px-3 py-2 text-center text-gray-600 font-medium">
                {index + 1}
              </td>
              <td className="border px-4 py-2 font-bold text-indigo-800 whitespace-nowrap">
                {emp.name}
              </td>
              {allDates.map((date) => (
                <td
                  key={date}
                  className={`border px-2 py-1 text-center text-sm font-medium ${
                    emp.daily[date] ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {emp.daily[date] ?? "-"}
                </td>
              ))}
              <td className="border px-4 py-2 text-center font-bold text-purple-800 bg-purple-100">
                ฿ {emp.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TherapistCommissionTable;
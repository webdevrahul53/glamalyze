/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from "@/core/common/data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];
const pieData = [
  { name: "Chrome", value: 65 },
  { name: "Firefox", value: 15 },
  { name: "Safari", value: 10 },
  { name: "Edge", value: 10 },
];

const barData = [
  { name: "Jan", sales: 1890 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 2000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 4000 },
];


const CardLayout = ({title, value}: {title: string, value: string}) => (
  <section className="w-1/6 p-6 bg-white rounded border-2">
    <h1 className="text-2xl">{value}</h1>
    <h3 className="text-md mt-2 text-gray-500">{title}</h3>
  </section>
)


const BarChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PieChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};


export default function Home() {
  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      <h1 className="text-4xl">Dashboard</h1>
      <section className="flex gap-4 my-6">
        <CardLayout title="Appointment" value="20"></CardLayout>
        <CardLayout title="Total Revenue" value="$3,534.00"></CardLayout>
        <CardLayout title="Sales Commission" value="$3,534.00"></CardLayout>
        <CardLayout title="New Customers" value="45"></CardLayout>
        <CardLayout title="Orders" value="0"></CardLayout>
        <CardLayout title="Product Sales" value="$0.00"></CardLayout>
      </section>
      <section className="flex">
        <div className="w-2/3">
          <BarChartComponent />
        </div>
        <div className="w-1/3">
        <PieChartComponent />
        </div>
      </section>
      <DataGrid />
    </div>
  );
}

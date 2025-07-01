/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const CardLayout = ({title, value}: {title: string, value: string}) => (
  <section className="w-1/6 p-6 bg-white rounded border-2">
    <h1 className="text-2xl">{value}</h1>
    <h3 className="text-md mt-2 text-gray-500">{title}</h3>
  </section>
)


const BarChartComponent = (props:any) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={props.data || []}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PieChartComponent = (props:any) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={props?.data || []}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {props?.data?.map((entry:any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};


export default function Finance() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<Date | null>(new Date("2025-06-30")); // Default to current month

  React.useEffect(() => { 
    getBranchList()
  }, [])

  React.useEffect(() => {
    if ((startDate && endDate) || selectedBranch) {
      getDashboardData(selectedBranch, startDate, endDate);
    }
  }, [startDate, endDate, selectedBranch]);
  

  const getDashboardData = async (branchId: any = null, startDate:any, endDate: any) => {
    try {
      setLoading(true)
      const query = branchId 
        ? `?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}` : `?startDate=${startDate}&endDate=${endDate}`;
      const services = await fetch(`${DASHBOARD_API_URL}/finance${query}`, {
        method: "POST",
        body: JSON.stringify({ branchId: selectedBranch, startDate, endDate }),
      });
      const parsed = await services.json();
      console.log(parsed);
      
      setDashboardData(parsed.data);
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.error);
    }
  };

  
    
  const getBranchList = async () => {
    try {
      const branches = await fetch(BRANCH_API_URL)
      const parsed = await branches.json();
      setBranchList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }
  


  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      {/* <select name="" id="" className="border-2 border-gray-300 rounded p-2 mb-4" onChange={(e:any) => getDashboardData(e.target.value)}>
        <option value="">Select Branch</option>
        {branchList.map((item:any) => <option key={item._id} value={item._id}>{item.branchname}</option>)}
      </select> */}
      <section className="flex gap-4 mb-2">
        <Select label="Select Branch" placeholder="Choose a branch" variant="faded" className="max-w-xs mb-4" 
        onChange={(e) => setSelectedBranch(e.target.value)} >
          {branchList.map((item:any) => (
            <SelectItem key={item._id} value={item._id}>
              {item.branchname}
            </SelectItem>
          ))}
        </Select>
        
        <DateRangePicker variant="faded" className="w-60" label="Date Range" onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }} />
      </section>

      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      {/* <h1 className="text-4xl">Dashboard</h1> */}
      <section className="flex gap-4 mt-2">
        <CardLayout title="Net Sales" value={`฿ ${dashboardData?.netSales || 0}`}></CardLayout>
        <CardLayout title="Gross Sales" value={`฿ ${dashboardData?.grossSales || 0}`}></CardLayout>
        <CardLayout title="Transactions" value={`${dashboardData?.transactions || 0}`}></CardLayout>
        <CardLayout title="Returns & Refunds" value={"0"}></CardLayout>
        {/* <CardLayout title="Total Customers" value={dashboardData?.customers || 0}></CardLayout>
        <CardLayout title="Returning Customers" value={dashboardData?.returningCustomerCount || 0}></CardLayout> */}
        {/* <CardLayout title="Returns & Refunds" value={`฿ ${dashboardData?.revenue || 0}`}></CardLayout> */}
      </section>

      <section className="grid grid-cols-2 gap-3 my-6 w-4/5">
        <div className="border-2 border-gray-500 p-2">
          <h1 className="text-2xl text-primary mb-4">Customers</h1>
          <h3>Total Customers :  <strong> {dashboardData?.customers || 0} </strong> </h3>
          <h3>Returning Customers :  <strong> {dashboardData?.returningCustomerCount || 0} </strong> </h3>
          <h3>Avg Spent Per Visit :  <strong>  </strong> </h3>
        </div>
        
        <div className="border-2 border-gray-500 p-2">
          <h1 className="text-2xl text-primary mb-4">Payment Methods</h1>
          {dashboardData?.paymentMethods?.map((item:any) => (
            <h3 key={item.name}>{item.name} : <strong> {item.value} </strong> </h3>
          ))}
        </div>

      </section>


      <br /><br /><br />
      <h2 className="text-2xl text-center">Items by Gross Sales Graph</h2>
      <BarChartComponent data={dashboardData?.revenueBarData || []} />
      <section className="flex">
        <div className="w-2/3">
        </div>
        <div className="w-1/3">
          {/* <PieChartComponent data={dashboardData?.paymentMethods || []} />
          <h2 className="text-2xl text-center">Payment Methods</h2> */}
        </div>
      </section>
      {/* <DataGrid /> */}
    </div>
  );
}

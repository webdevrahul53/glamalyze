/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import moment from "moment";
import React from "react";
import { toast } from "react-toastify";

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const CardLayout = ({title, value}: {title: string, value: string}) => (
  <section className="w-1/6 p-6 bg-white rounded border-2">
    <h1 className="text-2xl">{value}</h1>
    <h3 className="text-md mt-2 text-gray-500">{title}</h3>
  </section>
)



export default function Finance() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<any>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<any>(new Date("2025-06-30")); // Default to current month

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
      const stDate = startDate ? moment(startDate).format("YYYY-MM-DD") : null;
      const enDate = endDate ? moment(endDate).format("YYYY-MM-DD") : null;
      let query = "";
      if (branchId) query += `?branchId=${branchId}`;
      if (startDate && endDate) query += `${query ? "&" : "?"}startDate=${stDate}&endDate=${enDate}`;
      const services = await fetch(`${DASHBOARD_API_URL}/transactions${query}`);

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

      <section className="p-2 my-5">
        <div className="text-3xl">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</div>
        <p className="text-gray-500">All Day (00:00 - 00:00)</p>
      </section>

      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      {/* <h1 className="text-4xl">Dashboard</h1> */}
      <section className="flex gap-4 mt-2">
        <CardLayout title="Transactions" value={`${dashboardData?.transactions || 0}`}></CardLayout>
        <CardLayout title="Gross Sales" value={`฿ ${dashboardData?.grossSales || 0}`}></CardLayout>
        <CardLayout title="Net Sales" value={`฿ ${dashboardData?.netSales || 0}`}></CardLayout>
      </section>


    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DownloadIcon, MoneyBillIcon } from "@/core/utilities/svgIcons";
import { Button, DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import moment from "moment";
import React from "react";
import { toast } from "react-toastify";

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const CardLayout = ({title, value}: {title: string, value: string}) => (
  <section className="w-1/3 p-6">
    <h1 className="text-2xl font-bold">{value}</h1>
    <h3 className="text-sm mt-2 text-gray-600">{title.toUpperCase()}</h3>
  </section>
)



export default function Finance() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);

  const [startDate, setStartDate] = React.useState<any>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<any>(new Date("2025-06-30")); // Default to current month


  React.useEffect(() => { 
    getBranchList()
  }, [])

  React.useEffect(() => {
    getDashboardData();
  }, [startDate, endDate, paymentMethod, status, selectedBranch]);
  

  const getDashboardData = async () => {
    try {
      setLoading(true)
      const stDate = startDate ? moment(startDate).format("YYYY-MM-DD") : null;
      const enDate = endDate ? moment(endDate).format("YYYY-MM-DD") : null;
      let query = "";
      if (selectedBranch) query += `?branchId=${selectedBranch}`;
      if (startDate && endDate) query += `${query ? "&" : "?"}startDate=${stDate}&endDate=${enDate}`;
      if (paymentMethod) query += `${query ? "&" : "?"}paymentMethod=${paymentMethod}`;
      if (status) query += `${query ? "&" : "?"}status=${status}`;

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


  const exportToExcel = async () => {
    const data = dashboardData?.transactionsList || [];
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Transaction ID", "Service", "Duration", "Branch", "Start Time", "Price"];
    const rows = data.map((transaction: any) => [
      transaction._id,
      transaction.service.name,
      transaction.duration,
      transaction.branch.branchname,
      transaction.startTime,
      transaction.price.toFixed(2)
    ]); 
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${new Date().toISOString()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported to Excel successfully!");
    
  }
  


  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      
      <section className="flex items-start gap-4 mb-2">
        <DateRangePicker variant="faded" className="w-60" label="Date Range" onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }} />

        
        <Select label={`${!paymentMethod ? "All " : ""}Payment Method`} variant="faded" className="w-60 mb-4" onChange={(e) => setPaymentMethod(e.target.value)} >
          <SelectItem key="Cash">Cash</SelectItem>
          <SelectItem key="Card">Card</SelectItem>
          <SelectItem key="Transfer">Transfer</SelectItem>
        </Select>

        <Select label="Status" variant="faded" className="w-60 mb-4" onChange={(e) => setStatus(e.target.value)} >
          <SelectItem key="Pending">Pending</SelectItem>
          <SelectItem key="CheckedIn">CheckedIn</SelectItem>
          <SelectItem key="CheckedOut">CheckedOut</SelectItem>
          <SelectItem key="Completed">Completed</SelectItem>
        </Select>
        
        
        <Select label={`${!selectedBranch ? "All ": ""}Locations`} placeholder="Choose a branch" variant="faded" className="w-60 mb-4" 
        onChange={(e) => setSelectedBranch(e.target.value)} >
          {branchList?.map((item:any) => (
            <SelectItem key={item._id} value={item._id}>
              {item.branchname}
            </SelectItem>
          ))}
        </Select>

        <Button className="pe-5 mt-2" onPress={exportToExcel}><DownloadIcon width={20} height={15} /> Export</Button>

      </section>

      <section className="p-2 my-5">
        <div className="text-3xl font-bold">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</div>
        <p className="text-gray-500">All Day (00:00 - 00:00)</p>
      </section>

      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      {/* <h1 className="text-4xl">Dashboard</h1> */}
      <section className="flex justify-between gap-4 mt-2">
        <CardLayout title="Complete Transactions" value={`${dashboardData?.transactions || 0}`}></CardLayout>
        <CardLayout title="Total Collected" value={`฿ ${dashboardData?.grossSales.toFixed(2) || 0}`}></CardLayout>
        <CardLayout title="Net Sales" value={`฿ ${dashboardData?.netSales.toFixed(2) || 0}`}></CardLayout>
      </section>


      <section className="mt-4">
        {dashboardData?.transactionsList?.map((transaction: any) => (
          <div key={transaction._id} className="flex items-center justify-between p-2 border-t-2">
            <div className="flex items-center gap-6">
              <MoneyBillIcon width={50} color="lightgray" height={30} />
              <div> {transaction.startTime} </div>
              <div> <strong>{transaction.service.name.toUpperCase()} ( {transaction.duration} min ) </strong>  <small className="text-gray-400 font-bold ms-2">{transaction.branch.branchname}</small> </div>

            </div>
            <div>฿ {transaction.price.toFixed(2)}</div>
          </div>
        ))}
      </section>


    </div>
  );
}

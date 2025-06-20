/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const LineChartComponent = (props: any) => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={props.data || []}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="sales" fill="#cdd2f3" dot={true} stroke="#8884d8" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
};


const BarChartComponent = (props:any) => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={props.data || []}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function SalesSummary() {

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
    if (startDate && endDate) {
      getDashboardData(selectedBranch, startDate, endDate);
    }
  }, [selectedBranch, startDate, endDate]);
  

  const getDashboardData = async (branchId: any = null, startDate:any, endDate: any) => {
    try {
      setLoading(true)
      const query = branchId 
        ? `?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}` : `?startDate=${startDate}&endDate=${endDate}`;
      const services = await fetch(`${DASHBOARD_API_URL}/sales-summary${query}`);
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
      <section className="flex gap-4 mb-6">
        <Select label="Select Branch" placeholder="Choose a branch" variant="faded" className="max-w-xs mb-4" 
        onChange={(e) => setSelectedBranch(e.target.value)} >
          {branchList.map((item:any) => (
            <SelectItem key={item._id} value={item._id}>
              {item.branchname}
            </SelectItem>
          ))}
        </Select>
        
        <DateRangePicker variant="faded" className="w-60" label="Date Range"
            onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }}
          />
      </section>
      {loading ? <Progress isIndeterminate aria-label="Loading..." size="sm" /> : <>
        <h2 className="text-xl text-center">Gross Sale By Date</h2>
        <LineChartComponent data={dashboardData?.revenueByDate || []} />

        <section className="flex my-5">
          <div className="w-1/3">
            <h2 className="text-xl text-center">Gross Sale By Week</h2>
            <BarChartComponent data={dashboardData?.revenueByWeek || []} />
          </div>
          <div className="w-2/3">
            <h2 className="text-xl text-center">Gross Sale By Hour</h2>
            <LineChartComponent data={dashboardData?.revenueByHour || []} />
          </div>
        </section>

        <section className="">
          <div className="flex justify-between items-center px-2 border-b-2">
            <strong className="text-2xl">Gross Sales</strong>
            <span className="text-2xl"> ฿ {dashboardData?.totalSummary[0].grossSales.toFixed(2)} </span>
          </div>
          <div className="flex justify-between items-center px-2 border-b-2">
            <strong className="text-2xl">Net Sales</strong>
            <span className="text-2xl"> ฿ {dashboardData?.totalSummary[0].netSales.toFixed(2)} </span>
          </div>
          <div className="flex justify-between items-center px-2 border-b-2">
            <strong className="text-2xl">Coupon Discount</strong>
            <span className="text-2xl"> - ฿ {dashboardData?.totalSummary[0].discount.toFixed(2)} </span>
          </div>
          <div className="flex justify-between items-center px-2 border-b-2">
            <strong className="text-2xl">Voucher Discount</strong>
            <span className="text-2xl"> - ฿ {dashboardData?.totalSummary[0].voucherDiscount.toFixed(2)} </span>
          </div>
          <div className="flex justify-between items-center px-2 border-b-2">
            <strong className="text-2xl">Taxes</strong>
            <span className="text-2xl"> - ฿ 0.00 </span>
          </div>
          <div className="flex justify-between items-center px-2 border-b-2">
            <strong className="text-2xl">Total Sales</strong>
            <span className="text-2xl"> ฿ {dashboardData?.totalSummary[0].grossSales.toFixed(2)} </span>
          </div>
        </section>
        {/* <DataGrid /> */}
      </>}
      
    </div>
  );
}

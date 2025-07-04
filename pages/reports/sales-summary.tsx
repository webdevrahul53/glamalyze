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
        <YAxis tickFormatter={(value) => `฿ ${value}`} />
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
        <YAxis tickFormatter={(value) => `฿ ${value}`} />
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
  const [startDate, setStartDate] = React.useState<any>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<any>(new Date("2025-06-30")); // Default to current month

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
        <DateRangePicker variant="faded" className="w-60" label="Date Range"
            onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }}
          />
        <Select label={`${!selectedBranch ? "All ": ""}Locations`} placeholder="Choose a branch" variant="faded" className="max-w-xs mb-4" 
        onChange={(e) => setSelectedBranch(e.target.value)} >
          {branchList.map((item:any) => (
            <SelectItem key={item._id} value={item._id}>
              {item.branchname}
            </SelectItem>
          ))}
        </Select>
      </section>

      <section className="p-2 my-5">
        <div className="text-3xl">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</div>
        <p className="text-gray-500">All Day (00:00 - 00:00)</p>
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
          <div className="text-lg font-bold p-2 border-b-2 border-gray-400">Sales</div>

          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <strong className="text-lg">Gross Sales</strong>
            <span className="text-2xl"> ฿ {dashboardData?.totalSummary[0].grossSales.toFixed(2)} </span>
          </div>
          <ul className="ms-4">
            <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
              <span className="text-lg text-gray-400">Items</span>
              <span className="text-2xl text-gray-400"> ฿ {dashboardData?.totalSummary[0].grossSales.toFixed(2)} </span>
            </div>
            <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
              <span className="text-lg text-gray-400">Service Charge</span>
              <span className="text-2xl text-gray-400"> ฿ 0.00 </span>
            </div>
          </ul>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <span className="text-lg">Returns</span>
            <span className="text-2xl"> ฿ 0.00 </span>
          </div>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <span className="text-lg">Discounts & Coupons</span>
            <span className="text-2xl"> - ฿ {(dashboardData?.totalSummary[0].discount + dashboardData?.totalSummary[0].voucherDiscount).toFixed(2)} </span>
          </div>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <strong className="text-lg">Net Sales</strong>
            <span className="text-2xl"> ฿ {dashboardData?.totalSummary[0].netSales.toFixed(2)} </span>
          </div>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <span className="text-lg">Taxes</span>
            <span className="text-2xl"> - ฿ 0.00 </span>
          </div>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <strong className="text-lg">Total Sales</strong>
            <span className="text-2xl"> ฿ {dashboardData?.totalSummary[0].grossSales.toFixed(2)} </span>
          </div>
        </section>


        
        <section className="mt-6">
          <div className="text-lg font-bold p-2 border-b-2 border-gray-400">Payment</div>

          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <strong className="text-lg">Total Collected</strong>
            <span className="text-2xl"> ฿ {(dashboardData?.paymentMethods.cash + dashboardData?.paymentMethods.card + dashboardData?.paymentMethods.transfer).toFixed(2)} </span>
          </div>
          <ul className="ms-4">
            <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
              <span className="text-lg text-gray-400">Cash</span>
              <span className="text-2xl text-gray-400"> ฿ {dashboardData?.paymentMethods.cash.toFixed(2)} </span>
            </div>
            <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
              <span className="text-lg text-gray-400">Others</span>
              <span className="text-2xl text-gray-400"> ฿ {(dashboardData?.paymentMethods.card + dashboardData?.paymentMethods.transfer).toFixed(2)} </span>
            </div>
          </ul>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <span className="text-lg">Fees</span>
            <span className="text-2xl">฿ 0.00 </span>
          </div>
          <div className="flex justify-between items-center p-2 border-b-2 border-gray-200">
            <strong className="text-lg">Net Total</strong>
            <span className="text-2xl"> ฿ {(dashboardData?.paymentMethods.cash + dashboardData?.paymentMethods.card + dashboardData?.paymentMethods.transfer).toFixed(2)} </span>
          </div>
        </section>
        {/* <DataGrid /> */}
      </>}
      
    </div>
  );
}

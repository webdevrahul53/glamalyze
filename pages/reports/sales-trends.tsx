/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import moment from "moment";
import React from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

// Utility function to merge two ranges by 'name'
const mergeData = (range1: any[], range2: any[]) => {
  const map: Record<string, any> = {};

  range1?.forEach(({ name, sales }) => {
    map[name] = { name, sales1: sales, sales2: 0 };
  });

  range2?.forEach(({ name, sales }) => {
    if (map[name]) {
      map[name].sales2 = sales;
    } else {
      map[name] = { name, sales1: 0, sales2: sales };
    }
  });

  // Convert to array and sort by name (optional)
  return Object.values(map).sort((a, b) => parseInt(a.name) - parseInt(b.name));
};


const HorizontalBarChartComponent = (props:any) => {
  const mergedData = mergeData(props.data.range1, props.data.range2);
  const formatDate = (dateStr: string) =>
    moment(dateStr, moment.ISO_8601, true).utcOffset('+05:30').format("D MMMM");
  
  const name = props.startDate && props.endDate ? `${formatDate(props.startDate)} - ${formatDate(props.endDate)}` : "Current Year Sales";
  const name2 = props.startDate2 && props.endDate2 ? `${formatDate(props.startDate2)} - ${formatDate(props.endDate2)}` : "Previous Year Sales";

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={mergedData}
        margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
      >
        <XAxis dataKey="name" /> {/* Categories at bottom */}
        <YAxis /> {/* Net sales on left */}
        <Tooltip />
        <Legend />
        <Bar dataKey="sales1" fill="#8884d8" name={name} />
        <Bar dataKey="sales2" fill="#82ca9d" name={name2} />
      </BarChart>
    </ResponsiveContainer>
  );
};


export default function SalesTrends() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<Date | null>(new Date("2025-04-30")); // Default to current month
  const [startDate2, setStartDate2] = React.useState<Date | null>(new Date("2025-05-1")); // Default to current month)); 
  const [endDate2, setEndDate2] = React.useState<Date | null>(new Date("2025-05-31")); // Default to current month);


  React.useEffect(() => {
    getDashboardData(selectedBranch, startDate, endDate, startDate2, endDate2);
  }, [selectedBranch, startDate, endDate, startDate2, endDate2]);


  React.useEffect(() => { 
    getBranchList()
  }, [])
  

  const getDashboardData = async (branchId: any = null, startDate:any, endDate: any, startDate2:any, endDate2:any) => {
    try {
      setLoading(true)
      const query = branchId 
        ? `?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}&startDate2=${startDate2}&endDate2=${endDate2}` 
        : `?startDate=${startDate}&endDate=${endDate}&startDate2=${startDate2}&endDate2=${endDate2}`;
      const services = await fetch(`${DASHBOARD_API_URL}/sales-trends${query}`);
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

        <DateRangePicker variant="faded" className="w-60" label="Same Year"
          onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }}
        />
        <DateRangePicker variant="faded" className="w-60" label="Prev Year"
          onChange={(range:any) => { setStartDate2(range.start); setEndDate2(range.end); }}
        />

        <Select label="Select Branch" placeholder="Choose a branch" variant="faded" className="w-60 mb-4" 
        onChange={e => setSelectedBranch(e.target.value)} >
          {branchList.map((item:any) => (
            <SelectItem key={item._id} value={item._id}>
              {item.branchname}
            </SelectItem>
          ))}
        </Select>

      </section>

      <section>
        {loading ? <Progress isIndeterminate aria-label="Loading..." size="sm" /> : <>
          <h2 className="text-xl text-center">Net Sales By Date</h2>
          <HorizontalBarChartComponent data={dashboardData?.netSalesByDate || {}} startDate={startDate} endDate={endDate} startDate2={startDate2} endDate2={endDate2} />
          <h2 className="text-xl text-center">Gross Sales By Date</h2>
          <HorizontalBarChartComponent data={dashboardData?.grossSalesByDate || {}} startDate={startDate} endDate={endDate} startDate2={startDate2} endDate2={endDate2} />
          <h2 className="text-xl text-center">Gross Sales By Month</h2>
          <HorizontalBarChartComponent data={dashboardData?.grossSalesByMonth || {}} startDate={startDate} endDate={endDate} startDate2={startDate2} endDate2={endDate2} />
          
          
          {/* <DataGrid /> */}
        </>}
      </section>

      
    </div>
  );
}

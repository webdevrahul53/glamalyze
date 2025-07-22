/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem, Tooltip } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";


const normalizeLineChartData = (rawData:any) => {
  const allServices = Array.from(new Set(rawData.map((d:any) => d.serviceName)));

  const groupedByDate: any = {};
  rawData.forEach(({ name, serviceName, sales }:any) => {
    if (!groupedByDate[name]) groupedByDate[name] = { name };
    groupedByDate[name][serviceName] = sales;
  });

  const finalData = Object.values(groupedByDate).map((entry:any) => {
    allServices.forEach((service:any) => {
      if (entry[service] === undefined) {
        entry[service] = 0;
      }
    });
    return entry;
  });

  return finalData;
};

const LineChartComponent = ({ rawData }: { rawData: any[] }) => {
  const chartData = normalizeLineChartData(rawData);
  
  const services = Object.keys(chartData[0]).filter(key => key !== "name");
  const colors = ["#e62818", "#ffcc02", "#49b302", "#88529f", "#4fa6d5"];

  return (
    <div>
      
      <section className="p-2 my-5">
        <div className="text-xl font-bold">Top 5 Items: Gross Sales</div>
        <div className="flex items-center flex-wrap gap-4">
          {services.map((item, idx) => <div key={idx} className="flex items-center"> 
            <small className="p-2 me-2 rounded-full" style={{backgroundColor: colors[idx % colors.length]}}></small> 
            <span className="text-lg"> {item} </span>
          </div>)}
        </div>
      </section>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="name" tickFormatter={(value) => `${value} ${value === "12" ? ":00":""}`} />
          <YAxis tickFormatter={(value) => `฿ ${value}`} />
          <Tooltip />
          {/* <Legend /> */}
          {services.map((service, idx) => (
            <Line
              key={service}
              type="linear"
              dataKey={service}
              stroke={colors[idx % colors.length]}
              strokeWidth={3}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


export default function ItemSales() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<any>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<any>(new Date("2025-06-30")); // Default to current month


  React.useEffect(() => {
    getDashboardData(selectedBranch, startDate, endDate);
  }, [selectedBranch, startDate, endDate]);


  React.useEffect(() => { 
    getBranchList()
  }, [])
  

  const getDashboardData = async (branchId: any = null, startDate:any, endDate: any) => {
    try {
      setLoading(true)
      
      let query = "";
      if (branchId) query += `?branchId=${branchId}`;
      if (startDate && endDate) query += `${query ? "&" : "?"}startDate=${startDate}&endDate=${endDate}`;
      
      const services = await fetch(`${DASHBOARD_API_URL}/item-sales${query}`);
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

        <DateRangePicker variant="faded" className="w-60" label="Date"
          onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }}
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

      <section className="p-2 my-5">
        <div className="text-3xl">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</div>
        <p className="text-gray-500">All Day (00:00 - 00:00)</p>
      </section>
      {loading ? <Progress isIndeterminate aria-label="Loading..." size="sm" /> : <></>}

      {/* {dashboardData?.revenueBarData?.length && <MultiLineChart data={dashboardData?.revenueBarData || []} />} */}
      {dashboardData?.revenueBarData?.length && <LineChartComponent  rawData={dashboardData?.revenueBarData || []} />}
      {dashboardData?.revenueBarData?.length && <ServiceTable data={dashboardData?.revenueBarData || []} />}
      
    </div>
  );
}


const ServiceTable = ({ data }:any) => {
  const rows = groupByService(data);

  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-sm font-medium border-b-2 border-gray-300">
            <th className="p-2 border-e-2">Item</th>
            <th className="p-2 border-e-2 text-end">Items Sold</th>
            <th className="p-2 border-e-2 text-end">Gross Sales (฿)</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((row) => (
            <tr
              key={row.category}
              className={row.category === "Total" ? "font-semibold" : ""}
            >
              <td className="p-2 border-e-2 border-b-2">{row.category}</td>
              <td className="p-2 border-e-2 border-b-2 text-right">{row.itemSold.toLocaleString()}</td>
              <td className="p-2 border-e-2 border-b-2 text-right">฿{row.sales.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


function groupByService(data:any) {
  const summary:any = {};

  data.forEach(({ serviceName, itemSold, sales }: any) => {
    if (!summary[serviceName]) {
      summary[serviceName] = { items: 0, sales: 0 };
    }
    summary[serviceName].items += itemSold;
    summary[serviceName].sales += sales;
  });

  // Convert to array
  const rows = Object.entries(summary).map(([category, values]: any) => ({
    category,
    itemSold: values.items,
    sales: values.sales,
  }));

  // Add total row
  const totalItems = rows.reduce((sum, row) => sum + row.itemSold, 0);
  const totalSales = rows.reduce((sum, row) => sum + row.sales, 0);
  rows.push({ category: "Total", itemSold: totalItems, sales: totalSales });

  return rows;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { ArrowDownIcon, ArrowUpIcon } from "@/core/utilities/svgIcons";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import moment from "moment";
import React from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

const DottedBar = (props: any) => {
  const { x, y, width, height } = props;
  return ( <rect x={x} y={y} width={width} height={height} fill={props.color2} stroke={props.color1} strokeDasharray="4 2" strokeWidth={2} /> );
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
        <YAxis tickFormatter={(value) => `฿ ${value}`} /> {/* Net sales on left */}
        <Tooltip />
        {/* <Legend /> */}
        <Bar dataKey="sales1" fill={props.color1} name={name} />
        <Bar dataKey="sales2" fill={props.color2} name={name2} shape={<DottedBar color1={props.color1} color2={props.color2} />} />
      </BarChart>
    </ResponsiveContainer>
  );
};


export default function SalesTrends() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<any>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<any>(new Date("2025-04-30")); // Default to current month
  const [startDate2, setStartDate2] = React.useState<any>(new Date("2025-05-1")); // Default to current month)); 
  const [endDate2, setEndDate2] = React.useState<any>(new Date("2025-05-31")); // Default to current month);


  const [netSalesByDateSales1, setNetSalesByDateSales1] = React.useState(0)
  const [netSalesByDateSales2, setNetSalesByDateSales2] = React.useState(0)
  
  const [grossSalesByDateSales1, setGrossSalesByDateSales1] = React.useState(0)
  const [grossSalesByDateSales2, setGrossSalesByDateSales2] = React.useState(0)


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
      setNetSalesByDateSales1(parsed?.data?.netSalesByDate?.range1?.map((e:any)=>e.sales).reduce((a:any,b:any) => +a+b, 0))
      setNetSalesByDateSales2(parsed?.data?.netSalesByDate?.range2?.map((e:any)=>e.sales).reduce((a:any,b:any) => +a+b, 0))

    
      setGrossSalesByDateSales1(parsed?.data?.grossSalesByDate?.range1?.map((e:any)=>e.sales).reduce((a:any,b:any) => +a+b, 0))
      setGrossSalesByDateSales2(parsed?.data?.grossSalesByDate?.range2?.map((e:any)=>e.sales).reduce((a:any,b:any) => +a+b, 0))

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
          <section className="px-6 mb-6">
            <h2 className="text-xl font-bold">Net Sales By Date</h2>
            <div className="flex items-center"> 
              <small className="p-2 me-2" style={{backgroundColor: "#13bf95"}}></small> 
              <span className="text-lg">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</span>
              <strong className="ms-2">฿ {netSalesByDateSales1}</strong>
            </div>
            <div className="flex items-center"> 
              <small className="p-2 me-2" style={{backgroundColor: "#ccfff2", border: "2px dashed #13bf95"}}></small> 
              <span className="text-lg">{`${new Date(startDate2).toDateString()} - ${new Date(endDate2).toDateString()}`}</span>
              <strong className="ms-2">฿ {netSalesByDateSales2}</strong>
            </div>
            <div className={`text-center text-${netSalesByDateSales2 >= netSalesByDateSales1 ? "green":"red"}-800`}> 
              <span className={`flex items-center justify-center gap-1 border-2 border-${netSalesByDateSales2 >= netSalesByDateSales1 ? "green":"red"}-800 rounded inline-flex py-1 p-2`}>
                {netSalesByDateSales2 >= netSalesByDateSales1 ? 
                <ArrowUpIcon width={30} height={20} color="darkgreen" />:
                <ArrowDownIcon width={30} height={20} color="darkred" />}
                <span> {(((netSalesByDateSales2 - netSalesByDateSales1) / netSalesByDateSales1) * 100).toFixed(2)} % </span>
              </span>
            </div>
          </section>
          <HorizontalBarChartComponent data={dashboardData?.netSalesByDate || {}} startDate={startDate} endDate={endDate} 
          startDate2={startDate2} endDate2={endDate2} color1={"#13bf95"} color2={"#ccfff2"} />
          <hr className="border-1 border-gray-500 mb-6" />


          <section className="px-6 mb-6">
            <h2 className="text-xl font-bold">Gross Sales By Date</h2>
            <div className="flex items-center"> 
              <small className="p-2 me-2" style={{backgroundColor: "#2793ff"}}></small> 
              <span className="text-lg">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</span>
              <strong className="ms-2">฿ {grossSalesByDateSales1}</strong>
            </div>
            <div className="flex items-center"> 
              <small className="p-2 me-2" style={{backgroundColor: "#cce1ff", border: "2px dashed #2793ff"}}></small> 
              <span className="text-lg">{`${new Date(startDate2).toDateString()} - ${new Date(endDate2).toDateString()}`}</span>
              <strong className="ms-2">฿ {grossSalesByDateSales2}</strong>
            </div>
            <div className={`text-center text-${grossSalesByDateSales2 >= grossSalesByDateSales1 ? "green":"red"}-800`}> 
              <span className={`flex items-center justify-center gap-1 border-2 border-${grossSalesByDateSales2 >= grossSalesByDateSales1 ? "green":"red"}-800 rounded inline-flex py-1 p-2`}>
                {grossSalesByDateSales2 >= grossSalesByDateSales1 ? 
                <ArrowUpIcon width={30} height={20} color="darkgreen" />:
                <ArrowDownIcon width={30} height={20} color="darkred" />}
                <span> {(((grossSalesByDateSales2 - grossSalesByDateSales1) / grossSalesByDateSales1) * 100).toFixed(2)} % </span>
              </span>
            </div>
          </section>
          <HorizontalBarChartComponent data={dashboardData?.grossSalesByDate || {}} startDate={startDate} endDate={endDate} 
          startDate2={startDate2} endDate2={endDate2} color1={"#2793ff"} color2={"#cce1ff"} />
          <hr className="border-1 border-gray-500 mb-6" />

          
          <section className="px-6 mb-6">
            <h2 className="text-xl font-bold">Gross Sales By Month</h2>
            <div className="flex items-center"> 
              <small className="p-2 me-2" style={{backgroundColor: "#2793ff"}}></small> 
              <span className="text-lg">{`${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}`}</span>
            </div>
            <div className="flex items-center"> 
              <small className="p-2 me-2" style={{backgroundColor: "#cce1ff", border: "2px dashed #2793ff"}}></small> 
              <span className="text-lg">{`${new Date(startDate2).toDateString()} - ${new Date(endDate2).toDateString()}`}</span>
            </div>
          </section>
          <HorizontalBarChartComponent data={dashboardData?.grossSalesByMonth || {}} startDate={startDate} endDate={endDate} 
          startDate2={startDate2} endDate2={endDate2} color1={"#2793ff"} color2={"#cce1ff"} />
          
          
          {/* <DataGrid /> */}
        </>}
      </section>

      
    </div>
  );
}

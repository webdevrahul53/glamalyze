/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { COMMISSIONS_API_URL, EMPLOYEES_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const CardLayout = ({title, value}: {title: string, value: string}) => (
  <section className="w-1/4 p-6 bg-white rounded border-2">
    <h1 className="text-2xl">{value}</h1>
    <h3 className="text-md mt-2 text-gray-500">{title}</h3>
  </section>
)

export default function Commissions() {

  const [loading, setLoading] = React.useState(false);
  const [employeeList, setEmployeeList] = React.useState<any>([]);
  // const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<Date | null>(new Date("2025-06-30")); // Default to current month

  React.useEffect(() => { 
    getStaffList()
  }, [])

  React.useEffect(() => {
    if ((startDate && endDate) || selectedEmployee) {
      getDashboardData(selectedEmployee, startDate, endDate);
    }
  }, [startDate, endDate, selectedEmployee]);
  

  const getDashboardData = async (employeeId: any = null, startDate:any, endDate: any) => {
    try {
      setLoading(true)
      const query = employeeId 
        ? `?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}` : `?startDate=${startDate}&endDate=${endDate}`;
      const services = await fetch(`${COMMISSIONS_API_URL}${query}`);
      
      const parsed = await services.json();
      console.log(parsed);
      
      // setDashboardData(parsed.data);
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.error);
    }
  };

  
    
  const getStaffList = async () => {
    try {
      const employeees = await fetch(EMPLOYEES_API_URL)
      const parsed = await employeees.json();
      setEmployeeList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }
  


  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      {/* <select name="" id="" className="border-2 border-gray-300 rounded p-2 mb-4" onChange={(e:any) => getDashboardData(e.target.value)}>
        <option value="">Select Employee</option>
        {employeeList.map((item:any) => <option key={item._id} value={item._id}>{item.employeename}</option>)}
      </select> */}
      <section className="flex gap-4 mb-2">
        <Select label="Select Employee" placeholder="Choose a employee" variant="faded" className="max-w-xs mb-4" 
        onChange={(e) => setSelectedEmployee(e.target.value)} >
          {employeeList.map((item:any) => (
            <SelectItem key={item._id} value={item._id}>
              {item.employeeName}
            </SelectItem>
          ))}
        </Select>
        
        <DateRangePicker variant="faded" className="w-60" label="Date Range" onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }} />
      </section>

      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      {/* <h1 className="text-4xl">Dashboard</h1> */}
      <section className="flex gap-4 mt-2">
        <CardLayout title="Net Sales" value={`฿ 0`}></CardLayout>
        <CardLayout title="Gross Sales" value={`฿ 0`}></CardLayout>
        <CardLayout title="Transactions" value={`0`}></CardLayout>
        <CardLayout title="Returns & Refunds" value={"0"}></CardLayout>
      </section>


    </div>
  );
}

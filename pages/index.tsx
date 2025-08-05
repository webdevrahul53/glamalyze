/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { Progress, Select, SelectItem } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
        <Bar dataKey="appointment" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};



export default function Home() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);

  React.useEffect(() => { 
    getDashboardData();
    getBranchList()
  }, [])
  

  const getDashboardData = async (branchId: any = null) => {
    try {
      setLoading(true)
      const query = branchId ? `?branchId=${branchId}` : "";
      const services = await fetch(`${DASHBOARD_API_URL}${query}`);
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
      
      <Select label="Select Branch" placeholder="Choose a branch" variant="faded" className="max-w-xs mb-4" onChange={(e) => getDashboardData(e.target.value)} >
        {branchList?.map((item:any) => (
          <SelectItem key={item._id} value={item._id}>
            {item.branchname}
          </SelectItem>
        ))}
      </Select>
      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      {/* <h1 className="text-4xl">Dashboard</h1> */}
      <section className="flex gap-4 my-6">
        <CardLayout title="Appointment" value={dashboardData?.appointment || 0}></CardLayout>
        <CardLayout title="Vouchers Sold" value={dashboardData?.voucher || 0}></CardLayout>
        {/* <CardLayout title="Total Revenue" value={`฿ ${dashboardData?.revenue || 0}`}></CardLayout> */}
        {/* <CardLayout title="Users" value={dashboardData?.users || 0}></CardLayout> */}
        <CardLayout title="Therapist" value={dashboardData?.employees || 0}></CardLayout>
        {/* <CardLayout title="Product Sales" value="฿0.00"></CardLayout> */}
      </section>
      <section className="flex">
        <div className="w-2/3">
          <BarChartComponent data={dashboardData?.monthWiseAppointmentData || []} />
        </div>
        <div className="w-1/3">
        {/* <PieChartComponent /> */}
        </div>
      </section>
      {/* <DataGrid /> */}
    </div>
  );
}

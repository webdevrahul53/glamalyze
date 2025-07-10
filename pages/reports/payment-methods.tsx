/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { BRANCH_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";

// const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];



export default function PaymentMethods() {

  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<any>(null);
  const [endDate, setEndDate] = React.useState<any>(null); // Default to current month


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
      
      const services = await fetch(`${DASHBOARD_API_URL}/payment-methods${query}`);
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
        <p className="text-gray-500">Total Collected</p>
        <div className="text-3xl font-bold">฿ {dashboardData?.totalCollected.toFixed(2)}</div>
      </section>

      {loading ? <Progress isIndeterminate aria-label="Loading..." size="sm" /> : <></>}
      <hr className="border-gray-300 mb-4" />

      <p className="text-gray-500 mb-3">Total Payment Methods by Total Collected</p>
      
      <PaymentBar data={dashboardData?.paymentMethods || []} />
      
      <div className="my-6 py-1"></div>

      <SummaryTable data={dashboardData?.paymentMethods || []} />

      
    </div>
  );
}


const PaymentBar = ({ data }: { data: { method: string; payment: number }[] }) => {
  const total = data.reduce((sum, item) => sum + item.payment, 0);

  const colors: Record<string, string> = {
    cash: '#37b6ff',     // Light Blue
    card: '#ffde5a',     // Yellow
    transfer: '#7ed957', // Green
  };

  return (
    <div className="w-full space-y-2">
      {/* Progress Bar */}
      <div className="w-full flex overflow-hidden rounded-full" style={{height: "2.5rem"}}>
        {data.map((item, idx) => {
          const key = item.method.toLowerCase();
          const percentage = (item.payment / total) * 100;
          return (
            <div
              key={key}
              style={{
                width: `${percentage}%`,
                marginLeft: "-2rem",
                backgroundColor: colors[key],
                borderRadius: "5rem",
                zIndex: idx === 0 ? 100 : 1
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between flex-wrap text-sm" style={{width: "90%"}}>
        {data.map((item) => {
          const key = item.method.toLowerCase();
          // const percentage = total === 0 ? 0 : ((item.payment / total) * 100).toFixed(1);
          return (
            <div key={key} className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[key] }}
              />
              <div>
                <strong className="capitalize text-3xl">{item.method}</strong>
                {/* : <span>฿{item.payment.toLocaleString()} ({percentage}%)</span> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



const SummaryTable = ({data}: {data: { method: string; payment: number, refund: number, fees: number }[]}) => {

  const total = data.reduce(
    (acc, row) => {
      acc.payment += row.payment;
      acc.refund += row.refund;
      acc.fees += row.fees;
      return acc;
    },
    { payment: 0, refund: 0, fees: 0 }
  );

  const formatCurrency = (amount: number) =>
    `฿ ${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="overflow-x-auto text-sm">
      <table className="min-w-full text-left border-separate border-spacing-y-1">
        <thead>
          <tr className="text-gray-600 font-medium">
            <th className="px-4 py-2 border-gray-300 border-b-2 border-e-2">Summary<br /><span className="text-xs text-gray-400">All Day (00:00–00:00)</span></th>
            <th className="px-4 py-2 border-gray-300 border-b-2 text-right">
              Payment amount
            </th>
            <th className="px-4 py-2 border-gray-300 border-b-2 text-right">
              Refund amount
            </th>
            <th className="px-4 py-2 border-gray-300 border-b-2 text-right">
              Total fees (incl taxes)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-2 border-e-2 border-gray-300">{row.method}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.payment)}</td>
              <td className="px-4 py-2 text-right">
                {row.refund < 0 ? `(${formatCurrency(row.refund)})` : formatCurrency(row.refund)}
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.fees)}</td>
            </tr>
          ))}
          <tr className="font-semibold border-2">
            <td className="px-4 py-2 border-e-2 border-t-2 border-gray-300">Total</td>
            <td className="px-4 py-2 border-t-2 border-gray-300 text-right">{formatCurrency(total.payment)}</td>
            <td className="px-4 py-2 border-t-2 border-gray-300 text-right">
              {total.refund < 0 ? `(${formatCurrency(total.refund)})` : formatCurrency(total.refund)}
            </td>
            <td className="px-4 py-2 border-t-2 border-gray-300 text-right">{formatCurrency(total.fees)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

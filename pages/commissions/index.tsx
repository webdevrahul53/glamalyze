/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { COMMISSIONS_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress, Select, SelectItem } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";
import TherapistCommissionTable from "./therapist-table";

export default function Commissions() {

  const [loading, setLoading] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [selectedCommission, setSelectedCommission] = React.useState("")
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null); // Default to current month

  React.useEffect(() => {
    getDashboardData(startDate, endDate, selectedCommission);
  }, [startDate, endDate, selectedCommission]);
  

  const getDashboardData = async (startDate:any, endDate: any, selectedCommission: string) => {
    try {
      setLoading(true)
      const query = `?startDate=${startDate}&endDate=${endDate}&selectedCommission=${selectedCommission}`;
      const services = await fetch(`${COMMISSIONS_API_URL}${query}`);
      
      const parsed = await services.json();
      console.log(parsed);
      
      setDashboardData(parsed);
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.error);
    }
  };

  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      <section className="flex gap-4 mb-2">
        <DateRangePicker variant="faded" className="w-60" label="Date Range" onChange={(range:any) => { setStartDate(range.start); setEndDate(range.end); }} />
          
        <Select label="Select Commission" placeholder="Choose type of commission" variant="faded" className="max-w-xs mb-4"
          value={selectedCommission} onChange={e => setSelectedCommission(e.target.value)}>
          <SelectItem key={""}>Job Commission</SelectItem>
          <SelectItem key={"Personal Booking Commission"}>Personal Booking Commission</SelectItem>
          <SelectItem key={"Transfer Commission"}>Transfer Commission</SelectItem>
        </Select>
      </section>

      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      
      <TherapistCommissionTable data={dashboardData || []} />


    </div>
  );
}

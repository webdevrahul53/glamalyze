/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { COMMISSIONS_API_URL } from "@/core/utilities/api-url";
import { DateRangePicker, Progress } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";
import TherapistCommissionTable from "./therapist-table";

export default function Commissions() {

  const [loading, setLoading] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date("2025-04-01"));
  const [endDate, setEndDate] = React.useState<Date | null>(new Date("2025-06-30")); // Default to current month

  React.useEffect(() => {
    getDashboardData(startDate, endDate);
  }, [startDate, endDate]);
  

  const getDashboardData = async (startDate:any, endDate: any) => {
    try {
      setLoading(true)
      const query = `?startDate=${startDate}&endDate=${endDate}`;
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
      </section>

      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      
      <TherapistCommissionTable data={dashboardData || []} />


    </div>
  );
}

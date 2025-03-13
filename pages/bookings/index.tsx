/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search';
import { APPOINTMENTS_API_URL } from '@/core/utilities/api-url';
import { DownloadIcon } from '@/core/utilities/svgIcons';
import { Button } from '@heroui/react';
import React from 'react'
import { toast } from 'react-toastify';



export default function Bookings(){
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)
  
  const updateStatus = async (id:string, obj: any) => {
    try {
      const appointment = await fetch(`${APPOINTMENTS_API_URL}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(obj),
          headers: { "Content-Type": "application/json" }
      })
      const parsed = await appointment.json();
      if(parsed.status){
        setPageRefresh((val) => !val)
      }else toast.error(parsed.message)
    }catch(err:any) {
      toast.error(err.error.message)
    }
  }
  

  return (
    <section className="">
        <PageTitle title="Bookings" showCalendarButton />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              {/* <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button> */}
            </div>
          </div>

          <DataGrid columns={columns} api={APPOINTMENTS_API_URL} search={search} pageRefresh={pageRefresh} 
          updateStatus={updateStatus} />
          
        </div>
    </section>
  )
}



export const columns = [
  {name: "DATE", uid: "datetime"},
  {name: "CLIENT", uid: "customer:firstname"},
  {name: "AMOUNT", uid: "totalAmount"},
  {name: "DURATION", uid: "totalDuration"},
  {name: "STAFF", uid: "employee:firstname"},
  {name: "STATUS", uid: "taskStatus"},
  // {name: "STATUS", uid: "status"},
  {name: "PAYMENT STATUS", uid: "paymentStatus"},
  // {name: "UPDATED AT", uid: "updatedAt"},
  {name: "ACTIONS", uid: "actions"},
];
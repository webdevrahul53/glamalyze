/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search';
import { APPOINTMENT_SERVICES_API_URL, APPOINTMENTS_API_URL } from '@/core/utilities/api-url';
import { DownloadIcon } from '@/core/utilities/svgIcons';
import { Button, Progress, useDisclosure } from '@heroui/react';
import React, { lazy, Suspense } from 'react'
import { toast } from 'react-toastify';
const NewAppointment = lazy(() => import("@/core/drawer/new-appointment"));



export default function Bookings(){
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedBookings, setSelectedBookings] = React.useState(null)
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
      toast.error(err.error)
    }
  }
  
  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedBookings(null)
  }

  return (
    <section className="">
        <PageTitle title="Bookings" showCalendarButton pageRefresh={() => setPageRefresh((val) => !val)} />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              {/* <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button> */}
            </div>
          </div>

          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <NewAppointment bookings={selectedBookings} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          <DataGrid columns={columns} api={APPOINTMENT_SERVICES_API_URL} search={search} pageRefresh={pageRefresh} 
          updateStatus={updateStatus} onEdit={(item:any) => {setSelectedBookings(item); handleOpen()}} />
          
        </div>
    </section>
  )
}



export const columns = [
  {name: "DATE", uid: "start"},
  {name: "CLIENT", uid: "customer:firstname"},
  {name: "STAFF", uid: "employee"},
  {name: "AMOUNT", uid: "price"},
  {name: "DURATION", uid: "duration"},
  {name: "SERVICES", uid: "serviceName"},
  {name: "STATUS", uid: "taskStatus"},
  // {name: "STATUS", uid: "status"},
  // {name: "PAYMENT STATUS", uid: "paymentStatus"},
  // {name: "UPDATED AT", uid: "updatedAt"},
  {name: "ACTIONS", uid: "actions"},
];
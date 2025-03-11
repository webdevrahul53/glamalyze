/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import { DownloadIcon, SearchIcon } from '@/core/utilities/svgIcons';
import { Button, Input, Progress } from '@heroui/react';
import React from 'react'

export const columns = [
  {name: "DATE", uid: "datetime"},
  {name: "CLIENT", uid: "customer:firstname"},
  {name: "AMOUNT", uid: "totalAmount"},
  {name: "DURATION", uid: "totalDuration"},
  {name: "STAFF", uid: "employee:firstname"},
  {name: "STATUS", uid: "status"},
  {name: "PAYMENT STATUS", uid: "paymentStatus"},
  // {name: "UPDATED AT", uid: "updatedAt"},
  {name: "ACTIONS", uid: "actions"},
];


export default function Bookings(){
  // const {isOpen, onOpen, onOpenChange} = useDisclosure();
  // const handleOpen = () => { onOpen(); };
  // const [selectedAppointment, setSelectedAppointment] = React.useState(null)
  const [appointments, setAppointments] = React.useState([])
  const [isLoading, setLoading] = React.useState(false)


  React.useEffect(() => {
    getAppointments();
  }, [])


  const getAppointments = async () => {
    try {
      setLoading(true)
      const appointment = await fetch("/api/appointments");
      const parsed = await appointment.json();
      setAppointments(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
      
    }
  }

  const deleteAppointment = async (id:string) => {
    try {
      await fetch(`/api/appointments/${id}`, {method: "DELETE"});
      getAppointments()
    } catch (error) {
      console.log(error);
      
    }
  }
  return (
    <section className="">
        <PageTitle title="Bookings" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              {/* <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button> */}
            </div>
          </div>


          {/* {appointments.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={appointments} 
          // onEdit={(item:any)=> {setSelectedAppointment(item); handleOpen()}} 
          onDelete={(id:string) => deleteAppointment(id)} />
          
        </div>
    </section>
  )
}

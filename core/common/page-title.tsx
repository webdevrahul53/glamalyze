import React, { lazy, Suspense } from 'react'
import { CalendarIcon, ListIcon, PlusIcon } from '../utilities/svgIcons'
import { CircularProgress, useDisclosure } from '@heroui/react';
import Link from 'next/link';
const NewAppointment = lazy(() => import("@/core/drawer/new-appointment"));

export const PageTitle = ({title, showCalendarButton = false, showDatatableButton = false}: {title: string, showCalendarButton?: boolean, showDatatableButton?: boolean}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };

  const onDrawerClose = () => {
    onOpenChange(); 
  }

  return ( 
    <div className="flex bg-primary text-white" style={{padding: "40px"}}>
        <h1 className="text-4xl">{title}</h1>
        {isOpen && (
          <Suspense fallback={<CircularProgress color="primary" aria-label="Loading..." />}>
            <NewAppointment isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
        )}
        <div className="flex items-center ms-auto gap-3">
          <div className="flex items-center bg-secondary gap-2 p-3 px-6 rounded cursor-pointer" onClick={() => handleOpen()}>
              <PlusIcon  width={15} height={15} color="white" />
              <div>Appointment</div>
          </div>
          {showCalendarButton && <Link href={"/bookings/calendar-view"} className="flex items-center bg-light text-black gap-2 p-3 px-6 rounded cursor-pointer">
              <CalendarIcon  width={15} height={15} color="black" />
              <div>Calendar View</div>
          </Link>}
          
          {showDatatableButton && <Link href={"/bookings"} className="flex items-center bg-light text-black gap-2 p-3 px-6 rounded cursor-pointer">
              <ListIcon  width={15} height={15} color="black" />
              <div>Datatable View</div>
          </Link>}
        </div>
        

    </div>
  )
}

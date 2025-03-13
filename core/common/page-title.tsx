import React, { lazy, Suspense } from 'react'
import { CalendarIcon, PlusIcon } from '../utilities/svgIcons'
import { CircularProgress, useDisclosure } from '@heroui/react';
const NewAssignment = lazy(() => import("@/core/drawer/new-assignment"));

export const PageTitle = ({title, showCalendarButton = false}: {title: string, showCalendarButton?: boolean}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };

  const onDrawerClose = () => {
    onOpenChange(); 
  }

  return ( 
    <div className="flex bg-primary text-white" style={{padding: "40px", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px"}}>
        {isOpen && (
          <Suspense fallback={<CircularProgress color="primary" aria-label="Loading..." />}>
            <NewAssignment isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
        )}
        <h1 className="text-4xl">{title}</h1>
        <div className="flex items-center ms-auto gap-3">
          <div className="flex items-center bg-secondary gap-2 p-3 px-6 rounded cursor-pointer" onClick={() => handleOpen()}>
              <PlusIcon  width={15} height={15} color="white" />
              <div>Assignment</div>
          </div>
          {showCalendarButton && <div className="flex items-center border-gray-100 border-2 gap-2 p-3 px-6 rounded cursor-pointer">
              <CalendarIcon  width={15} height={15} color="white" />
              <div>Calendar View</div>
          </div>}
        </div>
        

    </div>
  )
}

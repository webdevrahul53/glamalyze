/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react'
import { PageTitle } from '@/core/common/page-title'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { APPOINTMENT_SERVICES_API_URL } from '@/core/utilities/api-url';
import { BathIcon, BedIcon, ChairIcon, SofaIcon } from '@/core/utilities/svgIcons';
import { Avatar, Progress, Tooltip, useDisclosure } from '@heroui/react';
import NewAppointment from '@/core/drawer/new-appointment';
import { taskStatusCSS } from '@/core/common/data-grid';

// Localizer (Using Moment.js)
const localizer = momentLocalizer(moment);



export default function CalendarViewBookings(){
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [events, setEvents] = React.useState<any[]>([]);
  const [calendarDate, setCalendarDate] = React.useState(new Date());
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [selectedTime, setSelectedTime] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getAppointments()
  },[calendarDate])

  const handleSelectEvent = (event: any) => {
    setSelectedBooking(event); // Store selected bookingId
  };

  const getAppointments = async () => {
    try {
      const date = calendarDate.toISOString().split("T")[0];
      const response = await fetch(`${APPOINTMENT_SERVICES_API_URL}/calendar?appointmentDate=${date}`);
      let data = await response.json();
      data = data?.map((item: any) => {
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        item.start = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), startDate.getUTCHours(), startDate.getUTCMinutes());
        item.end = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), endDate.getUTCHours(), endDate.getUTCMinutes());
        return item
      })
      
      setEvents(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error fetching users:", error);
    }
  };

  const onDrawerClose = () => {
    // setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedBooking(null)
  }

  return (
    <section className="">
        <PageTitle title="Bookings" showDatatableButton />

        {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <NewAppointment bookings={selectedBooking} selectedTime={selectedTime} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
        )}

        <div className="bg-white rounded p-2" style={{margin: "-30px 40px"}}>
          <div style={{ height: 520 }}>
            {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
            <Calendar
              localizer={localizer}
              events={events}
              date={calendarDate}
              onNavigate={(newDate) => setCalendarDate(newDate)} // Fix navigation
              selectable
              startAccessor="start"
              endAccessor="end"
              views={['month', 'week', 'day', 'agenda']} // Ensure views are included
              defaultView="day"
              style={{ height: '100%' }}
              min={new Date(2025, 2, 16, 10, 0)} // 10 AM
              max={new Date(2025, 2, 16, 18, 0)} // 6 PM
              step={30} // Minutes per time slot (default: 30)
              timeslots={2} // Number of slots per hour (default: 2)
              dayLayoutAlgorithm={"no-overlap"} // Ensures events are rendered in order
              onSelectEvent={handleSelectEvent}
              onDoubleClickEvent={() => handleOpen()}
              onSelectSlot={(event: any) => {
                setSelectedTime(event.start)
                setSelectedBooking(null)
                handleOpen()
              }}
              components={{event: CustomEvent}}
              eventPropGetter={(event:any) => {
                const isSelected = event.bookingId === selectedBooking?.bookingId;
                const isBooked = event.bookingId;
                document.documentElement.style.setProperty(
                  "--event-width",
                  `calc(100% / ${events?.length} - 5px)`
                ); // Pass events.length as a CSS variable
            
                return {
                  style: {
                    // border: "4px solid",
                    // borderColor: statusColor[event.taskStatus],
                    // backgroundColor: statusColor[event.taskStatus],
                    backgroundColor: "white",
                    border: isSelected && isBooked ? "3px solid blue" : "1px solid gray",
                    color: "black",
                    width: `calc(100% / ${events?.length} - 5px)`, // Distribute width equally
                    minWidth: "50px",
                    marginLeft: "5px",
                    marginRight: "5px",
                  },
                  className: "hide-time"
                };
              }}
            />
          </div>

          
        </div>
    </section>
  )
}


const CustomEvent = (event: any) => {
  const isBooked = event.event.bookingId;
  return <section>
    <Tooltip isDisabled={!isBooked}
      content={<div className="p-4">
          <AvatarCard {...event?.event?.customer} />
          <div className="text-xl fw-bolder mt-3">{event?.event?.start.toDateString()} {event?.event?.startTime} </div>
          {/* <div className="text-lg">Booking Id: {event?.event?.bookingId}</div> */}
          <div className="text-lg">Service: {event?.event?.service?.name}</div>
          <div className="text-lg">Price: Rs. {event?.event?.price}</div>
          <span className={`${taskStatusCSS[event?.event?.taskStatus]} p-1 rounded text-center cursor-pointer float-right`}>{event?.event?.taskStatus}</span>
          {/* <AvatarCard {...event.event.employee} /> */}
        </div>}
    >
      <div className={`flex ${event.event.duration < 40 ? "flex-row":"flex-col h-full justify-center"} items-center gap-1`}>
        <small>{event.event.duration}m</small>
        <div>
          {event?.event?.assetType === "chair" && <ChairIcon width={20} color={isBooked ? "black": "lightgray"} />}
          {event?.event?.assetType === "sofa" && <SofaIcon width={20} color={isBooked ? "black": "lightgray"} />}
          {event?.event?.assetType === "bed" && <BedIcon width={20} color={isBooked ? "black": "lightgray"} />}
          {event?.event?.assetType === "bath" && <BathIcon width={20} color={isBooked ? "black": "lightgray"} />}
        </div>
        
        <small>{event?.event?.assetNumber}</small>
      </div>
    </Tooltip>
  </section>
}


// const statusColor: any = {
//   Pending: "gray",
//   CheckIn: "teal",
//   Checkout: "purple",
//   Completed: "green",
//   Cancelled: "darkred",
// }

const AvatarCard = (props:any) => {
  
  return (
    <div className="flex gap-5">
      <Avatar isBordered radius="full" size="md" src={props.image} />
      <div className="flex flex-col gap-1 items-start justify-center">
        <h4 className="text-small font-semibold leading-none text-default-600">{props.firstname} {props.lastname}</h4>
        <h5 className="text-small tracking-tight text-default-400">{props.createdAt}</h5>
      </div>
      <div className="ms-auto text-3xl"> &times; </div>
    </div>
  );
}
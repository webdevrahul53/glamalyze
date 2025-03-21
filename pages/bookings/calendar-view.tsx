/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { PageTitle } from '@/core/common/page-title'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { APPOINTMENTS_API_URL, ASSETS_API_URL } from '@/core/utilities/api-url';
import { BathIcon, BedIcon, ChairIcon, SofaIcon } from '@/core/utilities/svgIcons';
import { Avatar, Tooltip } from '@heroui/react';

// Localizer (Using Moment.js)
const localizer = momentLocalizer(moment);



export default function CalendarViewBookings(){
  const [events, setEvents] = React.useState<any[]>([]);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);
  const [assetList, setAssetList] = React.useState<any[]>([])

  React.useEffect(() => {
    getAssetList();
  },[])

  React.useEffect(() => {
    getAppointments();
  },[assetList])


  const handleSelectEvent = (event: any) => {
    setSelectedBookingId(event.bookingId); // Store selected bookingId
  };
  
  const getAssetList = async () => {
    try {
      const assets = await fetch(`${ASSETS_API_URL}`)
      const parsed = await assets.json();
      
      const allSlots = generateTimeSlots("10:00", "18:00", 30, parsed, "2025-03-21");
      setAssetList(allSlots)
    }catch(err:any) { console.log(err) }
  }


  const getAppointments = async () => {
    try {
      const response = await fetch(`${APPOINTMENTS_API_URL}/calendar`);
      let data = await response.json();
      data = data?.map((item: any) => {
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        item.start = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), startDate.getUTCHours(), startDate.getUTCMinutes());
        item.end = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), endDate.getUTCHours(), endDate.getUTCMinutes());
        return item
      })
      
      const merged = mergeBookedSlots(assetList, data);
      setEvents(merged);
      // setEvents(data)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  function mergeBookedSlots(emptySlots: any[], bookedSlots: any[]) {
    // Filter out empty slots that overlap with booked slots
    const filteredEmptySlots = emptySlots.filter((empty) => 
      !bookedSlots.some(
        (booked) =>
          booked.assetType === empty.assetType &&
          booked.assetNumber === empty.assetNumber &&
          booked.start.getTime() < empty.end.getTime() && // Starts before empty slot ends
          booked.end.getTime() > empty.start.getTime()    // Ends after empty slot starts
        )
      );

    // Combine booked slots and remaining empty slots
    const mergedSlots = [...filteredEmptySlots, ...bookedSlots];

    return mergedSlots;
  }




  function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number, availableAssets:any, date: string) {
    let slots = [];
    let start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    
    while (start < end) {
      const slotEnd = new Date(start.getTime() + intervalMinutes * 60000);
      
      slots.push(
        availableAssets.map((asset:any) => ({
          title: `Seat ${asset.assetNumber}`,
          start: new Date(start),
          end: new Date(slotEnd),
          assetId: asset._id,
          assetType: asset.assetType,
          assetNumber: asset.assetNumber,
          status: false,
        }))
      );
      
      start = slotEnd;
    }
    
    return slots.flat();
  }


  return (
    <section className="">
        <PageTitle title="Bookings" showDatatableButton />

        <div className="bg-white rounded p-2" style={{margin: "-30px 40px"}}>
          <div style={{ height: 520 }}>
            <Calendar
              localizer={localizer}
              events={events}
              date={currentDate}
              onNavigate={(newDate) => setCurrentDate(newDate)} // Fix navigation
              selectable
              startAccessor="start"
              endAccessor="end"
              views={['month', 'week', 'day', 'agenda']} // Ensure views are included
              defaultView="day"
              style={{ height: '100%' }}
              min={new Date(2025, 2, 16, 10, 0)} // 10 AM
              max={new Date(2025, 2, 16, 18, 0)} // 6 PM
              step={10} // Minutes per time slot (default: 30)
              timeslots={1} // Number of slots per hour (default: 2)
              onSelectEvent={handleSelectEvent}
              onSelectSlot={(item: any) => console.log(item)}
              components={{event: CustomEvent}}
              eventPropGetter={(event:any) => {
                const isSelected = event.bookingId === selectedBookingId;
                const isBooked = event.bookingId;
                document.documentElement.style.setProperty(
                  "--event-width",
                  `calc(100% / ${assetList?.length} - 5px)`
                ); // Pass events.length as a CSS variable
            
                return {
                  style: {
                    // border: "4px solid",
                    // borderColor: statusColor[event.taskStatus],
                    // backgroundColor: statusColor[event.taskStatus],
                    backgroundColor: "white",
                    border: isSelected && isBooked ? "3px solid blue" : "1px solid gray",
                    color: "black",
                    width: `calc(100% / ${assetList?.length} - 5px)`, // Distribute width equally
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
    <Tooltip 
      content={isBooked ?  <div className="p-4">
          <AvatarCard {...event?.event?.customer} />
          <div className="text-xl fw-bolder mt-3">{event?.event?.start.toDateString()} </div>
          <div className="text-lg">Booking Id: {event?.event?.bookingId}</div>
          <div className="text-lg">Service: {event?.event?.service?.name}</div>
          <div className="text-lg">Price: Rs. {event?.event?.price}</div>
          <div className="text-lg">Duration: {event?.event?.duration} min</div>
          {/* <AvatarCard {...event.event.employee} /> */}
        </div> : <></>
      }
    >
      <div className="flex flex-col items-center gap-1">
        <small>{event?.event?.assetNumber}</small>
        {event?.event?.assetType === "chair" && <ChairIcon width={30} color={isBooked ? "black": "lightgray"} />}
        {event?.event?.assetType === "sofa" && <SofaIcon width={30} color={isBooked ? "black": "lightgray"} />}
        {event?.event?.assetType === "bed" && <BedIcon width={30} color={isBooked ? "black": "lightgray"} />}
        {event?.event?.assetType === "bath" && <BathIcon width={30} color={isBooked ? "black": "lightgray"} />}
        
        <small>{event.event.duration}m</small>
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
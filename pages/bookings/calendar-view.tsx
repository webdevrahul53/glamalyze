/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { PageTitle } from '@/core/common/page-title'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { APPOINTMENTS_API_URL } from '@/core/utilities/api-url';
import { ChairIcon } from '@/core/utilities/svgIcons';
import { Avatar, Tooltip } from '@heroui/react';

// Localizer (Using Moment.js)
const localizer = momentLocalizer(moment);



export default function CalendarViewBookings(){
  const [events, setEvents] = React.useState<any[]>([]);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAppointments();
  },[])


  const handleSelectEvent = (event: any) => {
    setSelectedBookingId(event.bookingId); // Store selected bookingId
  };
  

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
      
      // console.log();
      let allSlots = generateTimeSlots(10, 18, 10, data);
      
      setEvents([...allSlots, ...data]); // Assuming API returns { users: [], totalPages: N }
      // setEvents(data)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  // const generateTimeSlots = (startHour:number, endHour:number, seatsPerSlot:number, bookedSlots: any) => {
  //   const slots = [];
  //   const currentTime = moment().set({ hour: startHour, minute: 0 });
  
  //   while (currentTime.hour() < endHour) {
  //     const slotStart = currentTime.clone();
  //     const slotEnd = currentTime.clone().add(30, "minutes");
  
  //     const startSlotMinutes = slotStart.hour() * 60 + slotStart.minutes(); 
  //     const endSlotMinutes = startSlotMinutes + 30;
  
  //     const filteredBookings = bookedSlots.filter((booking:any) => {
  //       const [startHours, startMinutes] = booking.startTime.split(":").map(Number);
  //       // const [endHours, endMinutes] = booking.end.split("T")[1].split(":").map(Number);
  //       const endHours = new Date(booking.end).getHours()
  //       const endMinutes = new Date(booking.end).getMinutes()
        
  //       const bookingStart = startHours * 60 + startMinutes;
  //       const bookingEnd = endHours * 60 + endMinutes;
  
  //       // Booking overlaps if it starts before slot ends and ends after slot starts
  //       return bookingStart < endSlotMinutes && bookingEnd > startSlotMinutes;
  //     });
  
  //     console.log(`Slot: ${slotStart.format("HH:mm")} - ${slotEnd.format("HH:mm")}, Bookings:`, filteredBookings);
  
  //     for (let i = 0; i < seatsPerSlot - filteredBookings.length; i++) {
  //       slots.push({
  //         start: slotStart.toDate(),
  //         end: slotEnd.toDate(),
  //       });
  //     }
  
  //     currentTime.add(30, "minutes");
  //   }
  
  //   return slots;
  // };



  const generateTimeSlots = (startHour:number, endHour:number, seatsPerSlot:number, bookedSlots: any) => {
    const slots = [];
    const currentTime = moment().set({ hour: startHour, minute: 0 });
  
    while (currentTime.hour() < endHour) {
      const slotStart = currentTime.clone();
      const slotEnd = currentTime.clone().add(30, "minutes");
  
      const startSlotMinutes = slotStart.hour() * 60 + slotStart.minutes(); 
      const endSlotMinutes = startSlotMinutes + 30;
  
      // Step 1: Get all overlapping bookings
      const overlappingBookings:any = bookedSlots.filter((booking:any) => {
        const [startHours, startMinutes] = booking.startTime.split(":").map(Number);
        const endHours = new Date(booking.end).getHours();
        const endMinutes = new Date(booking.end).getMinutes();
  
        const bookingStart = startHours * 60 + startMinutes;
        const bookingEnd = endHours * 60 + endMinutes;
  
        return bookingStart < endSlotMinutes && bookingEnd > startSlotMinutes;
      });
  
      // Step 2: Determine actual seat occupancy
      let occupiedSeats = 0;
      let lastEndTime:any = null;
  
      overlappingBookings.sort((a:any, b:any) => new Date(a?.end).getTime() - new Date(b?.end).getTime()); // Sort by end time
  
      overlappingBookings.forEach((booking: any) => {
        const bookingEndMinutes = new Date(booking.end).getHours() * 60 + new Date(booking.end).getMinutes();
  
        if (lastEndTime === null || bookingEndMinutes > lastEndTime) {
          occupiedSeats++;
          lastEndTime = bookingEndMinutes;
        }
      });
  
      console.log(`Slot: ${slotStart.format("HH:mm")} - ${slotEnd.format("HH:mm")}, Bookings:`, overlappingBookings, `Seats Occupied: ${occupiedSeats}`);
  
      // Step 3: Create available slots
      for (let i = 0; i < seatsPerSlot - occupiedSeats; i++) {
        slots.push({
          start: slotStart.toDate(),
          end: slotEnd.toDate(),
        });
      }
  
      currentTime.add(30, "minutes");
    }
  
    return slots;
  };
  
  

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
                  `calc(100% / 25 - 5px)`
                ); // Pass events.length as a CSS variable
            
                return {
                  style: {
                    // border: "4px solid",
                    // borderColor: statusColor[event.taskStatus],
                    // backgroundColor: statusColor[event.taskStatus],
                    backgroundColor: "white",
                    border: isSelected && isBooked ? "3px solid blue" : "1px solid gray",
                    color: "black",
                    width: `calc(100% / 25 - 5px)`, // Distribute width equally
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
        <ChairIcon width={30} color={isBooked ? "black": "lightgray"} />
        <small>{event.event.duration} m </small>
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
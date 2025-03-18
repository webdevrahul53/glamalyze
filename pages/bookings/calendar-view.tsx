/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { PageTitle } from '@/core/common/page-title'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { APPOINTMENTS_API_URL } from '@/core/utilities/api-url';
import { ChairIcon } from '@/core/utilities/svgIcons';

// Localizer (Using Moment.js)
const localizer = momentLocalizer(moment);



export default function CalendarViewBookings(){
  const [events, setEvents] = React.useState<any[]>([]);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // const events = [
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },
  //   { start: new Date(2025, 2, 17, 10, 0), end: new Date(2025, 2, 17, 10, 30), },

    
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  //   { start: new Date(2025, 2, 17, 10, 31), end: new Date(2025, 2, 17, 11, 0), },
  // ];
  React.useEffect(() => {
    getAppointments();
  },[])


  
  const generateTimeSlots = (startHour:number, endHour:number, seatsPerSlot:number) => {
    const slots = [];
    const currentTime = moment().set({ hour: startHour, minute: 0 });

    while (currentTime.hour() < endHour) {
      for (let i = 0; i < seatsPerSlot; i++) {
        slots.push({
          id: `${currentTime.format("HH:mm")}-${i + 1}`,
          title: `Available Seat ${i + 1}`,
          start: new Date(currentTime.toISOString()),
          end: new Date(currentTime.clone().add(30, "minutes").toISOString()),
          seatNumber: i + 1,
          available: true,
        });
      }
      currentTime.add(30, "minutes");
    }
    return slots;
  };

  const getAppointments = async () => {
    try {
      const response = await fetch(`${APPOINTMENTS_API_URL}/calendar`);
      let data = await response.json();
      data = data?.map((item: any) => {
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        item.start = new Date(startDate.getUTCFullYear(), 
                        startDate.getUTCMonth(), 
                        startDate.getUTCDate(), 
                        startDate.getUTCHours(), 
                        startDate.getUTCMinutes());
        item.end = new Date(endDate.getUTCFullYear(), 
                      endDate.getUTCMonth(), 
                      endDate.getUTCDate(), 
                      endDate.getUTCHours(), 
                      endDate.getUTCMinutes());
        return item
      })
      
      // console.log();
      
      // setEvents(mergeBookingsWithSlots(data)); // Assuming API returns { users: [], totalPages: N }
      setEvents(data)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  

  // const mergeBookingsWithSlots = (bookedSlots:any) => {
  //   let allSlots = generateTimeSlots(10, 18, 20);
  //   console.log(bookedSlots)
  //   // Mark booked slots
  //   bookedSlots.forEach((booked:any) => {
  //     allSlots = allSlots.map((slot) => {
  //       console.log(slot.start.getHours(), "===", booked.start.getHours())
  //       if (slot.start.getHours() === booked.start.getHours() && slot.start.getMinutes() === booked.start.getMinutes()) {
  //         return { ...slot, booked: true, title: "Booked", ...booked };
  //       }
  //       return slot;
  //     });
  //   });

  //   return allSlots;
  // }

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
              onSelectEvent={(item: any) => console.log(item)}
              onSelectSlot={(item: any) => console.log(item)}
              components={{event: CustomEvent}}
              eventPropGetter={() => {
                document.documentElement.style.setProperty(
                  "--event-width",
                  `calc(100% / 20 - 5px)`
                ); // Pass events.length as a CSS variable
            
                return {
                  style: {
                    // border: "4px solid",
                    // borderColor: statusColor[event.taskStatus],
                    // backgroundColor: statusColor[event.taskStatus],
                    backgroundColor: "white",
                    color: "black",
                    width: `calc(100% / 20 - 5px)`, // Distribute width equally
                    minWidth: "60px",
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
  return <section>
    <div className="flex flex-col items-center gap-1">
      <ChairIcon width={30} color="black" />
      <small>{event.event.totalDuration} m </small>
    </div>
  </section>
}


// const statusColor: any = {
//   Pending: "gray",
//   CheckIn: "teal",
//   Checkout: "purple",
//   Completed: "green",
//   Cancelled: "darkred",
// }

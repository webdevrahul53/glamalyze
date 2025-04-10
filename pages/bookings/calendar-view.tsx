/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react'
import { PageTitle } from '@/core/common/page-title'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { APPOINTMENT_SERVICES_API_URL, ASSETS_API_URL, BRANCH_API_URL } from '@/core/utilities/api-url';
import { Avatar, AvatarGroup, Progress, Tooltip, useDisclosure } from '@heroui/react';
import NewAppointment from '@/core/drawer/new-appointment';
import { taskStatusCSS } from '@/core/common/data-grid';
import Image from 'next/image';

// Localizer (Using Moment.js)
const localizer = momentLocalizer(moment);



export default function CalendarViewBookings(){
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [events, setEvents] = React.useState<any[]>([]);
  const [calendarDate, setCalendarDate] = React.useState(new Date());
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [selectedTime, setSelectedTime] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [assets, setAssets] = React.useState<any>([]);
  const [pageRefresh, setPageRefresh] = React.useState(false);


  React.useEffect(() => {
    getBranchList()
  },[])

  React.useEffect(() => {
    const branchId = localStorage.getItem("selectedBranch");
    setSelectedBranch(branchId || branchList[0]?._id)
  },[branchList])
  
  React.useEffect(() => {
    if(!selectedBranch) return;
    setAssets([])
    getAssets()
    // getAvailableAssets("12:00", 60)
    getBranchById()
    getAppointments()
  },[calendarDate, selectedBranch, pageRefresh])

  const handleSelectEvent = (event: any) => {
    setSelectedBooking(event); // Store selected bookingId
  };

  const getBranchList = async () => {
    try {
      const branches = await fetch(BRANCH_API_URL)
      const parsed = await branches.json();
      setBranchList(parsed);
    }catch(err:any) { console.log(err.message) }
  }
  
  const getBranchById = async () => {
    try {
      const branch = await fetch(`${BRANCH_API_URL}/${selectedBranch}`)
      const parsed = await branch.json();
      setAssets((prev:any) => ({...prev, employees: parsed.groupEmployees}))
      
    }catch(err:any) { console.log(err.message) }
  }
  
  const getAssets = async () => {
    try {
      const response = await fetch(`${ASSETS_API_URL}?branchId=${selectedBranch}`);
      const data = await response.json();
      const grouped = data?.reduce((acc: any, curr: any) => {
        if (!acc[curr.assetType]) {
          acc[curr.assetType] = [];
        }
        acc[curr.assetType].push(curr);
        return acc;
      }, {});
      
      setAssets((prev: any) => ({...prev, ...grouped}));
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error fetching users:", error);
    }
  };

  // const getAvailableAssets = async (time: string, duration: number) => {
  //   try {
  //     const appointmentDate = moment(calendarDate).format("yyyy-MM-DD")
  //     const branches = await fetch(`${ASSETS_API_URL}/available-assets?branchId=${selectedBranch}&appointmentDate=${appointmentDate}&startTime=${time}&duration=${duration}`)
  //     const parsed = await branches.json();
      
  //     const grouped = parsed?.availableAssets?.reduce((acc: any, curr: any) => {
  //       if (!acc[curr.assetType]) {
  //         acc[curr.assetType] = [];
  //       }
  //       acc[curr.assetType].push(curr);
  //       return acc;
  //     }, {});
      
  //     setAssets((prev: any) => ({...prev, ...grouped}));
  //     setLoading(false)
  //   }catch(err:any) { console.log(err) }
  // }

  const getAppointments = async () => {
    setLoading(true)
    try {
      const date = moment(calendarDate).format("yyyy-MM-DD")
      const response = await fetch(`${APPOINTMENT_SERVICES_API_URL}/calendar?appointmentDate=${date}&branchId=${selectedBranch}`);
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
    setPageRefresh((val) => !val)
    setSelectedBooking(null)
    onOpenChange();
  }

  return (
    <section className="">
        <PageTitle title="Bookings" showDatatableButton pageRefresh={() => setPageRefresh((val) => !val)} />

        {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <NewAppointment bookings={selectedBooking} selectedTime={selectedTime} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
        )}

        <div className="bg-white rounded p-2" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between pb-4 px-1">

            <div className="flex items-center gap-3">
              {Object.keys(assets)?.map((item: any, index: number) => (
                <div key={index} className="flex items-start"> 
                  {assets[item][0]?.assetTypes?.image && <Image src={assets[item][0]?.assetTypes?.image} width={20} height={20} alt="Asset Image" />}
                  {assets[item][0]?.image && <AvatarGroup className="me-1" isBordered max={3} renderCount={() => <></>}>
                    {assets[item]?.map((item:any) => (
                      <Avatar key={item._id} src={item.image} size="sm" style={{width: "25px", height: "25px"}} />
                    ))}
                  </AvatarGroup>}
                  <small style={{fontSize: "18px"}} className="ms-1 rounded-full">{assets[item]?.length}</small> 
                </div>
              ))}
            </div>

            <div className="border-2 rounded px-2 w-1/4">
              <select className="w-full text-xl p-0 pe-4 py-2 outline-none" value={selectedBranch} onChange={(event:any) => {
                const id: string = event.target.value;
                if(!id) return;
                setSelectedBranch(id)
                localStorage.setItem("selectedBranch", id)
              }}>
                {branchList.map((item:any) => (
                  <option key={item._id} value={item._id}>{item.branchname}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              {Object.keys(assets)?.map((item: any, index: number) => (
                <div key={index} className="flex items-start"> 
                  {assets[item][0]?.assetTypes?.image && <Image src={assets[item][0]?.assetTypes?.image} width={20} height={20} alt="" />}
                  {assets[item][0]?.image && <AvatarGroup className="me-1" isBordered max={3} renderCount={() => <></>}>
                    {assets[item]?.map((item:any) => (
                      <Avatar key={item._id} src={item.image} size="sm" style={{width: "25px", height: "25px"}} />
                    ))}
                  </AvatarGroup>}
                  <small style={{fontSize: "18px"}} className="ms-1 rounded-full">{assets[item]?.length}</small> 
                </div>
              ))}
            </div>

          </div>
          <div style={{ height: "calc(100vh - 200px)" }}>
            {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" className="my-1" />}
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
              min={new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), 10, 0)} // 10 AM
              max={new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), 19, 0)} // 7 PM
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
              backgroundEvents={[
                {
                  title: 'Shift Time',
                  start: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), 10, 0), // 10:00 AM
                  end: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), 18, 0), // 5:00 PM
                  allDay: true,
                  resourceId: null,
                },
              ]}
              components={{event: CustomEvent}}
              eventPropGetter={(event:any) => {
                const isSelected = event.bookingId === selectedBooking?.bookingId;
                const isBooked = event.bookingId;
                document.documentElement.style.setProperty(
                  "--event-width",
                  `calc(100% / ${events?.length <= 8 ? 8 : events?.length} - 5px)`
                ); // Pass events.length as a CSS variable
                if (event.title === 'Shift Time') {
                  return shiftTimeCSS;
                }
                return {
                  style: {
                    backgroundColor: "white",
                    border: isSelected && isBooked ? "3px solid blue" : "1px solid gray",
                    color: "black",
                    width: `calc(100% / ${events?.length <= 8 ? 8 : events?.length} - 5px)`, // Distribute width equally
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
          <div className="text-lg">Price: ฿ {event?.event?.price}</div>
          <span className={`${taskStatusCSS[event?.event?.taskStatus]} p-1 rounded text-center cursor-pointer float-right`}>{event?.event?.taskStatus}</span>
          {/* <AvatarCard {...event.event.employee} /> */}
        </div>}
    >
      <div className={`flex ${event.event.duration < 40 ? "flex-row":"flex-col h-full justify-center"} items-center gap-1`}>
        <small>{event.event.duration}m</small>
        <div>
          {event?.event?.assetType?.image && <Image src={event?.event?.assetType?.image} width={30} height={30} alt="Asset Image" />}
        </div>
        
        <small>{event?.event?.assetNumber}</small>
      </div>
    </Tooltip>
  </section>
}


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

const shiftTimeCSS = {
  style: {
    background: 'none',
    borderLeft: '0', borderRight: '0',
    borderTop: '2px solid red',
    borderBottom: '2px solid red',
    borderRadius: '0',
    outline: 'none',
    cursor: 'auto'
  },
}
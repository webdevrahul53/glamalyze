/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react'
import { PageTitle } from '@/core/common/page-title'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { APPOINTMENT_SERVICES_API_URL, ASSETS_API_URL, BRANCH_API_URL, SETTINGS_API_URL, SHIFTS_API_URL } from '@/core/utilities/api-url';
import { Avatar, AvatarGroup, Progress, Tooltip, useDisclosure } from '@heroui/react';
import NewAppointment from '@/core/drawer/new-appointment';
import { taskStatusCSS } from '@/core/common/data-grid';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, PersonIcon } from '@/core/utilities/svgIcons';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';


// Localizer (Using Moment.js)
const localizer = momentLocalizer(moment);



export default function CalendarViewBookings(){
  const user = useSelector((state:any) => state.user.value)
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [events, setEvents] = React.useState<any[]>([]);
  const [calendarDate, setCalendarDate] = React.useState(new Date());
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [selectedTime, setSelectedTime] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [currentBranch, setCurrentBranch] = React.useState<any>();
  const [followingBranch, setFollowingBranch] = React.useState<any>();
  
  const [selectedBranch, setSelectedBranch] = React.useState<string>();
  const [selectedBranch2, setSelectedBranch2] = React.useState<string>();
  const [allEmployeeList, setAllEmployeeList] = React.useState<any[]>([]);
  const [allEmployeeList2, setAllEmployeeList2] = React.useState<any[]>([]);
  const [assets, setAssets] = React.useState<any>({});
  const [assets2, setAssets2] = React.useState<any>({});
  const [pageRefresh, setPageRefresh] = React.useState(false);

  React.useEffect(() => {
    fetchBranchList();
    getSettings();
  }, []);

  React.useEffect(() => {
    const branchId = user?.defaultBranch;
    const index = branchList.findIndex((b:any) => b._id === branchId);
    const nextBranch = index !== -1 && branchList.length > 1
      ? branchList[(index + 1) % branchList.length]?._id
      : null;
      
    setSelectedBranch(branchId || branchList[0]?._id || null);
    setSelectedBranch2(nextBranch || null);
  }, [branchList]);

  React.useEffect(() => {
    if (!selectedBranch) return;
    setAssets([])
    fetchBranchData(selectedBranch, setAllEmployeeList, setCurrentBranch);
    fetchAvailableAssets(selectedBranch, setAssets);
  }, [selectedBranch, pageRefresh]);

  React.useEffect(() => {
    if (!selectedBranch2) return;
    setAssets2([])
    fetchAvailableAssets(selectedBranch2, setAssets2);
    fetchBranchData(selectedBranch2, setAllEmployeeList2, setFollowingBranch);
  }, [selectedBranch2]);

  React.useEffect(() => {
    fetchBusyEmployees(allEmployeeList, setAssets);
  }, [allEmployeeList]);

  React.useEffect(() => {
    fetchBusyEmployees(allEmployeeList2, setAssets2);
  }, [allEmployeeList2]);

  React.useEffect(() => {
    if (!selectedBranch) return;
    getAppointments();
  }, [calendarDate, pageRefresh, selectedBranch]);

  const handleSelectEvent = (event: any) => {
    setSelectedBooking(event);
  };

  const fetchBranchList = async () => {
    try {
      const res = await fetch(BRANCH_API_URL);
      const data = await res.json();
      setBranchList(data);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const fetchBranchData = async (
    branchId: string,
    setEmployeeList: React.Dispatch<React.SetStateAction<any[]>>,
    setBranchDetails: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      const res = await fetch(`${SHIFTS_API_URL}?branchId=${branchId}`);
      const data = await res.json();
      setBranchDetails(data[0].branch);
      filterEmployeesAndServices(data, setEmployeeList)
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const filterEmployeesAndServices = async (shifts:any, setEmployeeList: React.Dispatch<React.SetStateAction<any[]>>) => {
    
    const date = moment(calendarDate).format("YYYY-MM-DD");
    
    try {
      const settings = await fetch(`${SETTINGS_API_URL}/globalSettings`)
      const parsed = await settings.json();
      
      const startDate = moment(parsed.rosterStartDate).format("YYYY-MM-DD");
      const endDate = moment(parsed.rosterEndDate).format("YYYY-MM-DD");
      if (moment(date).isBefore(startDate) || moment(date).isAfter(endDate)) return;
      console.log(date, startDate, endDate, shifts);

      const time = convertTo24HourFormat(moment(calendarDate).format("hh:mm A"));
      const arr = shifts.filter((item:any) => time >= item.openingAt && time < item.closingAt)
      const employees: any = Array.from(new Map(arr.map((item: any) => item.groupEmployees).flat().map((emp: any) => [emp._id, emp])).values());
      setEmployeeList(employees || [])

      // setRosterStartDate(parseDate(new Date(parsed.rosterStartDate).toISOString().split("T")[0]))
      // setRosterEndDate(parseDate(new Date(parsed.rosterEndDate).toISOString().split("T")[0]))
    }catch(err:any) { toast.error(err.error) }
  }
  
  const getSettings = async () => {
  }


  const fetchBusyEmployees = async (
    employeeList: any[],
    setAssetsState: React.Dispatch<React.SetStateAction<any>>
  ): Promise<void> => {
    try {
      const duration = 60;
      const appointmentDate = moment(calendarDate).format("YYYY-MM-DD");
      const time = convertTo24HourFormat(moment(calendarDate).format("hh:mm A"));

      const res = await fetch(
        `${APPOINTMENT_SERVICES_API_URL}/busy-employees?appointmentDate=${appointmentDate}&startTime=${time}&duration=${duration}`
      );
      const data = await res.json();

      const busyIds = data.busyEmployeesWithSlots?.map((e: any) => e.employeeId) || [];
      const available = employeeList.filter((e: any) => !busyIds.includes(e._id));

      setAssetsState((prev: any) => ({ ...prev, employees: available }));
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchAvailableAssets = async (
    branchId: string,
    setAssetsState: React.Dispatch<React.SetStateAction<any>>
  ): Promise<void> => {
    try {
      const duration = 60;
      const appointmentDate = moment(calendarDate).format("YYYY-MM-DD");
      const time = convertTo24HourFormat(moment(calendarDate).format("hh:mm A"));

      const res = await fetch(
        `${ASSETS_API_URL}/available-assets?branchId=${branchId}&appointmentDate=${appointmentDate}&startTime=${time}&duration=${duration}`
      );
      const data = await res.json();

      const grouped = (data.availableAssets || []).reduce((acc: any, curr: any) => {
        acc[curr.assetType] = acc[curr.assetType] || [];
        acc[curr.assetType].push(curr);
        return acc;
      }, {});

      setAssetsState((prev: any) => ({ ...prev, ...grouped }));
      setLoading(false);
    } catch (err: any) {
      console.error(err);
    }
  };


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

  const convertTo24HourFormat = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ");
    // eslint-disable-next-line prefer-const
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }
    return `${hours}:${minutes}`;
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
          <div className="flex items-center justify-around pb-4 px-1">

            <div className="w-1/4" style={{color: currentBranch?.colorcode}}>
              <div className="pb-2">Available</div>
              <div className="flex items-center gap-3">
                {Object.keys(assets)?.map((item: any, index: number) => (
                  <div key={index} className="flex items-start"> 
                    {assets[item][0]?.assetTypeId?.image && <Image src={assets[item][0]?.assetTypeId?.image} width={20} height={20} alt="Asset Image" />}
                    {item === "employees" && <AvatarGroup className="me-1" isBordered renderCount={() => <></>}>
                      {assets[item].length ? assets[item]?.map((item:any) => (
                        <Avatar key={item._id} src={item.image} size="sm" style={{width: "25px", height: "25px"}} />
                      )) : <PersonIcon width={20} />}
                    </AvatarGroup>}
                    <small style={{fontSize: "18px"}} className="ms-1 rounded-full">{assets[item]?.length}</small> 
                  </div>
                ))}
              </div>
            </div>

            <div className="w-2/4 flex items-center justify-center">
              {/* Previous Branch */}
              <div role="button" className="border-2 mx-3 px-2 py-1" onClick={() => {
                  const index = branchList.findIndex((b: any) => b._id === selectedBranch);
                  const prevIndex = index !== -1
                    ? (index - 1 + branchList.length) % branchList.length
                    : -1;

                  const prevBranch = branchList[prevIndex]?._id || null;

                  if (prevBranch) {
                    setSelectedBranch(prevBranch);

                    const nextBranch = branchList[(prevIndex + 1) % branchList.length]?._id || null;
                    setSelectedBranch2(nextBranch);
                  }
                }}
              >
                <ChevronLeftIcon width="20" />
              </div>

              <div className="text-3xl" style={{color: currentBranch?.colorcode}}>{currentBranch?.branchname}</div>

              {/* Next Branch */}
              <div role="button" className="border-2 mx-3 px-2 py-1"
                onClick={() => {
                  const index = branchList.findIndex((b: any) => b._id === selectedBranch);
                  const nextIndex = index !== -1
                    ? (index + 1) % branchList.length
                    : -1;

                  const nextBranch = branchList[nextIndex]?._id || null;

                  if (nextBranch) {
                    setSelectedBranch(nextBranch);

                    const followingBranch = branchList[(nextIndex + 1) % branchList.length]?._id || null;
                    setSelectedBranch2(followingBranch);
                  }
                }}
              >
                <ChevronRightIcon width="20" />
              </div>
            </div>

            <div className="w-1/4" style={{color: followingBranch?.colorcode}}>
              <div className="pb-2 text-end">Available in {followingBranch?.branchname} </div>
              <div className="flex items-center justify-end gap-3">
                {Object.keys(assets2)?.map((item: any, index: number) => (
                  <div key={index} className="flex items-start"> 
                    {assets2[item][0]?.assetTypeId?.image && <Image src={assets2[item][0]?.assetTypeId?.image} width={20} height={20} alt="Asset Image" />}
                    {item === "employees" && <AvatarGroup className="me-1" isBordered renderCount={() => <></>}>
                      {assets2[item].length ? assets2[item]?.map((item:any) => (
                        <Avatar key={item._id} src={item.image} size="sm" style={{width: "25px", height: "25px"}} />
                      )) : <PersonIcon width={20} />}
                    </AvatarGroup>}
                    <small style={{fontSize: "18px"}} className="ms-1 rounded-full">{assets2[item]?.length}</small> 
                  </div>
                ))}
              </div>
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
              min={new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), 9, 0)} // 10 AM
              max={new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), 21, 0)} // 7 PM
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
                  start: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), currentBranch?.openingAt, 0), // 10:00 AM
                  end: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), currentBranch?.closingAt, 0), // 5:00 PM
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
      {event.event.title != "Shift Time" && <div className={`flex ${event.event.duration < 40 ? "flex-row":"flex-col h-full justify-center"} items-center gap-1`}>
        <small>{event.event.duration}m</small>
        <div>
          {event?.event?.assetType?.image ? <Image src={event?.event?.assetType?.image} width={30} height={30} alt="Asset Image" /> : <CloseIcon width={30} height={30} color={"gray"} />}
        </div>
        
        <small>{event?.event?.assetNumber || "N/A"}</small>
      </div>}
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
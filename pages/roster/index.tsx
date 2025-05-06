/* eslint-disable @typescript-eslint/no-explicit-any */
import { BRANCH_API_URL, GROUP_API_URL, ROSTER_API_URL, SHIFTS_API_URL } from '@/core/utilities/api-url';
import { PlusIcon, SaveIcon } from '@/core/utilities/svgIcons';
import { Avatar, AvatarGroup, Button, Card, CardHeader, Checkbox, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Progress, useDisclosure } from '@heroui/react';
import React, { lazy, Suspense } from 'react'
import { toast } from 'react-toastify';
import {parseDate} from "@internationalized/date";
import moment from 'moment';
const GroupView = lazy(() => import("@/pages/roster/group-view"));




export default function Shifts() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };

  const [branchList, setBranchList] = React.useState<any>([]);
  const [latestRoster, setLatestRoster] = React.useState<any>(null);
  const [shiftList, setShiftList] = React.useState<any>([]);
  const [rosterData, setRosterData] = React.useState<any>([]);
  const [groupList, setGroupList] = React.useState<any>([]);
  const [fromDate, setFromDate] = React.useState<any>(parseDate(new Date().toISOString().split("T")[0]));
  const [toDate, setToDate] = React.useState<any>(parseDate(moment().add(5, 'days').format('YYYY-MM-DD')));
  const [selectedDate, setSelectedDates] = React.useState<any>([]);
  const [pageRefresh, setPageRefresh] = React.useState(false)
  const [isLoading, setLoading] = React.useState(false)
  
  // on selected group
  const [selectedGroup, setSelectedGroup] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<any>(null);
  const [selectedShift, setSelectedShift] = React.useState<any>(null);
  const [selectedDateFor, setSelectedDateFor] = React.useState<any>(null);

  React.useEffect(() => {
    getBranchList();
    getShiftList();
    getGroupsList();
    getLatestRoster()
  }, [pageRefresh])

  
  React.useEffect(() => {
    if(fromDate && toDate) {
      getRosterData();
      setSelectedDates(getDatesBetween())
    }
  }, [fromDate, toDate, pageRefresh])


  const getLatestRoster = async () => {
    try {
      const roster = await fetch(`${ROSTER_API_URL}/latest-roster`)
      const parsed = await roster.json();
      setLatestRoster(parsed);
    }catch(err:any) { toast.error(err.error) }
  }

  const getBranchList = async () => {
    try {
      const branches = await fetch(BRANCH_API_URL)
      const parsed = await branches.json();
      setBranchList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }

  
  const getDatesBetween = () => {
    if(!fromDate || !toDate) return []
    const dates = [];
    const currentDate = new Date(fromDate);
  
    while (currentDate <= new Date(toDate)) {
      dates.push(new Date(currentDate).toISOString());
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }
  
  const getShiftList = async () => {
    try {
      const shifts = await fetch(`${SHIFTS_API_URL}`)
      const parsed = await shifts.json();
      setShiftList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }

  const getRosterData = async () => {
    try {
      const roster = await fetch(`${ROSTER_API_URL}?startDate=${fromDate}&endDate=${toDate}`)
      const parsed = await roster.json();
      setRosterData(parsed);
    }catch(err:any) { toast.error(err.error) }
  }
  
  const getGroupsList = async () => {
    try {
      const shifts = await fetch(`${GROUP_API_URL}`)
      const parsed = await shifts.json();
      setGroupList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }
  
  const creatUpdateRoster = async (dateFor: string,shift:any, groupId:string, type: string = "") => {
    const date = moment(new Date(dateFor)).format("YYYY-MM-DD")
    try {
      setLoading(true)
      const branch = await fetch(`${ROSTER_API_URL}`, {
        method: "POST",
        body: JSON.stringify({groupId, branchId: shift.branchId, shiftId: shift._id, dateFor: date, type}),
        headers: { "Content-Type": "application/json" }
      })
      const parsed = await branch.json();
      if(parsed) {
        setLoading(false)
        setPageRefresh(val => !val)
        type === "delete" && onOpenChange()
      }
    } catch (err:any) {
      setLoading(false)
      console.log(err);
    }
  }

  
  const cloneRoster = async () => {
    if(!fromDate || !toDate) return;
    const start = moment(fromDate, "YYYY-MM-DD");
    const end = moment(toDate, "YYYY-MM-DD");
    const daysToClone = end.diff(start, 'days') + 1;

    const appliedStart = end.clone().add(1, "days").format("YYYY-MM-DD")
    const appliedEnd = end.clone().add(daysToClone, "days").format("YYYY-MM-DD")
    const tillDate = latestRoster?.dateFor.split("T")[0]

    const confirm = window.confirm(`Roster created till ${tillDate} \nRoster will be cloned from ${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")} \nRoster will be applied from ${appliedStart} to ${appliedEnd} ( ${daysToClone} days ) \nAre you sure ?`)
    if(!confirm) return;

    
    try {
      setLoading(true)
      const branch = await fetch(`${ROSTER_API_URL}/clone-roster`, {
        method: "POST",
        body: JSON.stringify({startDate: start.format("YYYY-MM-DD"), endDate: end.format("YYYY-MM-DD")}),
        headers: { "Content-Type": "application/json" }
      })
      const parsed = await branch.json();
      console.log(parsed);
      
      if(parsed) {
        setLoading(false)
        setPageRefresh(val => !val)
      }
    } catch (err:any) {
      setLoading(false)
      console.log(err);
    }
  }


  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange();
  }

  return (
    <section>
      <div className="flex items-center justify-between px-5 my-3">

        <div className="w-1/4 flex items-center gap-2">
          <DatePicker label="From Date" variant="bordered" value={fromDate} onChange={(val) => setFromDate(val)} />
          <DatePicker label="To Date" variant="bordered" value={toDate} onChange={(val) => setToDate(val)} />
        </div>

        <div className="w-2/4 text-center">
          <h1 className="text-4xl">Roster Creation</h1>
          <div className="text-gray-500">Roster created till {latestRoster?.dateFor.split("T")[0]} </div>
        </div>

        <div className="w-1/4 text-end">
          <Button color="primary" variant="bordered" size="lg" type="button" onPress={() => cloneRoster()}> <SaveIcon width={20} height={20} /> Clone Roster</Button>
        </div>
        
      </div>
      


      {isOpen && (
        <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
          <GroupView isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}
          group={selectedGroup} branchId={selectedBranch._id} dateFor={selectedDateFor}
          onDelete={() => creatUpdateRoster(selectedDateFor, selectedShift, selectedGroup._id, "delete")}
          />
        </Suspense>
      )}
      
      {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      <div className="flex items-start justify-between bg-white rounded shadow" style={{width: "calc(100vw - 300px)", height: "calc(100vh - 100px)", margin: "0 auto", overflow: "auto"}}>
        {/* <PageTitle title="Roster Creation" /> */}
        {branchList.length ? <div className="text-center h-full" style={{minWidth: "220px"}}>
          <div className="w-full p-3 border-b-2 border-e-2 flex items-center justify-center gap-2">
            <div className="text-2xl">Dates</div>  
          </div>
          <div className="py-6 flex justify-center h-full border-e-2">
            {/* <CheckboxGroup value={selectedDate} style={{marginTop: "35px"}}>
            </CheckboxGroup> */}
            <div className="flex flex-col" style={{marginTop: "40px"}}>
              {selectedDate?.map((item: any) => <Checkbox key={item} value={item} isSelected={item} style={{height: "50px", margin: 0 , padding: 0, display: "inline-block"}}>{moment(item).format("MM-DD-yyyy")}</Checkbox>)}
            </div>

          </div>
        </div> : <></>}
        
        {branchList.map((branch:any) => <div key={branch._id} className="text-center h-full w-full">
          
          <div className="w-full p-3 border-b-2 border-e-2 flex items-center justify-center gap-2">
            <Avatar src={branch?.image} size="sm"/>
            <div className="text-2xl" style={{color: branch.colorcode}}>{branch.branchname}</div>  
          </div>
          <div className="flex items-start justify-between" style={{height: "calc(100vh - 180px)"}}>
            {shiftList.map((shift:any) => shift.branchId === branch._id && <div key={shift._id} className="px-3 w-full h-full border-e-2">
              <div className="text-lg py-3">{shift.shiftname}</div>

              {selectedDate?.map((date:any) => {

                const currentRoster = rosterData?.find((item:any) => item.shiftId === shift._id && moment(item?.dateFor).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD"))
                
                return <section key={date} className="flex items-center gap-2" style={{height: "50px", minWidth: "300px"}}>

                  {currentRoster?.groups?.map((group:any) => {

                    return <Card key={group._id} className="shadow-sm border-2">
                      <CardHeader className="justify-start" onClick={() => {
                      console.log("clicked");
                      
                      setSelectedGroup(group)
                      setSelectedBranch(branch)
                      setSelectedShift(shift)
                      setSelectedDateFor(moment(date).format("YYYY-MM-DD"))
                      handleOpen();
                    }}>
                        <div className="flex items-center px-4">
                          {group?.employeesData.map((employee:any) => <AvatarGroup key={employee._id} isBordered max={2}>
                            <Avatar size="sm" src={employee?.image} style={{marginLeft: "-15px", width: "20px", height: "20px"}} />
                          </AvatarGroup>)}
                        </div>
                        <h4 className="text-small font-semibold leading-none text-default-600" style={{whiteSpace: "nowrap"}}>{group.groupname}</h4>
                      </CardHeader>
                    </Card>
                  })}
                  
                  
                  
                  
                  {/* <TransferComponent key={group._id} {...group} branchId={branch._id} dateFor={date} onDelete={() => creatUpdateRoster(date, shift, group._id, "delete")} />)} */}
                  
                  <Dropdown placement="bottom">
                    <DropdownTrigger>
                      <div className="p-2 border-2 rounded"> <PlusIcon width={15} height={15} /> </div>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                      {groupList
                      // .filter((item:any) => !shift.groups.map((x:any) => x._id).includes(item._id))
                      .map((group:any) => <DropdownItem key={group.groupname} onPress={() => creatUpdateRoster(date, shift, group._id)}>
                        {group.groupname}
                      </DropdownItem>)}
                    </DropdownMenu>
                  </Dropdown>
                
                </section>


              })}

            </div>)}
          </div>
          
        </div>)}

      </div>
    </section>
  )
}





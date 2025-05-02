/* eslint-disable @typescript-eslint/no-explicit-any */
import { BRANCH_API_URL, GROUP_API_URL, ROSTER_API_URL, SHIFTS_API_URL } from '@/core/utilities/api-url';
import { CloseIcon, PlusIcon, SaveIcon } from '@/core/utilities/svgIcons';
import { Avatar, AvatarGroup, Button, Card, CardHeader, Checkbox, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger, Progress } from '@heroui/react';
import React from 'react'
import { toast } from 'react-toastify';
import {parseDate} from "@internationalized/date";
import moment from 'moment';



export default function Shifts() {
  const [branchList, setBranchList] = React.useState<any>([]);
  const [shiftList, setShiftList] = React.useState<any>([]);
  const [rosterData, setRosterData] = React.useState<any>([]);
  const [groupList, setGroupList] = React.useState<any>([]);
  const [fromDate, setFromDate] = React.useState<any>(parseDate(new Date().toISOString().split("T")[0]));
  const [toDate, setToDate] = React.useState<any>(parseDate(new Date().toISOString().split("T")[0]));
  const [selectedDate, setSelectedDates] = React.useState<any>([]);
  const [pageRefresh, setPageRefresh] = React.useState(false)
  const [isLoading, setLoading] = React.useState(false)


  React.useEffect(() => {
    getBranchList();
    getShiftList();
    getGroupsList()
  }, [pageRefresh])

  
  React.useEffect(() => {
    if(fromDate && toDate) {
      getRosterData();
      setSelectedDates(getDatesBetween())
    }
  }, [fromDate, toDate, pageRefresh])


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
      }
    } catch (err:any) {
      setLoading(false)
      console.log(err);
    }
  }


  return (
    <section>
      <div className="flex items-center justify-between px-5 my-3">

        <div className="w-1/4 flex items-center gap-2">
          <DatePicker label="From Date" variant="bordered" value={fromDate} onChange={(val) => setFromDate(val)} />
          <DatePicker label="To Date" variant="bordered" value={toDate} onChange={(val) => setToDate(val)} />
        </div>

        <h1 className="w-2/4 text-center text-4xl py-3">Roster Creation</h1>

        <div className="w-1/4 text-end">
          <Button color="primary" variant="bordered" size="lg" type="button"> <SaveIcon width={20} height={20} /> Clone Roster</Button>
        </div>
        
      </div>
      
      {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      <div className="flex items-start justify-between bg-white rounded shadow" style={{width: "calc(100vw - 300px)", height: "calc(100vh - 100px)", margin: "0 auto", overflow: "auto"}}>
        {/* <PageTitle title="Roster Creation" /> */}
        <div className="text-center h-full" style={{minWidth: "220px"}}>
          <div className="w-full p-3 border-b-2 border-e-2 flex items-center justify-center gap-2">
            <div className="text-2xl">Dates</div>  
          </div>
          <div className="py-6 flex justify-center h-full border-e-2">
            {/* <CheckboxGroup value={selectedDate} style={{marginTop: "35px"}}>
            </CheckboxGroup> */}
            <div className="flex-1 items-center justify-center" style={{marginTop: "28px"}}>
              {selectedDate?.map((item: any) => <Checkbox key={item} value={item} isSelected={item} style={{height: "70px", margin: 0 , padding: 0}}>{moment(item).format("MM-DD-yyyy")}</Checkbox>)}
            </div>

          </div>
        </div>
        
        {branchList.map((branch:any) => <div key={branch._id} className="text-center h-full">
          
          <div className="w-full p-3 border-b-2 border-e-2 flex items-center justify-center gap-2">
            <Avatar src={branch?.image} size="sm"/>
            <div className="text-2xl" style={{color: branch.colorcode}}>{branch.branchname}</div>  
          </div>
          <div className="flex items-start justify-between" style={{height: "calc(100vh - 180px)"}}>
            {shiftList.map((shift:any) => shift.branchId === branch._id && <div key={shift._id} className="px-3 w-full h-full border-e-2" style={{minWidth: "300px"}}>
              <div className="text-lg py-3">{shift.shiftname}</div>

              {selectedDate?.map((date:any) => {

                const currentRoster = rosterData?.find((item:any) => item.shiftId === shift._id && item?.dateFor === moment(date).format("YYYY-MM-DD"))
                
                return <section key={date} className="flex items-center gap-2" style={{height: "70px"}}>

                  {currentRoster?.groups?.map((group:any) => <GroupCard key={group._id} {...group} onDelete={() => creatUpdateRoster(date, shift, group._id, "delete")} />)}
                  
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



const GroupCard = (props:any) => {
  return (
    <Popover placement="bottom" backdrop="opaque">
      <PopoverTrigger>
        <Card className="shadow-sm border-2">
          <CardHeader className="justify-start">
            <div className="flex items-center gap-2 px-4">
              {props?.employeesData.map((employee:any) => <AvatarGroup key={employee._id} isBordered max={2}>
                <Avatar size="sm" src={employee?.image} style={{marginLeft: "-15px", width: "20px", height: "20px"}} />
              </AvatarGroup>)}
            </div>
            <h4 className="text-small font-semibold leading-none text-default-600" style={{whiteSpace: "nowrap"}}>{props.groupname}</h4>
          </CardHeader>
        </Card>
      </PopoverTrigger>
      <PopoverContent>
        {/* <h2 className="text-2xl">Staffs</h2> */}
        <div className="cursor-pointer flex items-center gap-2 py-2 ms-auto" onClick={props.onDelete}>
          Delete group from roster
          <CloseIcon width="20" height="20" />  
        </div> 
        <div className="flex-1 px-4">
          {props?.employeesData.map((employee:any) => <div key={employee._id} className="flex items-center gap-2 p-2">
            <Avatar size="md" src={employee?.image} style={{marginLeft: "-15px"}} />
            <div>
              <div className="text-lg"> {employee?.firstname} {employee?.lastname} </div>
              <div className="text-sm"> {employee?.email} </div>
            </div>
            <Button className="ms-auto" variant="bordered">Transfer</Button>
          </div>)}
        </div>
      </PopoverContent>
    </Popover>
  );
}

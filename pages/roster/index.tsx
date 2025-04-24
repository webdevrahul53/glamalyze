/* eslint-disable @typescript-eslint/no-explicit-any */
import { BRANCH_API_URL, GROUP_API_URL, SETTINGS_API_URL, SHIFTS_API_URL } from '@/core/utilities/api-url';
import { CloseIcon, PlusIcon, SaveIcon } from '@/core/utilities/svgIcons';
import { Avatar, AvatarGroup, Button, Card, CardHeader, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Progress } from '@heroui/react';
import React from 'react'
import { toast } from 'react-toastify';
import {parseDate} from "@internationalized/date";



export default function Shifts() {
  const [branchList, setBranchList] = React.useState<any>([]);
  const [shiftList, setShiftList] = React.useState<any>([]);
  const [groupList, setGroupList] = React.useState<any>([]);
  const [rosterStartDate, setRosterStartDate] = React.useState<any>(parseDate(new Date().toISOString().split("T")[0]));
  const [rosterEndDate, setRosterEndDate] = React.useState<any>(parseDate(new Date().toISOString().split("T")[0]));
  const [pageRefresh, setPageRefresh] = React.useState(false)
  const [isLoading, setLoading] = React.useState(false)


  React.useEffect(() => {
    getBranchList();
    getShiftList();
    getGroupsList()
    getSettings()
  }, [pageRefresh])


  const getSettings = async () => {
    try {
      const settings = await fetch(`${SETTINGS_API_URL}/globalSettings`)
      const parsed = await settings.json();
      console.log(parsed);
      setRosterStartDate(parseDate(new Date(parsed.rosterStartDate).toISOString().split("T")[0]))
      setRosterEndDate(parseDate(new Date(parsed.rosterEndDate).toISOString().split("T")[0]))
    }catch(err:any) { toast.error(err.error) }
  }

  const getBranchList = async () => {
    try {
      const branches = await fetch(BRANCH_API_URL)
      const parsed = await branches.json();
      setBranchList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }

  
  const getShiftList = async () => {
    try {
      const shifts = await fetch(`${SHIFTS_API_URL}/roster`)
      const parsed = await shifts.json();
      setShiftList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }
  
  const getGroupsList = async () => {
    try {
      const shifts = await fetch(`${GROUP_API_URL}`)
      const parsed = await shifts.json();
      setGroupList(parsed);
    }catch(err:any) { toast.error(err.error) }
  }

  const onSubmit = async () => {
    const start = new Date(rosterStartDate).toISOString();
    const end = new Date(rosterEndDate).toISOString();
    
    if(!start || !end) return;
    if(end < start) toast.error("End date must be greater than start date")
    setLoading(true)
    
    try {
      const settings = await fetch(`${SETTINGS_API_URL}/globalSettings`, {
        method: "PATCH",
        body: JSON.stringify({rosterStartDate: start, rosterEndDate: end}),
        headers: { "Content-Type": "application/json" }
      })
      const parsed = await settings.json();
      if(parsed.status){
        setLoading(false)
        setPageRefresh(val => !val)
      }
    } catch (err:any) {
      setLoading(false)
      console.log(err);
    }
  }
  
  const assignGroupToShift = async (shiftId:any, groupId:string, type: string = "reset") => {
    try {
      setLoading(true)
      const branch = await fetch(`${SHIFTS_API_URL}/${shiftId}?type=${type}`, {
        method: "PUT",
        body: JSON.stringify({groupId}),
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

        <div className="flex items-center gap-3 w-1/4">
          <DatePicker label="From Date" variant="bordered" value={rosterStartDate} onChange={(val) => setRosterStartDate(val)} />
          <DatePicker label="To Date" variant="bordered" value={rosterEndDate} onChange={(val) => setRosterEndDate(val)} />
        </div>

        <h1 className="w-2/4 text-center text-4xl py-3">Roster Creation</h1>

        <div className="w-1/4 text-end">
          <Button color="primary" size="lg" type="button" onPress={() => onSubmit()}> <SaveIcon color="white" width={20} height={20} /> Save</Button>
        </div>
        
      </div>
      
      {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      <div className="flex items-start justify-between bg-white rounded shadow" style={{width: "calc(100vw - 300px)", height: "calc(100vh - 100px)", margin: "0 auto", overflow: "auto"}}>
        {/* <PageTitle title="Roster Creation" /> */}
        {branchList.map((branch:any) => <div key={branch._id} className="text-center h-full" style={{minWidth: "600px"}}>
          
          <div className="w-full p-3 border-b-2 border-e-2 flex items-center justify-center gap-2">
            <Avatar src={branch?.image} size="sm"/>
            <div className="text-2xl" style={{color: branch.colorcode}}>{branch.branchname}</div>  
          </div>
          <div className="flex items-start justify-between" style={{height: "calc(100vh - 180px)"}}>
            {shiftList.map((shift:any) => shift.branchId === branch._id && <div key={shift._id} className="px-3 w-full h-full border-e-2">
              <div className="text-lg py-3">{shift.shiftname}</div>
              {shift?.groups.length ? shift?.groups?.map((group:any) => <GroupCard key={group._id} {...group} onDelete={() => assignGroupToShift(shift._id, group._id, "delete")} />) : <></>}
              
              <Dropdown placement="bottom">
                <DropdownTrigger>
                  <Button color="default" variant="bordered">Add Group <PlusIcon width={15} height={15} /> </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  {groupList
                  .filter((item:any) => !shift.groups.map((x:any) => x._id).includes(item._id))
                  .map((group:any) => <DropdownItem key={group.groupname} onPress={() => assignGroupToShift(shift._id, group._id)}>
                    {group.groupname}
                  </DropdownItem>)}
                </DropdownMenu>
              </Dropdown>

            </div>)}
          </div>
          
        </div>)}

      </div>
    </section>
  )
}



const GroupCard = (props:any) => {
  return (
    <Card className="w-full shadow-sm border-2 my-2">
      <CardHeader className="justify-between">
        <div className="flex px-4">
          {props?.employeesData.map((employee:any) => <AvatarGroup key={employee._id} isBordered max={2}>
            <Avatar src={employee?.image} style={{marginLeft: "-15px"}} />
          </AvatarGroup>)}
          <div className="flex flex-col gap-1 items-start justify-center ms-3">
            <h4 className="text-small font-semibold leading-none text-default-600">{props.groupname}</h4>
            {/* <h5 className="text-small tracking-tight text-default-400"> <strong> {props.email || props.createdAt}</strong> </h5> */}
          </div>
        </div>
        <div className="cursor-pointer" onClick={props.onDelete}>
          <CloseIcon width="20" height="20" />  
        </div> 
      </CardHeader>
    </Card>
  );
}

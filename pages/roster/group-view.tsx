/* eslint-disable @typescript-eslint/no-explicit-any */

import { APPOINTMENT_SERVICES_API_URL, TRANSFERRED_EMPLOYEES_API_URL } from "@/core/utilities/api-url";
import { DeleteIcon } from "@/core/utilities/svgIcons";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Progress, useDisclosure } from "@heroui/react";
import moment from "moment";
import React, { lazy, Suspense } from "react";
import { toast } from "react-toastify";
const TransferComponent = lazy(() => import("@/pages/roster/transfer"));

export default function GroupView(props:any) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleOpen = () => { onOpen(); };

    const [selectedEmployee, setSelectedEmployee] = React.useState<any>()
    const [transferredEmployee, setTransferredEmployee] = React.useState<any>([])
    const [personalBookingEmployee, setPersonalBookingEmployee] = React.useState<any>([])

    // console.log(props.group)
    React.useEffect(() => {
        if(!props.dateFor) return;
        getTransferredEmployee()
        getEmployees();
    }, [props.dateFor])

    
    
    const getEmployees = async () => {
        const dateFor = moment(new Date(props.dateFor)).format("YYYY-MM-DD")
        const groupId = props.group._id;
        try {
          const employees = await fetch(`${APPOINTMENT_SERVICES_API_URL}/personal-booking?dateFor=${dateFor}&groupId=${groupId}`)
          const parsed = await employees.json();
          const obj: any = {};
          parsed.employees.forEach((emp:any) => {
            obj[emp._id] = emp.count
          })
          setPersonalBookingEmployee(obj)
        }catch(err:any) { toast.error(err.error) }
    }
    
    const getTransferredEmployee = async () => {
        const dateFor = moment(new Date(props.dateFor)).format("YYYY-MM-DD")
        try {
          const transfer = await fetch(`${TRANSFERRED_EMPLOYEES_API_URL}?dateFor=${dateFor}`)
          const parsed = await transfer.json();
          
          setTransferredEmployee(parsed);
        }catch(err:any) { toast.error(err.error) }
    }

  
    const onDrawerClose = () => {
        // setPageRefresh((val) => !val)
        onOpenChange();
        getTransferredEmployee();
    }

    return (<Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        <DrawerContent>
            {() => (
            <>
                <DrawerHeader className="flex flex-col gap-1"> 
                    <div className="text-gray-500 text-sm">{moment(props.dateFor).toDate().toDateString()}</div>    
                    <div> {props.group.groupname}</div>  
                </DrawerHeader>
                <DrawerBody> 
                    <div className="flex flex-col">
                        <div> <strong>Branch :</strong> {props.branch.branchname}</div>  
                        <div> <strong>Shift : </strong> {props.shift.shiftname} ({props.shift.timing}) </div>
                    </div>
                        

                    
                    {isOpen && (
                        <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
                            <TransferComponent isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()} 
                            employee={selectedEmployee} dateFor={props.dateFor} branchId={props.branch._id} 
                            />
                        </Suspense>
                    )}

                    <div>
                        {transferredEmployee.length ? <h2>Transferred Emplyee</h2> : <></>}
                        {transferredEmployee.map((item:any, index: number) => <div key={index}> {item?.groupEmployees[0]?.firstname} {item?.groupEmployees[0]?.lastname} ( {item?.openingAt} - {item?.closingAt} ) </div>)}
                    </div>
                    
                    <div className="flex-1 px-4">
                        {props?.group?.employeesData.map((employee: any) => {
                            return (
                                <div key={employee._id} className="flex items-center gap-2 p-2">
                                    <Avatar size="sm" src={employee?.image} style={{ marginLeft: "-15px" }} />
                                    <div className="me-6">
                                        <div className="text-md">{employee?.firstname} {employee?.lastname}</div>
                                        <div className="text-sm text-gray-600">{employee?.email}</div>
                                    </div>
                                    {personalBookingEmployee[employee._id] > 0 && (
                                        <div className="text-sm text-blue-600 ms-auto flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                                            <span className="font-semibold">PB</span>
                                            <sup className="text-sm text-blue-800 -mt-2 bg-blue-800 text-light px-1 rounded">{personalBookingEmployee[employee._id]}</sup>
                                        </div>
                                    )}
                                    <Button className="ms-auto" size="sm" onPress={() => {
                                        setSelectedEmployee(employee)
                                        handleOpen()
                                    }}>Transfer</Button>
                                </div>
                            );
                        })}

                    </div>

                    <div className="cursor-pointer flex items-center gap-2 py-2 ms-auto mb-3" onClick={props.onDelete}>
                        Delete group from roster
                        <DeleteIcon width="20" height="20" color="red" />  
                    </div> 
                </DrawerBody>
            </>
            )}
        </DrawerContent>
    </Drawer>
    );
  }
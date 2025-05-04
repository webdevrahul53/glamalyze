/* eslint-disable @typescript-eslint/no-explicit-any */

import { TRANSFERRED_EMPLOYEES_API_URL } from "@/core/utilities/api-url";
import { CloseIcon } from "@/core/utilities/svgIcons";
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

    React.useEffect(() => {
        if(!props.dateFor) return;
        getTransferredEmployee()
    }, [props.dateFor])
    
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
                    <div>{props.group.groupname}</div>    
                </DrawerHeader>
                <DrawerBody> 

                    
                    {isOpen && (
                        <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
                            <TransferComponent isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()} 
                            employee={selectedEmployee} dateFor={props.dateFor}   
                            />
                        </Suspense>
                    )}

                    <div>
                        {transferredEmployee.length ? <h2>Transferred Emplyee</h2> : <></>}
                        {transferredEmployee.map((item:any, index: number) => <div key={index}> {item?.groupEmployees[0]?.firstname} {item?.groupEmployees[0]?.lastname} ( {item?.openingAt} - {item?.closingAt} ) </div>)}
                    </div>
                    
                    <div className="cursor-pointer flex items-center gap-2 py-2 ms-auto" onClick={props.onDelete}>
                        Delete group from roster
                        <CloseIcon width="20" height="20" />  
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
                                    <Button className="ms-auto" size="sm" onPress={() => {
                                        setSelectedEmployee(employee)
                                        handleOpen()
                                    }}>Transfer</Button>
                                </div>
                            );
                        })}

                    </div>

                </DrawerBody>
            </>
            )}
        </DrawerContent>
    </Drawer>
    );
  }
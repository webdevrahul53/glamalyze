import React, { lazy, Suspense } from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Progress, Textarea, useDisclosure } from "@heroui/react";
import { ChairIcon, CheckIcon, DoorOpenIcon, PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import AvatarSelect from "../common/avatar-select";
import {parseDate} from "@internationalized/date";
import { APPOINTMENT_SERVICES_API_URL, APPOINTMENTS_API_URL, BRANCH_API_URL, CUSTOMERS_API_URL, ROSTER_API_URL, SERVICES_API_URL, SETTINGS_API_URL, SHIFTS_API_URL, TRANSFERRED_EMPLOYEES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
import moment from "moment";
import ServiceCard from "../common/servicd-card";
import PaxServiceList from "./pax-service-list";
import { useSelector } from "react-redux";
const AddEditCustomer = lazy(() => import("@/core/drawer/add-edit-customer"));


const statusCSS: any = {
  Pending: "bg-gray-200 text-gray-800 border-gray-500",
  CheckIn: "bg-teal-200 text-teal-800 border-teal-500",
  Checkout: "bg-purple-200 text-purple-800 border-purple-500",
  Completed: "bg-green-200 text-green-800 border-green-500",
  Cancelled: "bg-red-200 text-red-800 border-red-500",
}


const NewAppointment = (props:any) => {
    const user = useSelector((state:any) => state.user.value)
    const { register, handleSubmit, watch, formState: { errors }, control, setValue, reset } = useForm({
      defaultValues: {
        appointmentDate: parseDate(new Date().toISOString().split("T")[0]), 
        startTime: null, 
        branchId: null, 
        customerId: null, 
        pax: [ [{serviceId: null, startTime: null, durationList: [], duration: null, price: 0, assetId: null, assetTypeId: null, assetList: [], busyEmployees: [], employeeList: [], employeeId: []}] ],
        note: null,
        paymentMethod: "Cash"
      }
    });
    const { fields: paxFields, append: addPax, remove: removePax } = useFieldArray({
      control,
      name: "pax",
    });
  

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleOpen = () => { onOpen(); };
    const [loading, setLoading] = React.useState(false)
    const [selectedAppointment, setSelectedAppointment] = React.useState<any>();
    const [branchList, setBranchList] = React.useState<any>([]);
    const [allServiceList, setAllServiceList] = React.useState([]);
    const [employeeList, setEmployeeList] = React.useState([]);
    const [shiftData, setShiftData] = React.useState([]);
    const [transferredEmployee, setTransferredEmployee] = React.useState<any>([])
    const [customerList, setCustomerList] = React.useState([]);
    const [serviceList, setServiceList] = React.useState([]);
    const [totalAmount, setTotalAmount] = React.useState<any>(0)
    const [selectedTab, setSelectedTab] = React.useState<any>(0)

    
    const customerId = useWatch({ control, name: "customerId" });
    const branchId = useWatch({ control, name: "branchId" });
    const appointmentDate = useWatch({ control, name: "appointmentDate" });
    const startTime: any = useWatch({ control, name: "startTime" });
    const paymentMethod = useWatch({ control, name: "paymentMethod" });
    const pax = useWatch({ control, name: "pax" });
    

    const currentDate = new Date();

    React.useEffect(() => {
      const branchId = user?.defaultBranch;
      setValue("branchId", branchId || branchList[0]?._id)
    },[branchList])
    
    React.useEffect(() => {
      if(!branchId) return;
      getRosterByBranchId(branchId)
      getTransferredEmployee(branchId)
    },[branchId, appointmentDate])

    React.useEffect(() => {
      if(props?.bookings?.appointmentId){
        getBookingsById(props?.bookings?.appointmentId)
      }else {

      }
      getCustomerList();
      getBranchList();
      getServiceList();
    }, [props?.bookings])

    React.useEffect(() => {
      filterEmployeesAndServices()
    }, [shiftData, startTime])

    // For calendar purpose
    React.useEffect(() => {
      const dateValue = selectedAppointment?.appointmentDate || props?.selectedTime || currentDate
      const timeValue = selectedAppointment?.startTime || new Date(props?.selectedTime || currentDate).toLocaleTimeString()
      const date = parseDate(new Date(dateValue)?.toISOString().split("T")[0])
      const time: any = convertTo24HourFormat(timeValue)
      // console.log(time);
      
      setValue("appointmentDate", date)
      setValue("startTime", time)
    }, [selectedAppointment, props?.selectedTime])

    React.useEffect(() => {
      const totalSum = pax.flat().reduce((sum, item: any) => sum + (item?.price || 0), 0);
      setTotalAmount(totalSum)
    },[pax])
    
    const resetPax = () => {
      setValue("pax", [ [{serviceId: null, startTime: null, durationList: [], duration: null, price: 0, assetId: null, assetTypeId: null, assetList: [], busyEmployees: [], employeeList: [], employeeId: []}] ])
    }
  

    const getBookingsById = async (id: string) => {
      if(!id) return;
      try {
        const branches = await fetch(`${APPOINTMENTS_API_URL}/${id}`)
        let parsed = await branches.json();
        setSelectedAppointment(parsed)

        parsed.pax = Object.values(
          parsed.pax.reduce((acc: any, item: any) => {
            acc[item.paxId] = acc[item.paxId] || [];
            acc[item.paxId].push(item);
            return acc;
          }, {})
        );

        const {appointmentDate, startTime, branchId, customerId, pax, note, paymentMethod} = parsed
        // const defaultServiceIndex = pax.flat().findIndex((item:any) => item.serviceId === "67fcbfc92e5d5efc267985b0")
        // const paxData = defaultServiceIndex === -1 ? pax : [[]]
        const formData = {
          appointmentDate: parseDate(new Date(appointmentDate).toISOString().split("T")[0]), 
          startTime, branchId, customerId, pax, note, paymentMethod
        }
        reset(formData)
        getRosterByBranchId(branchId)
        
      }catch(err:any) { toast.error(err.message) }

    }

    
    // Helper function to get the next time slot
    const getNextTimeSlot = (time: string, interval: number) => {
      let [hour, minute] = time.split(":").map(Number);
      minute += interval;
  
      // Handle minute overflow
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
    
      // Handle hour overflow (to keep within 24-hour format)
      hour = hour % 24;
    
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    };
    

    const getBranchList = async () => {
      try {
          const branches = await fetch(BRANCH_API_URL)
          const parsed = await branches.json();
          setBranchList(parsed);
        }catch(err:any) { toast.error(err.message) }
    }
    
    const getServiceList = async () => {
      try {
          const services = await fetch(SERVICES_API_URL)
          const parsed = await services.json();
          setAllServiceList(parsed);
        }catch(err:any) { toast.error(err.message) }
    }
    
    const getRosterByBranchId = async (id: string) => {
      if(!id) return;
      try {
          const branches = await fetch(`${ROSTER_API_URL}/employee-services?branchId=${id}&dateFor=${appointmentDate}`)
          const parsed = await branches.json();
          setShiftData(parsed)
        }catch(err:any) { toast.error(err.message) }
    }

    const getTransferredEmployee = async (id: string) => {
      if(!id) return;
      try {
        const transfer = await fetch(`${TRANSFERRED_EMPLOYEES_API_URL}?branchId=${id}&dateFor=${appointmentDate}`)
        let parsed = await transfer.json();
        
        setTransferredEmployee(parsed);
      }catch(err:any) { toast.error(err.error) }
    }

    const getCustomerList = async () => {
      try {
          const customers = await fetch(CUSTOMERS_API_URL)
          const parsed = await customers.json();
          setCustomerList(parsed);
        }catch(err:any) { toast.error(err.message) }
    }
  
    const filterEmployeesAndServices = () => {
      const time: number = +startTime?.split(":")[0]
      const shifts = shiftData.filter((item:any) => time >= item.openingAt && time < item.closingAt)
      const transferred = transferredEmployee.filter((item:any) => time >= item.openingAt && time < item.closingAt)
      const arr = [...shifts, ...transferred]
      
      const employees: any = Array.from(new Map(arr.map((item: any) => item.groupEmployees).flat().map((emp: any) => [emp._id, emp])).values());
      const services: any = Array.from(new Map(arr.map((item: any) => item.employeeServices).flat().map((emp: any) => [emp._id, emp])).values());
      setEmployeeList(employees)
      setServiceList(services)
    }

    const onPaxChange = (value: number) => {
      const prevPax = watch("pax") || []; // Get the current pax array
      let updatedPax: any = [...prevPax]; // Clone the array
    
      if (updatedPax.length > value) {
        // Remove extra pax if new value is less
        updatedPax = updatedPax.slice(0, value);
      } else {
        // Add new pax if value is greater
        while (updatedPax.length < value) {
          updatedPax.push([{ 
            serviceId: null, 
            price: null, 
            duration: null, durationList: [], 
            assetId: null, assetTypeId: null, assetList: [],
            employeeId: [], employeeList: [], busyEmployees: [],
          }]);
        }
      }
    
      setValue("pax", updatedPax); // Update the form field
    };

    const convertTo24HourFormat = (timeStr: string) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      if (modifier === "PM" && hours !== "12") {
        hours = String(parseInt(hours, 10) + 12);
      }
      if (modifier === "AM" && hours === "12") {
        hours = "00";
      }
      return `${hours}:${minutes}`;
    };
  
    const onSubmit = async (data:any) => {
      if(selectedAppointment?.taskStatus === "Completed") return;
      setLoading(true)
      data = {...data, totalAmount}
      data.appointmentDate = data.appointmentDate?.toString();
      data.startTime = convertTo24HourFormat(data.startTime);
      data.taskStatus = selectedAppointment?.taskStatus === "Pending" ? "CheckedIn": selectedAppointment?.taskStatus === "CheckedIn" ? "CheckedOut" : selectedAppointment?.taskStatus === "CheckedOut" ? "Completed" : "Pending";
      data.status = true;
      const arr = data.pax.flat().filter((item:any) => item.serviceId)
      if(!arr.length ) data.pax = [
        [{serviceId: "67fcbfc92e5d5efc267985b0", startTime: data?.startTime, durationList: [{
          "serviceDuration": 60,
          "defaultPrice": 50,
          "_id": "67fcbfc92e5d5efc267985b1"
      }], duration: "60", price: 0, assetId: null, assetTypeId: null, assetList: [], busyEmployees: [], employeeList: [], employeeId: []}]
      ]
      // console.log(data);
      // return;
        
      try {
        const appointmentId = selectedAppointment?._id
        let url = appointmentId ? `${APPOINTMENT_SERVICES_API_URL}/${appointmentId}` : APPOINTMENT_SERVICES_API_URL
        if(appointmentId) data.appointmentId = appointmentId;
        const appointment = await fetch(url, {
            method: appointmentId ? "PUT" : "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsed = await appointment.json();
        console.log(parsed);
        
        setLoading(false)
        if(parsed.status){
          getBookingsById(parsed?.appointment?._id)
          toast.info(`Appointment ${data.taskStatus}`)
          // reset(); 
          // props.onOpenChange();
          // location.reload()
        }else toast.error(parsed.message)
        }catch(err:any) {
          setLoading(false)
          toast.error(err)
        }
    }
  

    const onDrawerClose = () => {
        props.onOpenChange();
        // reset(); 
    }
  
  
    return (
      <Drawer isOpen={props.isOpen} size="2xl" placement={"right"} onOpenChange={onDrawerClose}>
        {isOpen && (
        <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
          <AddEditCustomer isOpen={isOpen} placement={"left"} onOpenChange={() => {onOpenChange(); getCustomerList()} }  />
        </Suspense>
        )}
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex items-center gap-1"> 
                  <span> {selectedAppointment?.taskStatus === "Pending" ? "BOOKING CONFIRMED": selectedAppointment?.taskStatus === "CheckedIn" ? "CHECKED IN" : selectedAppointment?.taskStatus === "CheckedOut" ? "CHECKED OUT" : selectedAppointment?.taskStatus === "Completed" ? "COMPLETED" : "NEW APPOINTMENT"} </span>
                  {/* <span className={`px-2 rounded ms-auto me-4 ${statusCSS[selectedAppointment?.taskStatus]}`}> {selectedAppointment?.taskStatus} </span> */}
                  <div className="flex items-center gap-3 ms-auto me-4">
                    {!selectedAppointment && <Button color="primary" type="submit" size="lg" className={`w-full ${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                      <SaveIcon width="15" color="white" />  
                      {loading ? "Loading...": "Save"} 
                    </Button>}
                    {selectedAppointment?.taskStatus === "Pending" && <Button type="submit" size="lg" color="secondary" disabled={loading} variant="solid" className={`border-2 bg-${loading?"gray-200 text-dark":"teal-600 text-white"} text-xl`}> <ChairIcon width="15" height="15" color="white" /> {loading ? "Loading...":"Check In"} </Button>}
                    {selectedAppointment?.taskStatus === "CheckedIn" && <Button type="submit" size="lg" color="secondary" disabled={loading} variant="solid" className={`border-2 bg-${loading?"gray-200 text-dark":"purple-600 text-white"} text-xl`}> <DoorOpenIcon width="15" height="15" color="white" /> {loading ? "Loading...":"Check Out"} </Button>}
                    {selectedAppointment?.taskStatus === "CheckedOut" && <Button type="submit" size="lg" variant="solid" disabled={loading} className={`border-2 ${loading?"bg-gray-200":"bg-green-600"} text-xl text-white`}> <CheckIcon width="15" height="15" color="white" /> {loading ? "Loading...":"Pay"} </Button>}
                    {selectedAppointment?.taskStatus === "Completed" && <Button type="button" size="lg" variant="solid" disabled={loading} className={`border-2 ${loading?"bg-gray-200":"bg-green-600"} text-xl text-white`}> <CheckIcon width="15" height="15" color="white" /> {loading ? "Loading...":"Complete"} </Button>}
                  </div>
                  
                </DrawerHeader>
                <DrawerBody> 

                  <section className="flex items-center gap-0">
                    <small className={`w-1/5 text-center border-1 border-black flex items-center justify-center h-full p-3 ${!selectedAppointment && "bg-primary text-white"}`}>NEW APPOINTMENT</small>
                    <small className={`w-1/5 text-center border-1 border-black flex items-center justify-center h-full p-3 ${selectedAppointment?.taskStatus === "Pending" && "bg-gray-300"}`}>BOOKING CONFIRMED</small>
                    <small className={`w-1/5 text-center border-1 border-black flex items-center justify-center h-full p-3 ${selectedAppointment?.taskStatus === "CheckedIn" && "bg-teal-600 text-white"}`}>CHECKED IN</small>
                    <small className={`w-1/5 text-center border-1 border-black flex items-center justify-center h-full p-3 ${selectedAppointment?.taskStatus === "CheckedOut" && "bg-purple-600 text-white"}`}>CHECKED OUT</small>
                    <small className={`w-1/5 text-center border-1 border-black flex items-center justify-center h-full p-3 ${selectedAppointment?.taskStatus === "Completed" && "bg-success-600 text-white"}`}>JOB COMPLETE</small>
                  </section>

                  {branchList?.length ? <Controller name="branchId" control={control} rules={{required: true}}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" onChange={(id:string) => {
                        if(selectedAppointment?.taskStatus === "Completed") return;
                        if(!id) return;
                        resetPax();
                        getRosterByBranchId(id)
                      } } />
                    )}
                    /> : <></>}
                  {errors.branchId && <div className="text-danger text-sm -mt-2 ms-3">Branch is required</div>}




                  {customerId ? <ServiceCard {...customerList?.find((e:any) => e._id === customerId) || {}} onDelete={() => setValue("customerId", null)}  /> : 
                    <Autocomplete {...register("customerId", {required: true})} defaultItems={customerList} label="Customer" 
                    labelPlacement="inside" placeholder="Select a customer" variant="bordered"
                    onSelectionChange={(item:any)=> setValue("customerId",item)}
                    endContent={<Button size="sm" onPress={() => handleOpen()}><PlusIcon width={10} />ADD</Button>}>
                    {(user:any) => (
                      <AutocompleteItem key={user._id} textValue={user.name}>
                        <div className="flex gap-2 items-center">
                          <Avatar alt={user.name} className="flex-shrink-0" size="sm" src={user.image} />
                          <div className="flex flex-col">
                            <span className="text-small">{user.name}</span>
                            <span className="text-tiny text-default-400">{user.email}</span>
                          </div>
                        </div>
                      </AutocompleteItem>
                    )}
                    
                  </Autocomplete>}
                  {errors.customerId && <div className="text-danger text-sm -mt-2 ms-3">Customer is required</div>}

                  <div className="flex items-center gap-2" style={{pointerEvents: selectedAppointment?.taskStatus === "Completed" ? "none":"all"}}>
                    <Controller name="appointmentDate" control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field} hideTimeZone showMonthAndYearPickers label="Date & Time" variant="bordered"
                          defaultValue={field.value} onChange={(date) => {
                            if(selectedAppointment?.taskStatus === "Completed") return;
                            field.onChange(date)
                            resetPax();
                          }} // Ensure React Hook Form updates the state
                        />
                      )}
                    />
                    <label htmlFor="startTime" className="w-1/4 border-2 p-0 px-4 rounded">
                      <input className="py-3 outline-none" type="time" {...register("startTime", {required: true})}
                        onChange={(event:any) => {
                          setValue("startTime", event.target.value)
                          resetPax()
                        }} 
                      />
                    </label>
                    
                    <div className="w-1/2 text-center p-3 border-2 rounded"> {moment(appointmentDate.toString()).format('dddd')} </div>
                    <label htmlFor="paxValue" className="w-1/4 border-2 p-3 px-2">
                      <select id="paxValue" className="w-100 outline-none pe-3" value={pax.length} onChange={(event:any) => onPaxChange(+event.target.value)}>
                        <option value="">Pax</option>
                        {Array.from({ length: 5 }, (_, i) => (i + 1).toString())?.map((val: string) => {
                          return <option key={val} value={val}>{val}</option>
                        })}
                      </select>
                    </label>
                  </div>
                  {errors.startTime && <div className="text-danger text-sm -mt-2 ms-3">Date & Time is not selected</div>}

                      
                  {branchId && startTime && <section className="flex items-center px-2 mt-3 gap-3 border-b-5 border-primary">
                    {paxFields.map((paxField, paxIndex) => (
                      <Button key={paxField.id} size="sm" color={paxIndex === selectedTab ? "primary":"default"}
                        variant="solid" onPress={() => setSelectedTab(paxIndex)} style={{borderRadius: "2px"}}
                        >Person {paxIndex + 1}</Button>
                    ))}
                  </section>}

                  {branchId && startTime && <div className="py-3">
                      {paxFields.map((paxField, paxIndex) => (
                        <div key={paxField.id} style={{
                          pointerEvents: selectedAppointment?.taskStatus === "Completed" ? "none" : "all",
                          visibility: paxIndex === selectedTab ? "visible" : "hidden",
                          height: paxIndex === selectedTab ? "100%" : "0"
                          }}>
                          {/* <h1> Person {paxIndex + 1} </h1> */}
                          <PaxServiceList control={control} paxIndex={paxIndex} register={register} errors={errors} watch={watch} setValue={setValue} startTime={startTime} serviceList={serviceList} allServiceList={allServiceList} employeeList={employeeList} getNextTimeSlot={getNextTimeSlot} />
                        </div>
                      ))}
                      
                  </div>}
                  

                  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start", flexDirection: "column"}}>
                  {selectedAppointment?.taskStatus === "CheckedOut" && <section className="flex items-center gap-0">
                    <small role="button" className={`w-1/4 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2 ${paymentMethod === "Cash" && "bg-gray-500 text-white"}`} onClick={() => setValue("paymentMethod", "Cash")}>CASH</small>
                    <small role="button" className={`w-1/4 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2 ${paymentMethod === "Card" && "bg-gray-500 text-white"}`} onClick={() => setValue("paymentMethod", "Card")}>CARD</small>
                    <small role="button" className={`w-1/4 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2 ${paymentMethod === "Transfer" && "bg-gray-500 text-white"}`} onClick={() => setValue("paymentMethod", "Transfer")}>TRANSFER</small>
                    <small role="button" className={`w-1/4 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2`}>VOUCHER</small>
                  </section>}

                  <Textarea {...register("note")} label="Note" placeholder="Enter Note" />
                  
                  <div className="flex items-center justify-between">
                    <h5 className="text-xl">Subtotal :</h5>
                    <h5 className="text-xl">฿ {totalAmount}</h5>
                  </div>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

export default NewAppointment

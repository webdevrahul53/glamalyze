import React, { lazy, Suspense } from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardHeader, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Progress, Textarea, useDisclosure } from "@heroui/react";
import { ChairIcon, CheckIcon, CloseIcon, DeleteIcon, DoorOpenIcon, PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import AvatarSelect from "../common/avatar-select";
import {parseDate} from "@internationalized/date";
import { APPOINTMENT_SERVICES_API_URL, APPOINTMENTS_API_URL, ASSETS_API_URL, BRANCH_API_URL, CUSTOMERS_API_URL, SERVICES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
import moment from "moment";
const AddEditCustomer = lazy(() => import("@/core/drawer/add-edit-customer"));


const statusCSS: any = {
  Pending: "bg-gray-200 text-gray-800 border-gray-500",
  CheckIn: "bg-teal-200 text-teal-800 border-teal-500",
  Checkout: "bg-purple-200 text-purple-800 border-purple-500",
  Completed: "bg-green-200 text-green-800 border-green-500",
  Cancelled: "bg-red-200 text-red-800 border-red-500",
}


const NewAppointment = (props:any) => {
    const { register, handleSubmit, watch, formState: { errors }, control, setValue, reset } = useForm({
      defaultValues: {
        appointmentDate: parseDate(new Date().toISOString().split("T")[0]), 
        startTime: null, 
        branchId: null, 
        customerId: null, 
        pax: [ [{serviceId: null, durationList: [], duration: null, price: null, assetId: null, assetTypeId: null, assetList: [], busyEmployees: [], employeeList: [], employeeId: null}] ],
        note: null
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
    const [customerList, setCustomerList] = React.useState([]);
    const [serviceList, setServiceList] = React.useState([]);
    const [totalAmount, setTotalAmount] = React.useState<any>(0)
    const [selectedTab, setSelectedTab] = React.useState<any>(0)

    
    const customerId = useWatch({ control, name: "customerId" });
    const branchId = useWatch({ control, name: "branchId" });
    const appointmentDate = useWatch({ control, name: "appointmentDate" });
    const startTime = useWatch({ control, name: "startTime" });
    const pax = useWatch({ control, name: "pax" });
    

    const currentDate = new Date();

    React.useEffect(() => {
      const branchId = localStorage.getItem("selectedBranch");
      setValue("branchId", branchId || branchList[0]?._id)
    },[branchList])
    
    React.useEffect(() => {
      if(!branchId) return;
      getBranchById(branchId)
    },[branchId])

    React.useEffect(() => {
      if(props?.bookings?.appointmentId){
        getBookingsById(props?.bookings?.appointmentId)
      }else {

      }
      getCustomerList();
      getBranchList();
      getServiceList();
    }, [props?.bookings])

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
      setValue("pax", [ [{serviceId: null, durationList: [], duration: null, price: null, assetId: null, assetTypeId: null, assetList: [], busyEmployees: [], employeeList: [], employeeId: null}] ])
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

        const {appointmentDate, startTime, branchId, customerId, pax, note} = parsed
        const formData = {
          appointmentDate: parseDate(new Date(appointmentDate).toISOString().split("T")[0]), 
          startTime, branchId, customerId, pax, note
        }
        reset(formData)
        getBranchById(branchId)
        
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
    
    const getBranchById = async (id: string) => {
      if(!id) return;
      try {
          const branches = await fetch(`${BRANCH_API_URL}/${id}`)
          const parsed = await branches.json();
          setServiceList(parsed?.employeeServices)
          setEmployeeList(parsed?.groupEmployees)
        }catch(err:any) { toast.error(err.message) }
    }
    const getCustomerList = async () => {
      try {
          const customers = await fetch(CUSTOMERS_API_URL)
          const parsed = await customers.json();
          setCustomerList(parsed);
        }catch(err:any) { toast.error(err.message) }
    }

    const onPaxChange = (value: number) => {
      const prevPax = watch("pax") || []; // Get the current pax array
      let updatedPax = [...prevPax]; // Clone the array
    
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
            employeeId: null, employeeList: [], busyEmployees: [],
          }]);
        }
      }
    
      setValue("pax", updatedPax); // Update the form field
    };

    // const convertAndRoundTo30Minutes = (timeStr: string) => {
    //   // Convert 12-hour format to 24-hour format
    //   const [time, modifier] = timeStr.split(" ");
    //   let [hours, minutes] = time.split(":").map(Number);
    
    //   if (modifier === "PM" && hours !== 12) {
    //     hours += 12;
    //   }
    //   if (modifier === "AM" && hours === 12) {
    //     hours = 0;
    //   }
    
    //   // Round minutes to nearest 30-minute slot
    //   if (minutes < 15) minutes = 0;
    //   else if (minutes < 45) minutes = 30;
    //   else {
    //     minutes = 0;
    //     hours = (hours + 1) % 24; // Handle 24-hour wrap
    //   }
    
    //   return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    // };
    

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
      setLoading(true)
      data = {...data, totalAmount}
      data.appointmentDate = data.appointmentDate?.toString();
      data.startTime = convertTo24HourFormat(data.startTime);
      data.taskStatus = selectedAppointment?.taskStatus === "Pending" ? "CheckedIn": selectedAppointment?.taskStatus === "CheckedIn" ? "CheckedOut" : selectedAppointment?.taskStatus === "CheckedOut" ? "Completed" : "Pending";
      data.status = true;
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
                
                  {/* <div className="flex ">
                    <div className="w-1/2 p-2 border border-3">
                      <span>On</span> <i><strong> {new Date(appointmentDate?.toString()).toDateString()} </strong>  </i> 
                    </div>
                    <div className="w-1/2 p-2 border border-3">
                      <span>At</span> <i><strong> {startTime} </strong>  </i> 
                    </div>
                  </div> */}



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
                        if(!id) return;
                        resetPax();
                        getBranchById(id)
                        localStorage.setItem("selectedBranch", id)
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

                  <div className="flex items-center gap-2">
                    <Controller name="appointmentDate" control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field} hideTimeZone showMonthAndYearPickers label="Date & Time" variant="bordered"
                          defaultValue={field.value} onChange={(date) => {
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
                      {/* <select id="startTime" className="w-100 outline-none pe-3" {...register("startTime", {required: true})} 
                      onChange={(event:any) => {
                        setValue("startTime", event.target.value)
                        resetPax()
                      }}>
                        <option value="">Select Time</option>
                        {timeList.map((value) => (
                          <option key={value.key} value={value.key}>{value.label}</option>
                        ))}
                      </select> */}
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
                          visibility: paxIndex === selectedTab ? "visible" : "hidden",
                          height: paxIndex === selectedTab ? "100%" : "0"
                          }}>
                          {/* <h1> Person {paxIndex + 1} </h1> */}
                          <ServiceList control={control} paxIndex={paxIndex} register={register} errors={errors} watch={watch} setValue={setValue} startTime={startTime} serviceList={serviceList} allServiceList={allServiceList} employeeList={employeeList} getNextTimeSlot={getNextTimeSlot} />
                        </div>
                      ))}
                      
                  </div>}
                  

                  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start", flexDirection: "column"}}>
                  <Textarea {...register("note")} label="Note" placeholder="Enter Note" />
                  
                  <div className="flex items-center justify-between">
                    <h5 className="text-xl">Subtotal :</h5>
                    <h5 className="text-xl">฿ {totalAmount}</h5>
                  </div>
                  {/* <div className="flex items-center gap-3">
                    <Button color="primary" type="submit" className={`w-full ${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                      <SaveIcon width="15" color="white" />  
                      {loading ? "Loading...": appointmentId ? "Update Appointment" : "Save Appointment"} 
                    </Button>
                    {selectedAppointment?.taskStatus === "Pending" && <Button color="secondary" variant="bordered" className="w-full border-2 border-teal-600 text-xl text-teal-600"> <ChairIcon width="15" height="15" color="teal" /> Check In </Button>}
                    {selectedAppointment?.taskStatus === "CheckIn" && <Button color="secondary" variant="bordered" className="w-full border-2 border-purple-600 text-xl text-purple-600"> <DoorOpenIcon width="15" height="15" color="purple" /> Check Out </Button>}
                    {selectedAppointment?.taskStatus === "Checkout" && <Button variant="bordered" className="w-full border-2 border-green-600 text-xl text-green-600"> <CheckIcon width="15" height="15" color="green" /> Pay </Button>}
                  </div> */}
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

export default NewAppointment



  
// Separate component to handle nested "serviceIds" array
const ServiceList = ({ control, paxIndex, register, errors, watch, setValue, startTime, serviceList, allServiceList, employeeList, getNextTimeSlot }: any) => {
  const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({
    control,
    name: `pax.${paxIndex}`,
  });
  

  const onServiceSelection = (id: string, serviceIndex: number) => {
    setValue(`pax.${paxIndex}.${serviceIndex}.serviceId`, id)
    setValue(`pax.${paxIndex}.${serviceIndex}.duration`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, [])
    const service = serviceList?.find((item: any) => item._id === id)
    setValue(`pax.${paxIndex}.${serviceIndex}.durationList`, service?.variants || [])
    setValue(`pax.${paxIndex}.${serviceIndex}.assetTypeId`, service?.assetTypeId)
  }

  const onDurationSelection = (item: any, serviceIndex: number, durationList: any) => {
    const index: any = item?.target?.value
    const price:any = durationList?.find((e:any) => +e.serviceDuration === +index)?.defaultPrice
    setValue(`pax.${paxIndex}.${serviceIndex}.price`, price)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, [])
    setStartTimeForService(serviceIndex, +index);
  }


  const setStartTimeForService = (serviceIndex: number, duration: number) => {
    let value;
    if(serviceIndex == 0) value = startTime;
    else {
      let prevDurationSum = 0;
      for(var i = 0; i < serviceIndex; i++){
        prevDurationSum += +watch(`pax.${paxIndex}`)[i].duration
      }
      value = getNextTimeSlot(startTime, +prevDurationSum)
    }
    setValue(`pax.${paxIndex}.${serviceIndex}.startTime`, value)
    watch(`pax.${paxIndex}.${serviceIndex+1}`) && setValue(`pax.${paxIndex}.${serviceIndex+1}.serviceId`, null)
    getBusyEmployeesWithNextSlot(value, duration, serviceIndex)
    getAvailableAssets(value, duration, serviceIndex)
  }

  const getBusyEmployeesWithNextSlot = async (time: string, duration: number, serviceIndex: number) => {
    try {
      const appointmentDate = new Date(watch("appointmentDate")).toISOString().split("T")[0]
      const branches = await fetch(`${APPOINTMENT_SERVICES_API_URL}/busy-employees?appointmentDate=${appointmentDate}&startTime=${time}&duration=${duration}`)
      const parsed = await branches.json();
      const serviceId = watch(`pax.${paxIndex}.${serviceIndex}.serviceId`)
      const pax = watch(`pax`)
      let selectedEmployeeIds: string[] = []
      for(var i in pax){
        if(i != paxIndex){
          selectedEmployeeIds.push(...pax[i].map((e:any) => ({employeeId: e.employeeId, nextAvailableTime: ""})))
        }
      }
      
      const filteredEmployee = employeeList?.filter((item: any) => item.servicesId.includes(serviceId))
      const disabledEmployees = [...parsed?.busyEmployeesWithSlots || [], ...selectedEmployeeIds];
      const disabledIds = disabledEmployees?.map((emp: any) => emp?.employeeId) || [];
      const availableEmployees = filteredEmployee?.filter((item: any) => !disabledIds.includes(item._id));

      setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, duration ? availableEmployees?.[0]?._id : null)
      setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, duration ? filteredEmployee : [])
      setValue(`pax.${paxIndex}.${serviceIndex}.busyEmployees`, disabledEmployees)
        
    }catch(err:any) { console.log(err) }
  }

  const getAvailableAssets = async (time: string, duration: number, serviceIndex: number) => {
    try {
      const appointmentDate = new Date(watch("appointmentDate")).toISOString().split("T")[0]
      const assetTypeId = watch(`pax.${paxIndex}.${serviceIndex}.assetTypeId`)
      const branchId = watch(`branchId`)
      const branches = await fetch(`${ASSETS_API_URL}/available-assets?branchId=${branchId}&appointmentDate=${appointmentDate}&startTime=${time}&duration=${duration}&assetTypeId=${assetTypeId}`)
      const parsed = await branches.json();
      
      const pax = watch(`pax`)
      let selectedAssetIds: string[] = []
      for(var i in pax){
        if(i != paxIndex){
          selectedAssetIds.push(...pax[i].map((e:any) => e.assetId))
        }
      }
      let seats = parsed?.availableAssets?.filter((item:any) => !selectedAssetIds.includes(item._id))
      console.log(selectedAssetIds, seats);
      setValue(`pax.${paxIndex}.${serviceIndex}.assetList`, seats)
      
      if(seats?.length){
        setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, seats?.[0]?._id)
        // setValue(`pax.${paxIndex}.${serviceIndex}.assetList`, seats?.[0])
      }else{
        toast.error("Asset not available")
      }
      
    }catch(err:any) { console.log(err) }
  }

  const onServiceRemoved = (serviceIndex: number) => {
    const nextService = watch(`pax.${paxIndex}.${serviceIndex+1}`)
    nextService && setValue(`pax.${paxIndex}.${serviceIndex+1}.serviceId`, null)
    removeService(serviceIndex)
  }

  return (
    <div>

      {serviceFields.map((serviceField, serviceIndex) => {
        const durationList = watch(`pax.${paxIndex}.${serviceIndex}.durationList`)
        // const servStartTime = watch(`pax.${paxIndex}.${serviceIndex}.startTime`)
        // const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
        const price = watch(`pax.${paxIndex}.${serviceIndex}.price`)
        const paxEmployeeList = watch(`pax.${paxIndex}.${serviceIndex}.employeeList`)
        const busyEmployees = watch(`pax.${paxIndex}.${serviceIndex}.busyEmployees`)
        const assetList = watch(`pax.${paxIndex}.${serviceIndex}.assetList`)
        const assetId = watch(`pax.${paxIndex}.${serviceIndex}.assetId`)
        const serviceId = watch(`pax.${paxIndex}.${serviceIndex}.serviceId`)
        const employeeId = watch(`pax.${paxIndex}.${serviceIndex}.employeeId`)

        return <div key={serviceField.id} className="flex flex-col gap-2">
          {/* {assetId + "===" + price + "===" + employeeId} */}
          
          {errors.pax?.[paxIndex]?.[serviceIndex] && (
            <p className="text-danger text-sm ms-2"> Required fields are mandatory </p>
          )}
          {serviceId ? <ServiceCard {...allServiceList?.find((item:any) => item._id === serviceId)} onDelete={() => setValue(`pax.${paxIndex}.${serviceIndex}.serviceId`, null)} /> : 
            <Autocomplete {...register(`pax.${paxIndex}.${serviceIndex}.serviceId`, {required: true})} 
            defaultItems={serviceList} label="Services" 
            labelPlacement="inside" placeholder="Select a service" variant="bordered"
            onSelectionChange={(id:string) => onServiceSelection(id, serviceIndex)}
            >
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
          
          {/* <Controller name={`pax.${paxIndex}.${serviceIndex}.serviceId`} control={control} rules={{required: true}}
            render={({ field }) => (
              <AvatarSelect field={field} data={serviceList} label="Services" keyName="name" 
                onChange={(id:string) => onServiceSelection(id, serviceIndex)} />
            )}
          /> */}


          {/* <Controller name={`pax.${paxIndex}.${serviceIndex}.employeeId`} control={control} rules={{required: true}}
            render={({ field }) => (
              <AvatarSelect field={field} data={paxEmployeeList} label="Staff" keyName="firstname" showStatus={true} disabledKeys={busyEmployees} />
            )}
          /> */}
          
          <div className="flex items-center gap-2">
            <div className="w-1/2 border-2 rounded p-1">
              <select {...register(`pax.${paxIndex}.${serviceIndex}.duration`)} className="w-full py-3 outline-none"
                onChange={(item: any) => onDurationSelection(item, serviceIndex, durationList)}>
                  <option value="">Duration</option>
                {durationList?.map((item:any, index: number) => <option key={index} value={item.serviceDuration}>{item.serviceDuration} min</option>)}
              </select>
            </div>
            
            <div className="w-1/2 border-2 rounded p-1">
              <select {...register(`pax.${paxIndex}.${serviceIndex}.assetId`)} value={assetId} className="w-full py-3 outline-none"
                // onChange={(item: any) => onDurationSelection(item, serviceIndex, durationList)}
                >
                  <option value="">Place</option>
                {assetList?.map((item:any, index: number) => <option key={index} value={item._id}>{item?.assetTypeId?.assetTypeName?.toUpperCase()} - {item.assetNumber}</option>)}
              </select>
            </div>
            {/* <Input className="w-1/2" type="text" label={"Place"} readOnly value={assetList ? assetList?.assetTypeId?.toUpperCase() + "-" + assetList?.assetNumber : ""} /> */}
          </div>


          {employeeId ? <ServiceCard {...paxEmployeeList?.find((item:any) => item._id === employeeId)} onDelete={() => setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, null)} /> : 
            <Autocomplete {...register(`pax.${paxIndex}.${serviceIndex}.employeeId`, {required: true})} 
            defaultItems={paxEmployeeList || []} label="Staffs" 
            labelPlacement="inside" placeholder="Select staff" variant="bordered" 
            disabledKeys={busyEmployees?.map((item:any) => item.employeeId)}
            onSelectionChange={(id:string) => setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, id)}
            >
            {(user:any) => {
              
              const employee = busyEmployees?.find((item:any) => item.employeeId == user._id);
              return <AutocompleteItem key={user._id} textValue={user.firstname + " " + user.lastname}>
                <div className="flex gap-2 items-center">
                  <Avatar alt={user.firstname} className="flex-shrink-0" size="sm" src={user.image} />
                  <div className="flex flex-col">
                    <span className="text-small">{user.firstname + " " + user.lastname}</span>
                    <span className="text-tiny text-default-400">{user.email}</span>
                  </div>
                  
                  {employee ? <span style={{fontSize: "10px"}} className={`bg-red-800 ms-auto text-white px-2 rounded`}>Busy {employee.nextAvailableTime && ("till " + employee.nextAvailableTime)} </span> :
                      <span style={{fontSize: "10px"}} className={`bg-green-800 ms-auto text-white px-2 rounded`}>Available</span>}
                </div>
              </AutocompleteItem>
            }}
            
          </Autocomplete>}

          
          <div className="flex items-center justify-between gap-2 px-2">
            <button type="button" className="my-2" onClick={() => onServiceRemoved(serviceIndex)}>❌ Remove </button>
            <strong>฿ {price || 0}</strong>
          </div>

          <hr className="py-3" />
          {/* <input type="text" className="w-1/5" value={assetList?.assetTypeId?.toUpperCase() + "-" + assetList?.assetNumber} /> */}
          

        </div>
        
        
      })}

      <div className="text-center mt-2">
        <button type="button" onClick={() => addService({ serviceId: null, duration: null, employeeId: null })}>
          ➕ Add Service
        </button>
      </div>
    </div>
  );
};


const ServiceCard = (props:any) => {
  const name = props?.name ? props?.name : props?.firstname + " " + props?.lastname
  return (
    <Card className="w-full flex-shrink-0 shadow-sm border-2">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <Avatar isBordered radius="full" size="sm" src={props.image} />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{name}</h4>
            <h5 className="text-small tracking-tight text-default-400"> <strong> {props.email || props.createdAt}</strong> </h5>
          </div>
        </div>
        <div className="cursor-pointer" onClick={props.onDelete}>
          <CloseIcon width="20" height="20" />  
        </div> 
      </CardHeader>
    </Card>
  );
}



const AvatarCard = (props:any) => {

  return (
    <Card className="w-full flex-shrink-0 min-w-[250px]">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Avatar isBordered radius="full" size="md" src={props.image} />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{props.firstname} {props.lastname}</h4>
            <h5 className="text-small tracking-tight text-default-400">{props.createdAt}</h5>
          </div>
        </div>
        <div className="cursor-pointer" onClick={props.onDelete}>
            <DeleteIcon  width="15" color="darkred" />
        </div> 
      </CardHeader>
      <CardBody className="p-3 text-small text-default-400">
        <p>Phone : {props.phonenumber}</p>
        <p>Email : {props.email}</p>
      </CardBody>
    </Card>
  );
}


const timeList = [
  {key: "10:00", label: "10:00"},
  {key: "10:30", label: "10:30"},
  {key: "11:00", label: "11:00"},
  {key: "11:30", label: "11:30"},
  {key: "12:00", label: "12:00"},
  {key: "12:30", label: "12:30"},
  {key: "13:00", label: "13:00"},
  {key: "13:30", label: "13:30"},
  {key: "14:00", label: "14:00"},
  {key: "14:30", label: "14:30"},
  {key: "15:00", label: "15:00"},
  {key: "15:30", label: "15:30"},
  {key: "16:00", label: "16:00"},
  {key: "16:30", label: "16:30"},
  {key: "17:00", label: "17:00"},
  {key: "17:30", label: "17:30"},
  {key: "18:00", label: "18:00"},
];

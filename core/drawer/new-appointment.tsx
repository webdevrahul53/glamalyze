import React, { lazy, Suspense } from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardHeader, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Progress, Select, SelectItem, useDisclosure } from "@heroui/react";
import { ChairIcon, CheckIcon, DeleteIcon, DoorOpenIcon, PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import AvatarSelect from "../common/avatar-select";
import {parseDate} from "@internationalized/date";
import { APPOINTMENT_SERVICES_API_URL, APPOINTMENTS_API_URL, ASSETS_API_URL, BRANCH_API_URL, CUSTOMERS_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
const AddEditCustomer = lazy(() => import("@/core/drawer/add-edit-customer"));


const statusCSS: any = {
  Pending: "bg-gray-200 text-gray-800 border-gray-500",
  CheckIn: "bg-teal-200 text-teal-800 border-teal-500",
  Checkout: "bg-purple-200 text-purple-800 border-purple-500",
  Completed: "bg-green-200 text-green-800 border-green-500",
  Cancelled: "bg-red-200 text-red-800 border-red-500",
}


const NewAppointment = (props:any) => {
    const appointmentId = props?.bookings?.appointmentId;
    const { register, handleSubmit, watch, formState: { errors }, control, setValue, reset } = useForm({
      defaultValues: {
        appointmentDate: parseDate(new Date().toISOString().split("T")[0]), 
        startTime: null, 
        branchId: null, 
        customerId: null, 
        pax: [ [{serviceId: null, durationList: [], duration: null, price: null, assetId: null, assetType: null, selectedAsset: null, busyEmployees: [], employeeList: [], employeeId: null}] ],
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
    const [branchList, setBranchList] = React.useState([]);
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
      if(appointmentId){
        getBookingsById(appointmentId)
      }else {

      }
      getCustomerList();
      getBranchList();
    }, [appointmentId])

    // For calendar purpose
    React.useEffect(() => {
      if(!props?.bookings) return;
      const date = parseDate(new Date(props?.bookings?.start)?.toISOString().split("T")[0])
      const time: any = convertTo24HourFormat(new Date(props?.bookings?.start).toLocaleTimeString())
      console.log(time)
      setValue("appointmentDate", date)
      setValue("startTime", time)
    }, [props?.bookings])


    React.useEffect(() => {
      const totalSum = pax.flat().reduce((sum, item: any) => sum + (item?.price || 0), 0);
      setTotalAmount(totalSum)
    },[pax])
    
    React.useEffect(() => {
      setValue("pax", [ [{serviceId: null, durationList: [], duration: null, price: null, assetId: null, assetType: null, selectedAsset: null, busyEmployees: [], employeeList: [], employeeId: null}] ])
    }, [startTime, branchId])
  

    const getBookingsById = async (id: string) => {
      if(!id) return;
      try {
        const branches = await fetch(`${APPOINTMENTS_API_URL}/${id}`)
        let parsed = await branches.json();

        parsed.pax = Object.values(
          parsed.pax.reduce((acc: any, item: any) => {
            acc[item.paxId] = acc[item.paxId] || [];
            acc[item.paxId].push(item);
            return acc;
          }, {})
        );

        const {appointmentDate, startTime, branchId, customerId, pax} = parsed
        reset({
          appointmentDate: parseDate(new Date(appointmentDate).toISOString().split("T")[0]), 
          startTime, branchId, customerId, pax, note: null
        })
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
    
    const getBranchById = async (id: string) => {
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
            assetId: null, assetType: null, selectedAsset: null,
            employeeId: null, employeeList: [], busyEmployees: [],
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
      setLoading(true)
      data = {...data, totalAmount}
      data.appointmentDate = data.appointmentDate?.toString();
      data.startTime = convertTo24HourFormat(data.startTime);
      data.status = true;
      // console.log(data);
      // return;
        
      try {
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
          toast.error(null)
          reset(); 
          props.onOpenChange();
          location.reload()
        }else toast.error(parsed.message)
        }catch(err:any) {
          setLoading(false)
          toast.error(err)
        }
    }
  

    const onDrawerClose = () => {
        props.onOpenChange();
        reset(); 
    }
  
  
    return (
      <Drawer isOpen={props.isOpen} size="lg" placement={"right"} onOpenChange={props.onOpenChange}>
        {isOpen && (
        <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
          <AddEditCustomer isOpen={isOpen} placement={"left"} onOpenChange={() => {onOpenChange(); getCustomerList()} }  />
        </Suspense>
        )}
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex gap-1"> 
                  <span>{appointmentId ? "Update":"New"} Appointment</span>
                  <span className={`px-2 rounded ms-auto me-4 ${statusCSS[props?.bookings?.taskStatus]}`}> {props?.bookings?.taskStatus} </span>
                </DrawerHeader>
                <DrawerBody> 
                
                  <div className="flex ">
                    <div className="w-1/2 p-2 border border-3">
                      <span>On</span> <i><strong> {new Date(appointmentDate?.toString()).toDateString()} </strong>  </i> 
                    </div>
                    <div className="w-1/2 p-2 border border-3">
                      <span>At</span> <i><strong> {startTime} </strong>  </i> 
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Controller name="appointmentDate" control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field} hideTimeZone showMonthAndYearPickers label="Date & Time" variant="bordered"
                          defaultValue={field.value} onChange={(date) => field.onChange(date)} // Ensure React Hook Form updates the state
                        />
                      )}
                    />
                    <label htmlFor="startTime" className="w-2/5 border-2 p-3 px-2">
                      <select id="startTime" className="w-100 outline-none pe-3" {...register("startTime", {required: true})}>
                        <option value="">Select Time</option>
                        {timeList.map((value) => (
                          <option value={value.key}>{value.label}</option>
                        ))}
                      </select>
                    </label>
                    <label htmlFor="paxValue" className="w-1/5 border-2 p-3 px-2">
                      <select id="paxValue" className="w-100 outline-none pe-3" value={pax.length} onChange={(event:any) => onPaxChange(+event.target.value)}>
                        <option value="">Pax</option>
                        {Array.from({ length: 5 }, (_, i) => (i + 1).toString())?.map((val: string) => {
                          return <option value={val}>{val}</option>
                        })}
                      </select>
                    </label>
                  </div>
                  {errors.startTime && <div className="text-danger text-sm -mt-2 ms-3">Date & Time is not selected</div>}


                  {branchList.length ? <Controller name="branchId" control={control} rules={{required: true}}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" onChange={getBranchById} />
                    )}
                    /> : <></>}
                  {errors.branchId && <div className="text-danger text-sm -mt-2 ms-3">Branch is required</div>}




                  {customerId ? <AvatarCard {...customerList?.find((e:any) => e._id === customerId) || {}} onDelete={() => setValue("customerId", null)}  /> : 
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
                          <ServiceList control={control} paxIndex={paxIndex} register={register} errors={errors} watch={watch} setValue={setValue} startTime={startTime} serviceList={serviceList} employeeList={employeeList} getNextTimeSlot={getNextTimeSlot} convertTo24HourFormat={convertTo24HourFormat} />
                        </div>
                      ))}
                      
                  </div>}
                  

                  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start", flexDirection: "column"}}>
                  {/* <Textarea {...register("note")} label="Note" placeholder="Enter Note" /> */}
                  
                  <div className="flex items-center justify-between">
                    <h5 className="text-xl">Subtotal :</h5>
                    <h5 className="text-xl">Rs. {totalAmount}</h5>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button color="primary" type="submit" className={`w-full ${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                      <SaveIcon width="15" color="white" />  
                      {loading ? "Loading...": appointmentId ? "Update Appointment" : "Save Appointment"} 
                    </Button>
                    {props?.bookings?.taskStatus === "Pending" && <Button color="secondary" variant="bordered" className="w-full border-2 border-teal-600 text-xl text-teal-600"> <ChairIcon width="15" height="15" color="teal" /> Check In </Button>}
                    {props?.bookings?.taskStatus === "CheckIn" && <Button color="secondary" variant="bordered" className="w-full border-2 border-purple-600 text-xl text-purple-600"> <DoorOpenIcon width="15" height="15" color="purple" /> Check Out </Button>}
                    {props?.bookings?.taskStatus === "Checkout" && <Button variant="bordered" className="w-full border-2 border-green-600 text-xl text-green-600"> <CheckIcon width="15" height="15" color="green" /> Pay </Button>}
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



  
// Separate component to handle nested "serviceIds" array
const ServiceList = ({ control, paxIndex, register, errors, watch, setValue, startTime, serviceList, employeeList, getNextTimeSlot }: any) => {
  const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({
    control,
    name: `pax.${paxIndex}`,
  });
  

  const onServiceSelection = (id: string, serviceIndex: number) => {
    setValue(`pax.${paxIndex}.${serviceIndex}.duration`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, [])
    const service = serviceList?.find((item: any) => item._id === id)
    setValue(`pax.${paxIndex}.${serviceIndex}.durationList`, service?.variants || [])
    setValue(`pax.${paxIndex}.${serviceIndex}.assetType`, service?.assetType)
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
      console.log(selectedEmployeeIds);
      
      const filteredEmployee = employeeList?.filter((item: any) => item.servicesId.includes(serviceId))
      setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, duration ? filteredEmployee : [])
      setValue(`pax.${paxIndex}.${serviceIndex}.busyEmployees`, [...parsed?.busyEmployeesWithSlots || [], ...selectedEmployeeIds])
        
    }catch(err:any) { console.log(err) }
  }

  const getAvailableAssets = async (time: string, duration: number, serviceIndex: number) => {
    try {
      const assetType = watch(`pax.${paxIndex}.${serviceIndex}.assetType`)
      const branches = await fetch(`${ASSETS_API_URL}/available-assets?startTime=${time}&duration=${duration}&assetType=${assetType}`)
      const parsed = await branches.json();
      
      const pax = watch(`pax`)
      let selectedAssetIds: string[] = []
      for(var i in pax){
        if(i != paxIndex){
          selectedAssetIds.push(...pax[i].map((e:any) => e.assetId))
        }
      }
      let seats = parsed?.availableAssets?.filter((item:any) => !selectedAssetIds.includes(item._id))
      // console.log(selectedAssetIds, seats);
      
      if(seats?.length){
        setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, seats?.[0]?._id)
        setValue(`pax.${paxIndex}.${serviceIndex}.selectedAsset`, seats?.[0])
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
        // const price = watch(`pax.${paxIndex}.${serviceIndex}.price`)
        const paxEmployeeList = watch(`pax.${paxIndex}.${serviceIndex}.employeeList`)
        const busyEmployees = watch(`pax.${paxIndex}.${serviceIndex}.busyEmployees`)
        const selectedAsset = watch(`pax.${paxIndex}.${serviceIndex}.selectedAsset`)
        // const assetId = watch(`pax.${paxIndex}.${serviceIndex}.assetId`)

        return <div key={serviceField.id} className="flex flex-col gap-2">
          {/* {servStartTime + "===" + duration + "===" + price + "===" + assetId} */}
          
          {errors.pax?.[paxIndex]?.[serviceIndex] && (
            <p className="text-danger text-sm ms-2"> Required fields are mandatory </p>
          )}
          <div className="flex items-center gap-2">
            <Controller name={`pax.${paxIndex}.${serviceIndex}.serviceId`} control={control} rules={{required: true}}
              render={({ field }) => (
                <AvatarSelect field={field} data={serviceList} label="Services" keyName="name" 
                  onChange={(id:string) => onServiceSelection(id, serviceIndex)} />
              )}
            />
            
            <select {...register(`pax.${paxIndex}.${serviceIndex}.duration`)} className="w-3/5 border-2 py-3"
              onChange={(item: any) => onDurationSelection(item, serviceIndex, durationList)}>
                <option value="">Select Duration</option>
              {durationList?.map((item:any) => <option value={item.serviceDuration}>{item.serviceDuration} min</option>)}
            </select>

          </div>
          
          <div className="flex items-center gap-2">

            <Controller name={`pax.${paxIndex}.${serviceIndex}.employeeId`} control={control} rules={{required: true}}
              render={({ field }) => (
                <AvatarSelect field={field} data={paxEmployeeList} label="Staff" keyName="firstname" showStatus={true} disabledKeys={busyEmployees} />
              )}
            />

            <Input className="w-3/5" type="text" label={"Place"} readOnly value={selectedAsset?.assetType?.toUpperCase() + "-" + selectedAsset?.assetNumber} />
          </div>
          
          {/* <input type="text" className="w-1/5" value={selectedAsset?.assetType?.toUpperCase() + "-" + selectedAsset?.assetNumber} /> */}
          

          {serviceFields.length > 1 && <button type="button" className="my-2" onClick={() => onServiceRemoved(serviceIndex)}>❌ Remove Service</button>}
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

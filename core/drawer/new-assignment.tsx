import React from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardHeader, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem } from "@heroui/react";
import { DeleteIcon, PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import AvatarSelect from "../common/avatar-select";
import {parseDate} from "@internationalized/date";
import { APPOINTMENTS_API_URL, BRANCH_API_URL, CUSTOMERS_API_URL } from "../utilities/api-url";
import Link from "next/link";
import { toast } from "react-toastify";

const NewAssignment = (props:any) => {
    const { register, handleSubmit, watch, formState: { errors }, control, setValue, reset } = useForm({
      defaultValues: {
        appointmentDate: parseDate(new Date().toISOString().split("T")[0]), 
        startTime: null, 
        branchId: null, 
        customerId: null, 
        pax: [ [{serviceId: null, durationList: [], duration: null, price: null, busyEmployees: [], employeeList: [], employeeId: null}] ],
        note: null
      }
    });
    const { fields: paxFields, append: addPax, remove: removePax } = useFieldArray({
      control,
      name: "pax",
    });
  

    const [error, setError] = React.useState(null)
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
      getCustomerList();
      getBranchList();
    }, [])


    React.useEffect(() => {
      const totalSum = pax.flat().reduce((sum, item: any) => sum + (item?.price || 0), 0);
      setTotalAmount(totalSum)
    },[pax])
    
    React.useEffect(() => {
      setValue("pax", [ [{serviceId: null, durationList: [], duration: null, price: null, busyEmployees: [], employeeList: [], employeeId: null}] ])
    }, [startTime])
  

    
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
        }catch(err:any) { setError(err) }
    }
    
    const getBranchById = async (id: string) => {
      try {
          const branches = await fetch(`${BRANCH_API_URL}/${id}`)
          const parsed = await branches.json();
          setServiceList(parsed?.employeeServices)
          setEmployeeList(parsed?.groupEmployees)
        }catch(err:any) { setError(err) }
    }
    const getCustomerList = async () => {
      try {
          const customers = await fetch(CUSTOMERS_API_URL)
          const parsed = await customers.json();
          setCustomerList(parsed);
        }catch(err:any) { setError(err) }
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
            durationList: [], 
            duration: null,  
            price: null, 
            busyEmployees: [],
            employeeList: [], 
            employeeId: null 
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
      data = {...data, totalAmount}
      data.appointmentDate = data.appointmentDate?.toString();
      data.startTime = convertTo24HourFormat(data.startTime);
      data.paymentStatus = "Pending"
      data.taskStatus = "Pending"
      data.status = true;
        
      try {
          const appointment = await fetch(APPOINTMENTS_API_URL, {
              method: "POST",
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
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.customer ? "Update":"New"} Assignment </DrawerHeader>
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
                    <Select {...register("startTime", {required: true})} label="Select Time">
                      {timeList.map((value) => (
                        <SelectItem key={value.key}>{value.label}</SelectItem>
                      ))}
                    </Select>
                    <Select className="w-2/5" label="Pax" onChange={(event:any) => onPaxChange(+event.target.value)}>
                      {Array.from({ length: 5 }, (_, i) => (i + 1).toString())?.map((val: string) => {
                        return <SelectItem key={val}>{val}</SelectItem>
                      })}
                    </Select>
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
                    endContent={<Link href={"/customers"}> <Button size="sm"><PlusIcon width={10} />ADD</Button> </Link>}>
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


                      
                  {branchId && <section className="flex items-center px-2 mt-3 gap-3 border-b-5 border-primary">
                    {paxFields.map((paxField, paxIndex) => (
                      <Button key={paxField.id} size="sm" color={paxIndex === selectedTab ? "primary":"default"}
                        variant="solid" onPress={() => setSelectedTab(paxIndex)} style={{borderRadius: "2px"}}
                        >Person {paxIndex + 1}</Button>
                    ))}
                  </section>}

                  {branchId && <div className="py-3">
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
                  <Button color="primary" type="submit" size="lg" className={`w-full ${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.customer ? "Update" : "Save"} Appointment
                  </Button>
                  {/* <Button color="danger" variant="bordered" onPress={() => onDrawerClose()}> Close </Button> */}
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

export default NewAssignment



  
// Separate component to handle nested "serviceIds" array
const ServiceList = ({ control, paxIndex, register, errors, watch, setValue, startTime, serviceList, employeeList, getNextTimeSlot }: any) => {
  const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({
    control,
    name: `pax.${paxIndex}`,
  });
  

  const onServiceSelection = (id: string, serviceIndex: number) => {
    const service = serviceList?.find((item: any) => item._id === id)
                  
    setValue(`pax.${paxIndex}.${serviceIndex}.durationList`, service?.variants || [])
    setValue(`pax.${paxIndex}.${serviceIndex}.duration`, null)
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, [])
  }

  const onDurationSelection = (item: any, serviceIndex: number, durationList: any, serviceId: string, servStartTime: string) => {
    setStartTimeForService(serviceIndex);
    
    const index: any = Array.from(item)[0]
    setValue(`pax.${paxIndex}.${serviceIndex}.duration`, +index)
    const price:any = durationList?.find((e:any) => +e.serviceDuration === +index)?.defaultPrice
    setValue(`pax.${paxIndex}.${serviceIndex}.price`, price)
    
    const filteredEmployee = employeeList?.filter((item: any) => item.servicesId.includes(serviceId))
    console.log(filteredEmployee);
    
    setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, price ? filteredEmployee : [])
    
  }

  const getBusyEmployeesWithNextSlot = async (time: string, duration: number, serviceIndex: number) => {
    try {
        const branches = await fetch(`${APPOINTMENTS_API_URL}/busy-employees?startTime=${time}&duration=${duration}`)
        const parsed = await branches.json();
        console.log(parsed);
        setValue(`pax.${paxIndex}.${serviceIndex}.busyEmployees`, parsed.busyEmployeesWithSlots)
        
      }catch(err:any) { console.log(err) }
  }
  

  const setStartTimeForService = (serviceIndex: number) => {
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
    getBusyEmployeesWithNextSlot(value, +watch(`pax.${paxIndex}.${serviceIndex}.duration`), serviceIndex)
  }


  return (
    <div>

      {serviceFields.map((serviceField, serviceIndex) => {
        const serviceId = watch(`pax.${paxIndex}.${serviceIndex}.serviceId`)
        const durationList = watch(`pax.${paxIndex}.${serviceIndex}.durationList`)
        const servStartTime = watch(`pax.${paxIndex}.${serviceIndex}.startTime`)
        // const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
        const price = watch(`pax.${paxIndex}.${serviceIndex}.price`)
        const paxEmployeeList = watch(`pax.${paxIndex}.${serviceIndex}.employeeList`)
        const busyEmployees = watch(`pax.${paxIndex}.${serviceIndex}.busyEmployees`)

        return <div key={serviceField.id} className="flex flex-col gap-2">
          {/* {servStartTime + "===" + duration + "===" + price + "==="} */}
          
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
            
            <Select {...register(`pax.${paxIndex}.${serviceIndex}.duration`)} className="w-3/5" label="Duration" 
              onSelectionChange={(item: any) => onDurationSelection(item, serviceIndex, durationList, serviceId, servStartTime)}>
              {durationList?.map((item:any) => <SelectItem textValue={item.serviceDuration} key={item.serviceDuration}>{item.serviceDuration} min</SelectItem>)}
            </Select>

          </div>
          
          <div className="flex items-center gap-2">

            <Controller name={`pax.${paxIndex}.${serviceIndex}.employeeId`} control={control} rules={{required: true}}
              render={({ field }) => (
                <AvatarSelect field={field} data={paxEmployeeList} label="Staff" keyName="firstname" showStatus={true} disabledKeys={busyEmployees} />
              )}
            />

            <Input className="w-3/5" type="text" label={"Amount"} readOnly value={price} />
          </div>
          

          {serviceFields.length > 1 && <button type="button" className="my-2" onClick={() => removeService(serviceIndex)}>❌ Remove Service</button>}
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

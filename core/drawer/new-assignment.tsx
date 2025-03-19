import React from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardHeader, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem } from "@heroui/react";
import { DeleteIcon, PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import AvatarSelect from "../common/avatar-select";
import {parseDate} from "@internationalized/date";
import { APPOINTMENTS_API_URL, BRANCH_API_URL, CUSTOMERS_API_URL, SERVICES_API_URL } from "../utilities/api-url";
import Link from "next/link";
import { toast } from "react-toastify";

const NewAssignment = (props:any) => {
    const { register, handleSubmit, watch, formState: { errors }, control, setValue, reset } = useForm({
      defaultValues: {
        appointmentDate: parseDate(new Date().toISOString().split("T")[0]), 
        startTime: null, 
        branchId: null, 
        customerId: null, 
        pax: [ [{serviceId: null, durationList: [], duration: null, price: null, employeeId: null}] ],
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
    const [busyEmployeeList, setBusyEmployeeList] = React.useState([]);
    const [busyTimeSlots, setBusyTimeSlots] = React.useState([]);
    const [customerList, setCustomerList] = React.useState([]);
    const [serviceList, setServiceList] = React.useState([]);
    const [serviceIds, setServiceIds] = React.useState<any>([])
    const [totalAmount, setTotalAmount] = React.useState<any>(0)
    const [totalDuration, setTotalDuration] = React.useState<any>(0)
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
      getBranchList();
    },[pax])
    
    React.useEffect(() => {
      const branch:any = branchList.find((item:any) => item._id === branchId);
      let allEmployees = getDisabledTimeSlots(branch?.groupEmployees, appointmentDate?.toString(), timeList)
      let busyEmployees = allEmployees?.filter((item:any)=> (item.totalDuration + totalDuration) > 480)?.map((e:any) => e._id);
      
      setBusyEmployeeList(() => busyEmployees)
      setEmployeeList(allEmployees || [])
    }, [branchId, appointmentDate])
  

    
    const getDisabledTimeSlots = (employees: any, date: string, timeList: {key: string, label: string}[]) => {
      
      employees?.forEach((employee:any) => {
        const disabledSlots = new Set();
        let totalDuration = 0;
        if (employee.appointments) {
          employee.appointments.filter((item:any) => item.appointmentDate.split("T")[0] === date).forEach((appointment:any) => {
            totalDuration += appointment.totalDuration;
            let currentTime = appointment.startTime;
            let duration = appointment.totalDuration; // in minutes
  
            while (duration > 0) {
              disabledSlots.add(currentTime);
              currentTime = getNextTimeSlot(currentTime, 30); // Assuming 30-min slots
              duration -= 30;
            }
          });
        }
        employee.disabledSlots = timeList.filter((time) => disabledSlots.has(time.key));
        employee.totalDuration = totalDuration;
      });
    
      return employees;
    };
    
    // Helper function to get the next time slot
    const getNextTimeSlot = (time: any, interval: number) => {
      let [hour, minute, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);
      hour = parseInt(hour);
      minute = parseInt(minute) + interval;

      // Handle minute overflow
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }

      // Handle hour and period change
      if (hour >= 12) {
        if (hour > 12) hour -= 12;
        period = period === "AM" ? "PM" : "AM";
      }

      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`;
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
      
      const updatedPax = Array.from({ length: value }, () => [
        { serviceId: null, durationList: [], duration: null,  price: null, employeeId: null },
      ]);

      setValue("pax", updatedPax);
    };
  
    const onServiceSelection = (value: any) => {
      const filteredEmployee = employeeList?.filter((item: any) => item.servicesId.includes(value))
      setEmployeeList(() => filteredEmployee)
    };

    const onSubmit = async (data:any) => {
      data = {...data, totalAmount}
      data.appointmentDate = data.appointmentDate?.toString();
      data.paymentStatus = "Pending"
      data.taskStatus = "Pending"
      data.status = true;
      data.pax = await data.pax?.map((item:any) => {
        item = item?.map((nested: any, index: number, arr: any) => {
          const {serviceId, duration, price, employeeId} = nested
          if(index == 0) nested.startTime = startTime;
          else {
            let prevDurationSum = 0;
            for(var i = 0; i < index; i++){
              prevDurationSum += +item[i].duration
            }
            nested.startTime = getNextTimeSlot(startTime, +prevDurationSum)
          }

          return {serviceId, duration: +duration, price, employeeId, startTime: nested.startTime}
        })
        return item
      })
        
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
                          {...field}
                          hideTimeZone showMonthAndYearPickers label="Date & Time" variant="bordered"
                          defaultValue={field.value}
                          onChange={(date) => field.onChange(date)} // Ensure React Hook Form updates the state
                        />
                      )}
                    />
                    <Select {...register("startTime", {required: true})} label="Select Time" 
                      disabledKeys={busyTimeSlots}>
                      {timeList.map((value) => (
                        <SelectItem key={value.key}>{value.label}</SelectItem>
                      ))}
                    </Select>
                    <Select className="w-2/5" label="Pax" onChange={(event:any) => onPaxChange(+event.target.value)}>
                      <SelectItem key="1">1</SelectItem>
                      <SelectItem key="2">2</SelectItem>
                      <SelectItem key="3">3</SelectItem>
                      <SelectItem key="4">4</SelectItem>
                      <SelectItem key="5">5</SelectItem>
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
                          <ServiceList control={control} paxIndex={paxIndex} register={register} watch={watch} setValue={setValue} serviceList={serviceList} employeeList={employeeList} onServiceSelection={onServiceSelection} />
                        </div>
                      ))}
                      
                  </div>}
                  

                  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start", flexDirection: "column"}}>
                  {/* <Autocomplete defaultItems={serviceList} placeholder="Add Services" 
                    disabledKeys={serviceIds?.map((e:any) => e._id)}
                    onSelectionChange={onServiceSelection} >
                    {(item:any) => <AutocompleteItem key={item._id}>{item.name}</AutocompleteItem>}
                  </Autocomplete> */}
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


// Separate component to handle nested "serviceIds" array
const ServiceList = ({ control, paxIndex, register, watch, setValue, serviceList, employeeList, onServiceSelection }: any) => {
  const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({
    control,
    name: `pax.${paxIndex}`,
  });
  
  return (
    <div>

      {serviceFields.map((serviceField, serviceIndex) => {
        const serviceId = watch(`pax.${paxIndex}.${serviceIndex}.serviceId`)
        const durationList = watch(`pax.${paxIndex}.${serviceIndex}.durationList`)
        const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
        const price = watch(`pax.${paxIndex}.${serviceIndex}.price`)
        const employeeId = watch(`pax.${paxIndex}.${serviceIndex}.employeeId`)
        return <div key={serviceField.id} className="flex flex-col gap-2">
          {/* {serviceId + "===" + duration + "===" + price + "===" + employeeId}
          {JSON.stringify(durationList)} */}
          <div className="flex items-center gap-2">
            <Controller name={`pax.${paxIndex}.${serviceIndex}.serviceId`} control={control} rules={{required: true}}
              render={({ field }) => (
                <AvatarSelect field={field} data={serviceList} label="Services" keyName="name" onChange={(id:string) => {
                  const service = serviceList?.find((item: any) => item._id === id)
                  
                  setValue(`pax.${paxIndex}.${serviceIndex}.durationList`, service?.variants || [])
                  setValue(`pax.${paxIndex}.${serviceIndex}.duration`, service?.variants[0].serviceDuration)
                  onServiceSelection(id)
                }} showStatus={true} />
              )}
            />
            
            <Select {...register(`pax.${paxIndex}.${serviceIndex}.duration`, {required: true})} className="w-3/5" label="Duration" 
              onSelectionChange={(item: any) => {
                const index: any = Array.from(item)[0]
                const price:any = durationList?.find((e:any) => +e.serviceDuration === +index)?.defaultPrice
                setValue(`pax.${paxIndex}.${serviceIndex}.price`, price)
              }}>
              {durationList?.map((item:any) => <SelectItem textValue={item.serviceDuration} key={item.serviceDuration}>{item.serviceDuration} min</SelectItem>)}
            </Select>

          </div>
          
          <div className="flex items-center gap-2">

            <Controller name={`pax.${paxIndex}.${serviceIndex}.employeeId`} control={control} rules={{required: true}}
              render={({ field }) => (
                <AvatarSelect field={field} data={employeeList} label="Staff" keyName="firstname" showStatus={true} />
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



// const ServiceCard = (props:any) => {

//   return (
//     <Card className="w-full flex-shrink-0 min-w-[250px]">
//       <CardHeader className="justify-between">
//         <div className="flex gap-3">
//           <Avatar isBordered radius="full" size="sm" src={props.image} />
//           <div className="flex flex-col gap-1 items-start justify-center">
//             <h4 className="text-small font-semibold leading-none text-default-600">{props.name}</h4>
//             <h5 className="text-small tracking-tight text-default-400"> 
//               <strong>Rs. {props.variants[0].defaultPrice}</strong> 
//               <select className="ms-2" name="duration">
//                 {props?.variants?.map((item:any) => <option value={item.serviceDuration}> {item.serviceDuration} min </option>)}
//               </select>
//             </h5>
//           </div>
//         </div>
//         <div className="cursor-pointer" onClick={props.onDelete}>
//             <DeleteIcon  width="15" color="darkred" />
//         </div> 
//       </CardHeader>
//     </Card>
//   );
// }


export default NewAssignment

const timeList = [
  {key: "10:00 AM", label: "10:00 AM"},
  {key: "10:30 AM", label: "10:30 AM"},
  {key: "11:00 AM", label: "11:00 AM"},
  {key: "11:30 AM", label: "11:30 AM"},
  {key: "12:00 PM", label: "12:00 PM"},
  {key: "12:30 PM", label: "12:30 PM"},
  {key: "01:00 PM", label: "01:00 PM"},
  {key: "01:30 PM", label: "01:30 PM"},
  {key: "02:00 PM", label: "02:00 PM"},
  {key: "02:30 PM", label: "02:30 PM"},
  {key: "03:00 PM", label: "03:00 PM"},
  {key: "03:30 PM", label: "03:30 PM"},
  {key: "04:00 PM", label: "04:00 PM"},
  {key: "04:30 PM", label: "04:30 PM"},
  {key: "05:00 PM", label: "05:00 PM"},
  {key: "05:30 PM", label: "05:30 PM"},
  {key: "06:00 PM", label: "06:00 PM"},
];

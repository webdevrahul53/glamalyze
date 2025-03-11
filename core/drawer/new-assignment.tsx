import React from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardHeader, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Textarea } from "@heroui/react";
import { DeleteIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm, useWatch } from "react-hook-form";
import AvatarSelect from "../common/avatar-select";
import {now, getLocalTimeZone} from "@internationalized/date";

export const NewAssignment = (props:any) => {
    const { register, handleSubmit, watch, formState: { errors }, control, setValue, reset } = useForm({
      defaultValues: {datetime: now(getLocalTimeZone()), branchId: null, customerId: null, employeeId: null, note: null}
    });
    const [error, setError] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [branchList, setBranchList] = React.useState([]);
    const [employeeList, setEmployeeList] = React.useState([]);
    const [customerList, setCustomerList] = React.useState([]);
    const [serviceList, setServiceList] = React.useState([]);
    const [serviceIds, setServiceIds] = React.useState<any>([])
    const [totalAmount, setTotalAmount] = React.useState<any>(0)
    const [totalDuration, setTotalDuration] = React.useState<any>(0)

    
    const customerId = useWatch({ control, name: "customerId" });
    const datetime = useWatch({ control, name: "datetime" });
    

    const currentDate = new Date();

    React.useEffect(() => {
      getBranchList();
      getCustomerList();
      getServiceList()
    }, [])



    React.useEffect(() => {
      setTotalAmount(serviceIds.reduce((total:any, item:any) => +total + (item?.defaultPrice || 0), 0))
      setTotalDuration(serviceIds.reduce((total:any, item:any) => +total + (item?.serviceDuration || 0), 0))
    },[serviceIds])

    const getBranchList = async () => {
      try {
          const branches = await fetch("/api/branches")
          const parsed = await branches.json();
          setBranchList(parsed);
        }catch(err:any) { setError(err) }
    }
    const getCustomerList = async () => {
      try {
          const customers = await fetch("/api/customers")
          const parsed = await customers.json();
          setCustomerList(parsed);
        }catch(err:any) { setError(err) }
    }
    const getEmployeeList = async (id:string) => {
      setValue("employeeId",null)
      if(!id) return;
      try {
          const category = await fetch(`/api/branches/${id}`)
          const parsed = await category.json();
          setEmployeeList(parsed.employees);
        }catch(err:any) { setError(err) }
    }
  

    const getServiceList = async () => {
      try {
          const services = await fetch("/api/services")
          const parsed = await services.json();
          setServiceList(parsed);
        }catch(err:any) { setError(err) }
    }
  
    const onServiceSelection = (value: any) => {
      const item:any = serviceList.find((service:any) => service._id === value);
      if(!item) return;
      let array = serviceIds;
      const exists = array.some((obj:any) => obj["_id"] === item["_id"]);
      setServiceIds(exists ? array.filter((obj:any) => obj["_id"] !== item["_id"]) : [...array, item]);
    };

    const onSubmit = async (data:any) => {
      data = {...data, totalAmount, totalDuration}
      data.datetime = data.datetime.toDate().toISOString();
      data.serviceIds = serviceIds.map((e:any) => e._id)
      data.paymentStatus = "Pending"
      data.status = "Pending"
      console.log(data);
      

      if(data.serviceIds.length === 0) return alert("Add Services")
        
      try {
          const appointment = await fetch("/api/appointments", {
              method: "POST",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" }
          })
          const parsed = await appointment.json();
          console.log(parsed);
          
          setLoading(false)
          if(parsed.status){
              setError(null)
              reset(); 
              props.onOpenChange();
          }else setError(parsed.message)
        }catch(err:any) {
          setLoading(false)
          setError(err)
        }
    }
  

    const onDrawerClose = () => {
        props.onOpenChange();
        reset(); 
    }
  
  
    return (
      <Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.customer ? "Update":"New"} Assignment </DrawerHeader>
                <DrawerBody> 
                
                  <div className="flex ">
                    <div className="w-1/2 p-2 border border-3">
                      <span>On</span> <i><strong> {datetime ? datetime.toDate().toDateString() : "MM DD YYYY"} </strong>  </i> 
                    </div>
                    <div className="w-1/2 p-2 border border-3">
                      <span>At</span> <i><strong> {datetime ? datetime.toDate().toLocaleTimeString() : "HH MM SS"} </strong>  </i> 
                    </div>
                  </div>

                  <Controller name="datetime" control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        hideTimeZone showMonthAndYearPickers label="Date & Time" variant="bordered"
                        defaultValue={field.value}
                        onChange={(date) => field.onChange(date)} // Ensure React Hook Form updates the state
                      />
                    )}
                  />



                  
                  <Controller name="branchId" control={control} rules={{required: true}}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" onChange={(id:string) => getEmployeeList(id)}  />
                    )}
                    />
                  {errors.branchId && <div className="text-danger text-sm -mt-2 ms-3">Branch is required</div>}




                  {customerId ? <AvatarCard {...customerList?.find((e:any) => e._id === watch("customerId")) || {}} onDelete={() => setValue("customerId", null)}  /> : 
                    <Controller name="customerId" control={control} rules={{required: true}}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={customerList} label="Customer" keyName="firstname" />
                    )}
                  />}
                  {errors.customerId && <div className="text-danger text-sm -mt-2 ms-3">Customer is required</div>}


                  <div className="flex gap-2 flex-wrap">
                    {serviceIds?.map((item:any) => (
                      <ServiceCard {...item} onDelete={() => onServiceSelection(item._id)} />
                    ))}
                  </div>

                  <Controller name="employeeId" control={control} rules={{required: true}}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={employeeList} label="Staff" keyName="firstname" />
                    )}
                  />
                  {errors.employeeId && <div className="text-danger text-sm -mt-2 ms-3">Employee is required</div>}

                  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start", flexDirection: "column"}}>
                  <Autocomplete defaultItems={serviceList} placeholder="Add Services"
                    onSelectionChange={onServiceSelection} >
                    {(item:any) => <AutocompleteItem key={item._id}>{item.name}</AutocompleteItem>}
                  </Autocomplete>
                  <Textarea {...register("note")} label="Note" placeholder="Enter Note" />
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



const ServiceCard = (props:any) => {

  return (
    <Card className="w-full flex-shrink-0 min-w-[250px]">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <Avatar isBordered radius="full" size="sm" src={props.image} />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{props.name}</h4>
            <h5 className="text-small tracking-tight text-default-400"> <strong>Rs. {props.defaultPrice}</strong> <i> {props.serviceDuration} min</i> </h5>
          </div>
        </div>
        <div className="cursor-pointer" onClick={props.onDelete}>
            <DeleteIcon  width="15" color="darkred" />
        </div> 
      </CardHeader>
    </Card>
  );
}

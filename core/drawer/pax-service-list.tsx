import { useFieldArray } from "react-hook-form";
import { APPOINTMENT_SERVICES_API_URL, ASSETS_API_URL, COUPONS_API_URL } from "../utilities/api-url";
import ServiceCard from "../common/servicd-card";
import { Autocomplete, AutocompleteItem, Avatar, Card, CardHeader } from "@heroui/react";
import { toast } from "react-toastify";
import { CloseIcon } from "../utilities/svgIcons";
import React from "react";

  
// Separate component to handle nested "serviceIds" array
const PaxServiceList = ({ control, paxIndex, register, errors, watch, setValue, startTime, serviceList, allServiceList, employeeList, getNextTimeSlot }: any) => {
    const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({
      control,
      name: `pax.${paxIndex}`,
    });
  
    React.useEffect(() => {
      const serviceId = watch(`pax.${0}.${0}.serviceId`)
      if(!serviceId && serviceList?.length) onServiceSelection("67fcbfc92e5d5efc267985b0", 0)
    }, [serviceList])


    const onServiceSelection = (id: string, serviceIndex: number) => {
      setValue(`pax.${paxIndex}.${serviceIndex}.serviceId`, id)
      setValue(`pax.${paxIndex}.${serviceIndex}.duration`, null)
      setValue(`pax.${paxIndex}.${serviceIndex}.couponUsed`, null)
      setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, null)
      setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, [])
      setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, [])
      const service = serviceList?.find((item: any) => item._id === id)
      const duration = service?.variants[0]?.serviceDuration
      setValue(`pax.${paxIndex}.${serviceIndex}.durationList`, service?.variants || [])
      setValue(`pax.${paxIndex}.${serviceIndex}.assetTypeId`, service?.assetTypeId)
      onDurationSelection({target:{value: duration}}, serviceIndex)
      getCouponList(serviceIndex)
    }
    
    const getCouponList = async (serviceIndex: number) => {
      try {
        const branchId = watch(`branchId`);
        const serviceId = watch(`pax.${paxIndex}.${serviceIndex}.serviceId`)
        const coupons = await fetch(`${COUPONS_API_URL}?branchId=${branchId}&serviceId=${serviceId}`)
        const parsed = await coupons.json();
        setValue(`pax.${paxIndex}.${serviceIndex}.couponList`, parsed || [])
      }catch(err:any) { console.log(err) }
    }

    const onCouponSelection = (item: any, serviceIndex: number) => {
      const couponId = item?.target?.value
      setValue(`pax.${paxIndex}.${serviceIndex}.couponUsed`, couponId)
      calculatePriceDiscount(serviceIndex);
    }
  
    const onDurationSelection = (item: any, serviceIndex: number) => {
      const duration: number = +item?.target?.value
      setValue(`pax.${paxIndex}.${serviceIndex}.duration`, duration)
      setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, [])
      setValue(`pax.${paxIndex}.${serviceIndex}.employeeList`, [])
      setStartTimeForService(serviceIndex, duration);
      calculatePriceDiscount(serviceIndex)
    }
    
    const calculatePriceDiscount = (serviceIndex: number) => {
      const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
      const durationList = watch(`pax.${paxIndex}.${serviceIndex}.durationList`)
      const couponUsed = watch(`pax.${paxIndex}.${serviceIndex}.couponUsed`)
      const couponList = watch(`pax.${paxIndex}.${serviceIndex}.couponList`)
      
      const price: any = durationList?.find((e: any) => +e.serviceDuration === +duration)?.defaultPrice;
      const coupon = couponList?.find((item: any) => item._id === couponUsed);
      const discount = coupon?.discountPercent ? Math.ceil((price * coupon.discountPercent) / 100) : 0;
      const subTotal = price - discount;

      setValue(`pax.${paxIndex}.${serviceIndex}.discount`, discount);
      setValue(`pax.${paxIndex}.${serviceIndex}.price`, price);
      setValue(`pax.${paxIndex}.${serviceIndex}.subTotal`, subTotal);
      
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
        selectedEmployeeIds = unwindAndDistinct(selectedEmployeeIds);
        
        const filteredEmployee = employeeList?.filter((item: any) => item.servicesId.includes(serviceId))
        const disabledEmployees = [...parsed?.busyEmployeesWithSlots || [], ...selectedEmployeeIds];
        // const disabledIds = disabledEmployees?.map((emp: any) => emp?.employeeId) || [];
        // const availableEmployees = filteredEmployee?.filter((item: any) => !disabledIds.includes(item._id));
  
        // setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, duration && availableEmployees.length ? [availableEmployees?.[0]?._id] : [])
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
        setValue(`pax.${paxIndex}.${serviceIndex}.assetList`, seats)
        
        if(seats?.length){
          // setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, seats?.[0]?._id)
        }else{
          toast.error("Asset not available")
        }
        
      }catch(err:any) { console.log(err) }
    }
  
    const unwindAndDistinct = (input:any) => {
      
      const unwound = input.flatMap((item:any) =>
        item.employeeId.map((id: string) => ({
          employeeId: id,
          nextAvailableTime: item.nextAvailableTime,
        }))
      );

      const distinctMap = new Map();

      unwound.forEach(({ employeeId, nextAvailableTime }: any) => {
        const existing = distinctMap.get(employeeId);
        if (!existing || existing.nextAvailableTime > nextAvailableTime) {
          distinctMap.set(employeeId, { employeeId, nextAvailableTime });
        }
      });

      return Array.from(distinctMap.values());
    }


    const onServiceRemoved = (serviceIndex: number) => {
      const nextService = watch(`pax.${paxIndex}.${serviceIndex+1}`)
      nextService && setValue(`pax.${paxIndex}.${serviceIndex+1}.serviceId`, null)
      removeService(serviceIndex)
    }
  
    return (
      <div>
  
        {serviceFields.map((serviceField, serviceIndex) => {
          const subTotal = watch(`pax.${paxIndex}.${serviceIndex}.subTotal`)
          const discount = watch(`pax.${paxIndex}.${serviceIndex}.discount`)
          const couponUsed = watch(`pax.${paxIndex}.${serviceIndex}.couponUsed`)
          const durationList = watch(`pax.${paxIndex}.${serviceIndex}.durationList`)
          const couponList = watch(`pax.${paxIndex}.${serviceIndex}.couponList`)
          // const servStartTime = watch(`pax.${paxIndex}.${serviceIndex}.startTime`)
          // const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
          const price = watch(`pax.${paxIndex}.${serviceIndex}.price`)
          const paxEmployeeList = watch(`pax.${paxIndex}.${serviceIndex}.employeeList`)
          const busyEmployees = watch(`pax.${paxIndex}.${serviceIndex}.busyEmployees`)
          const assetList = watch(`pax.${paxIndex}.${serviceIndex}.assetList`)
          const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
          const assetId = watch(`pax.${paxIndex}.${serviceIndex}.assetId`)
          const selectedAsset = assetList?.find((item:any) => item._id === assetId);
          const serviceId = watch(`pax.${paxIndex}.${serviceIndex}.serviceId`)
          const employeeId: string[] = watch(`pax.${paxIndex}.${serviceIndex}.employeeId`)
  
          return <div key={serviceField.id} className="flex flex-col gap-2">
            {errors.pax?.[paxIndex]?.[serviceIndex] && (
              <p className="text-danger text-sm ms-2"> Required fields are mandatory </p>
            )}
            {serviceId && serviceId != "67fcbfc92e5d5efc267985b0" ? <ServiceCard {...allServiceList?.find((item:any) => item._id === serviceId)} onDelete={() => setValue(`pax.${paxIndex}.${serviceIndex}.serviceId`, null)} /> : 
              <Autocomplete {...register(`pax.${paxIndex}.${serviceIndex}.serviceId`)} 
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
            
            
            <div className="flex items-center gap-2">
              <div className="w-1/4 border-2 rounded p-1 px-2">
                <select {...register(`pax.${paxIndex}.${serviceIndex}.duration`)} value={duration} className="w-full py-3 outline-none"
                  onChange={(item: any) => onDurationSelection(item, serviceIndex)}>
                    <option value="">Duration</option>
                  {durationList?.map((item:any, index: number) => <option key={index} value={item.serviceDuration}>{item.serviceDuration} min</option>)}
                </select>
              </div>
              
  
              <div className="w-2/4">
                {assetId ? <ServiceCard name={`${selectedAsset?.assetType} - ( ${selectedAsset?.assetNumber} )`} image={selectedAsset?.assetTypeId?.image} onDelete={() => setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, null)} /> : 
                  <Autocomplete {...register(`pax.${paxIndex}.${serviceIndex}.assetId`)} 
                  defaultItems={assetList || []} label="Place" 
                  labelPlacement="inside" placeholder="Select place" variant="bordered" 
                  onSelectionChange={(id:string) => setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, id)}
                  >
                  {(user:any) => {
                    return <AutocompleteItem key={user._id} textValue={user.assetNumber}>
                      <div className="flex gap-2 items-center">
                        <Avatar alt={user.assetType} className="flex-shrink-0" size="sm" src={user.assetTypeId?.image} />
                        <div className="flex flex-col">
                          <span className="text-small">{user.assetType} - ( {user.assetNumber} ) </span>
                          <span className="text-tiny text-default-400">{user.assetTypeId?.createdAt}</span>
                        </div>
                      </div>
                    </AutocompleteItem>
                  }}
                  
                </Autocomplete>}
              </div>

              
              <div className="w-2/4 border-2 rounded p-1 px-2">
                <select {...register(`pax.${paxIndex}.${serviceIndex}.couponUsed`)} value={couponUsed} className="w-full py-3 outline-none"
                  onChange={(item: any) => onCouponSelection(item, serviceIndex)}>
                  <option value="">Coupon</option>
                  {couponList?.map((item:any, index: number) => <option key={index} value={item._id}>{item.couponName} ( {item.discountPercent} % )</option>)}
                </select>
              </div>
              {/* <div className="w-1/2 border-2 rounded p-1">
                <select {...register(`pax.${paxIndex}.${serviceIndex}.assetId`)} value={assetId} className="w-full py-3 outline-none">
                    <option value="">Place</option>
                  {assetList?.map((item:any, index: number) => <option key={index} value={item._id}>{item?.assetTypeId?.assetTypeName?.toUpperCase()} - {item.assetNumber}</option>)}
                </select>
              </div> */}
              {/* <Input className="w-1/2" type="text" label={"Place"} readOnly value={assetList ? assetList?.assetTypeId?.toUpperCase() + "-" + assetList?.assetNumber : ""} /> */}
            </div>
  
  
            <Autocomplete
              defaultItems={paxEmployeeList || []} label="Staffs" 
              labelPlacement="inside" placeholder="Select staff" variant="bordered" 
              disabledKeys={busyEmployees?.map((item:any) => item.employeeId)}
              onSelectionChange={(id:any) => {
                if(!id) return;
                let arr = employeeId || [];
                if (arr.includes(id)) {
                  arr = arr?.filter((item: string) => item !== id); // remove
                } else {
                  arr = [...arr, id]; // add
                }
                setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, arr);
              }}
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
              
            </Autocomplete>
  
            <div className="flex flex-wrap items-center gap-2">
              {(Array.isArray(employeeId) ? employeeId : []).map((empId: string) => {
                return <div><CustomChips {...paxEmployeeList?.find((item:any) => item._id === empId)} onDelete={() => {
                  let arr = employeeId || [];
                  arr = arr?.filter((item: string) => item !== empId); // remove
                  setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, arr)
                }} /></div>
              })} 
            </div>
  
            
            <div className="flex items-start justify-between gap-2 px-2">
              <button type="button" className="my-2" onClick={() => onServiceRemoved(serviceIndex)}>❌ Remove </button>
              <div className="flex flex-col items-center gap-2">
                <strong>Price - ฿ {price || 0}</strong>
                <strong>Discount - ฿ {discount || 0}</strong>
                <strong>Sub Total - ฿ {subTotal || 0}</strong>
              </div>
            </div>
  
            <hr className="py-3" />
            {/* <input type="text" className="w-1/5" value={assetList?.assetTypeId?.toUpperCase() + "-" + assetList?.assetNumber} /> */}
            
  
          </div>
          
          
        })}
  
        <div className="text-center mt-2">
          <button type="button" onClick={() => addService({ serviceId: null, duration: null, employeeId: [] })}>
            ➕ Add Service
          </button>
        </div>
      </div>
    );
};



export default PaxServiceList;



const CustomChips = (props:any) => {
  const name = props?.name ? props?.name : props?.firstname + " " + props?.lastname
  return (
    <Card className="w-full flex-shrink-0 shadow-sm border-2">
      <CardHeader className="justify-between gap-2 p-2">
        <div className="flex gap-3">
          <Avatar isBordered radius="full" size="sm" src={props.image} />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{name}</h4>
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
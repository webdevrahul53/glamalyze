import { useFieldArray } from "react-hook-form";
import { APPOINTMENT_SERVICES_API_URL, ASSETS_API_URL } from "../utilities/api-url";
import ServiceCard from "../common/servicd-card";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { toast } from "react-toastify";

  
// Separate component to handle nested "serviceIds" array
const PaxServiceList = ({ control, paxIndex, register, errors, watch, setValue, startTime, serviceList, allServiceList, employeeList, getNextTimeSlot }: any) => {
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
      const duration = service?.variants[0]?.serviceDuration
      setValue(`pax.${paxIndex}.${serviceIndex}.durationList`, service?.variants || [])
      setValue(`pax.${paxIndex}.${serviceIndex}.assetTypeId`, service?.assetTypeId)
      onDurationSelection({target:{value: duration}}, serviceIndex, service?.variants)
    }
  
    const onDurationSelection = (item: any, serviceIndex: number, durationList: any) => {
      const index: any = item?.target?.value
      const price:any = durationList?.find((e:any) => +e.serviceDuration === +index)?.defaultPrice
      setValue(`pax.${paxIndex}.${serviceIndex}.duration`, index)
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
          const duration = watch(`pax.${paxIndex}.${serviceIndex}.duration`)
          const assetId = watch(`pax.${paxIndex}.${serviceIndex}.assetId`)
          const selectedAsset = assetList?.find((item:any) => item._id === assetId);
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
            
            
            <div className="flex items-center gap-2">
              <div className="w-1/2 border-2 rounded p-1">
                <select {...register(`pax.${paxIndex}.${serviceIndex}.duration`)} value={duration} className="w-full py-3 outline-none"
                  onChange={(item: any) => onDurationSelection(item, serviceIndex, durationList)}>
                    <option value="">Duration</option>
                  {durationList?.map((item:any, index: number) => <option key={index} value={item.serviceDuration}>{item.serviceDuration} min</option>)}
                </select>
              </div>
              
  
              <div className="w-1/2">
                {assetId ? <ServiceCard name={`${selectedAsset?.assetType} - ( ${selectedAsset?.assetNumber} )`} image={selectedAsset?.assetTypeId?.image} onDelete={() => setValue(`pax.${paxIndex}.${serviceIndex}.assetId`, null)} /> : 
                  <Autocomplete {...register(`pax.${paxIndex}.${serviceIndex}.assetId`, {required: true})} 
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
              {/* <div className="w-1/2 border-2 rounded p-1">
                <select {...register(`pax.${paxIndex}.${serviceIndex}.assetId`)} value={assetId} className="w-full py-3 outline-none">
                    <option value="">Place</option>
                  {assetList?.map((item:any, index: number) => <option key={index} value={item._id}>{item?.assetTypeId?.assetTypeName?.toUpperCase()} - {item.assetNumber}</option>)}
                </select>
              </div> */}
              {/* <Input className="w-1/2" type="text" label={"Place"} readOnly value={assetList ? assetList?.assetTypeId?.toUpperCase() + "-" + assetList?.assetNumber : ""} /> */}
            </div>
  
  
            {employeeId ? <ServiceCard {...paxEmployeeList?.find((item:any) => item._id === employeeId)} onDelete={() => setValue(`pax.${paxIndex}.${serviceIndex}.employeeId`, null)} /> : 
              <Autocomplete {...register(`pax.${paxIndex}.${serviceIndex}.employeeId`, {required: false, default: null})} 
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



export default PaxServiceList;
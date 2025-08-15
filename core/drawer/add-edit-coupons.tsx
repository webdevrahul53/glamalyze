import React from "react";
import { Button, Checkbox, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input } from "@heroui/react";
import { SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { BRANCH_API_URL, COUPONS_API_URL, SERVICES_API_URL } from "../utilities/api-url";
import { useSelector } from "react-redux";
import AvatarSelectMultiple from "../common/avatar-select-multiple";
import {parseDate} from "@internationalized/date";

const AddEditCoupons = (props:any) => {
    const user = useSelector((state:any) => state.user.value)

    const { register, handleSubmit, control, reset } = useForm();
    const [branchList, setBranchList] = React.useState<any>([]);
    const [serviceList, setServiceList] = React.useState<any>([]);
    const [isAllBranch, setIsAllBranch] = React.useState(false);
    const [isAllService, setIsAllService] = React.useState(false);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(props.coupon) {
          props.coupon.validFrom = parseDate(new Date(props.coupon.validFrom)?.toISOString().split("T")[0])
          props.coupon.validTo = parseDate(new Date(props.coupon.validTo)?.toISOString().split("T")[0])
          reset(props.coupon)
        }
        else {
          const branchId = user?.defaultBranch || branchList[0]?._id;
          reset({branchId: [branchId], serviceId: [], couponName: null, discountPercent: 0, discountAmount: 0, validFrom: null, validTo: null, status: true})
        }
        getBranchList();
        getServiceList();
    }, [props.coupon])

    
    const getBranchList = async () => {
      try {
        const branches = await fetch(BRANCH_API_URL)
        const parsed = await branches.json();
        setBranchList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }
    
    const getServiceList = async () => {
      try {
        const services = await fetch(SERVICES_API_URL)
        const parsed = await services.json();
        setServiceList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }
    
    
    const onSubmit = async (data:any) => {
      data.validFrom = data.validFrom ? new Date(data.validFrom).toISOString() : null
      data.validTo = data.validTo ? new Date(data.validTo).toISOString() : null
      if(isAllBranch) data.branchId = branchList.map((item:any) => item._id)
      if(isAllService) data.serviceId = serviceList.map((item:any) => item._id)
      console.log(data);
    
      try {
        let url = data._id ? `${COUPONS_API_URL}/${data._id}` : COUPONS_API_URL
        const coupon = await fetch(url, {
            method: data._id ? "PATCH" : "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsed = await coupon.json();
        console.log(parsed);
        
        setLoading(false)
        if(parsed.status){
            reset(); 
            props.onOpenChange();
        }else toast.error(parsed.message)
      }catch(err:any) {
        setLoading(false)
        toast.error(err.error.message)
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
                <DrawerHeader className="flex flex-col gap-1"> {props.coupon ? "Update":"New"} Gift Vouchers </DrawerHeader>
                <DrawerBody> 

                    {branchList?.length && !isAllBranch ? <Controller name="branchId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelectMultiple field={field} data={branchList} label="Branch" keyName="branchname" />
                      )}
                      /> : <></>}


                    {serviceList?.length && !isAllService ? <Controller name="serviceId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelectMultiple field={field} data={serviceList} label="Services" keyName="name" />
                      )}
                    /> : <></>}

                    <Input {...register("couponName", {required: true})} label="Coupon Name" placeholder="Enter Coupon Name" type="text" variant="flat" isRequired />
                    <Input {...register("discountPercent")} label="Discount %" placeholder="Enter Discount Percent" type="number" variant="flat" />
                    <Input {...register("discountAmount")} label="Discount ฿" placeholder="Enter Discount Amount" type="number" variant="flat" />

                    <div className="flex items-center gap-2">
                      <Controller name="validFrom" control={control}
                        render={({ field }) => (
                          <DatePicker {...field} hideTimeZone showMonthAndYearPickers label="Valid From" variant="bordered"
                            defaultValue={field.value} onChange={(date) => { field.onChange(date) }} // Ensure React Hook Form updates the state
                          />
                        )}
                      />
                      
                      <Controller name="validTo" control={control}
                        render={({ field }) => (
                          <DatePicker {...field} hideTimeZone showMonthAndYearPickers label="Valid To" variant="bordered"
                            defaultValue={field.value} onChange={(date) => { field.onChange(date) }} // Ensure React Hook Form updates the state
                          />
                        )}
                      />
                    </div>
                    
                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>

                    <Checkbox color="primary" checked={isAllBranch} onChange={(val) => setIsAllBranch(val.target.checked)}> All Branch </Checkbox>
                    <Checkbox color="primary" checked={isAllService} onChange={(val) => setIsAllService(val.target.checked)}> All Services </Checkbox>
  
  
                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.coupon ? "Update" : "Save"} 
                  </Button>
                  <Button color="danger" variant="bordered" onPress={() => onDrawerClose()}> Close </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

export default AddEditCoupons

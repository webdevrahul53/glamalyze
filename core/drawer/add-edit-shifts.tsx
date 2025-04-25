import React from "react";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem } from "@heroui/react";
import { SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { BRANCH_API_URL, SHIFTS_API_URL, } from "../utilities/api-url";
import AvatarSelect from "../common/avatar-select";
import { useSelector } from "react-redux";

const AddEditShifts = (props:any) => {
    const user = useSelector((state:any) => state.user.value)

    const { register, handleSubmit, control, reset } = useForm();
    const [branchList, setBranchList] = React.useState<any>([]);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(props.shift) {
          reset(props.shift)
        }
        else {
          const branchId = user?.defaultBranch || branchList[0]?._id;
          reset({branchId, shiftname: null, openingAt: null, closingAt: null, status: true})
        }
        getBranchList();
    }, [props.shift])

    
    const getBranchList = async () => {
      try {
        const branches = await fetch(BRANCH_API_URL)
        const parsed = await branches.json();
        setBranchList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }
    
    
    const onSubmit = async (data:any) => {
      console.log(data);
      try {
        let url = data._id ? `${SHIFTS_API_URL}/${data._id}` : SHIFTS_API_URL
        const asset = await fetch(url, {
            method: data._id ? "PATCH" : "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsed = await asset.json();
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
      <Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.asset ? "Update":"New"} Asset</DrawerHeader>
                <DrawerBody> 

                    <Controller name="branchId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" isRequired={true} />
                      )}
                    />
                    
                    <Input {...register("shiftname", {required: true})} label="Shift Name" placeholder="Enter Shift Name" type="text" variant="flat" isRequired />

                    <div className="flex items-center gap-2">
                      <Select {...register(`openingAt`)} label="Opening" isRequired>
                        {timeList?.map((item:any) => (<SelectItem key={item.key} textValue={item.key}>{item.value}</SelectItem>))}
                      </Select>
                      <Select {...register(`closingAt`)} label="Closing" isRequired>
                        {timeList?.map((item:any) => (<SelectItem key={item.key} textValue={item.key}>{item.value}</SelectItem>))}
                      </Select>
                    </div>
                    
                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  
                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.asset ? "Update" : "Save"} 
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

export default AddEditShifts




const timeList = [
  { key: 8, value: 8},
  { key: 9, value: 9},
  { key: 10, value: 10},
  { key: 11, value: 11},
  { key: 12, value: 12},
  { key: 13, value: 13},
  { key: 14, value: 14},
  { key: 15, value: 15},
  { key: 16, value: 16},
  { key: 17, value: 17},
  { key: 18, value: 18},
  { key: 19, value: 19},
  { key: 20, value: 20},
  { key: 21, value: 21},
  { key: 22, value: 22},
  { key: 23, value: 23},
  { key: 24, value: 24},
]
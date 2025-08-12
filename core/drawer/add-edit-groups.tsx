import React from "react";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input } from "@heroui/react";
import { SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { BRANCH_API_URL, EMPLOYEES_API_URL, GROUP_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
// import ServiceCard from "../common/servicd-card";
import AvatarSelectMultiple from "../common/avatar-select-multiple";

const AddEditGroup = (props:any) => {
    const { register, handleSubmit, reset, control } = useForm({
      defaultValues: {groupname: null, branchId: null, employeesId: [], status: false}
    });
    const [loading, setLoading] = React.useState(false)
    const [employeeList, setEmployeeList] = React.useState([]);


    React.useEffect(() => {
        if(props.group) {
            let employeesId = props.group?.employee?.map((item:any) => item._id);
            reset({...props.group, employeesId})
            // setEmployeesId(props.group.employee)
        }
        else reset({groupname:null, branchId: null, status: false})

        getEmployeeList();
    }, [props.group])

    const getEmployeeList = async () => {
      try {
          const employee = await fetch(EMPLOYEES_API_URL)
          const parsed = await employee.json();
          setEmployeeList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }

    // const onServiceSelection = (value: any) => {
    //   const item:any = employeeList.find((service:any) => service._id === value);
    //   if(!item) return;
    //   let array = employeesId;
    //   const exists = array.some((obj:any) => obj["_id"] === item["_id"]);
    //   setEmployeesId(exists ? array.filter((obj:any) => obj["_id"] !== item["_id"]) : [...array, item]);
    // };

    const onSubmit = async (data:any) => {
      // data.employeesId = employeesId.map((e:any) => e._id)
      console.log(data);
      // return;
      try {
        let url = data._id ? `${GROUP_API_URL}/${data._id}` : GROUP_API_URL
        const group = await fetch(url, {
            method: data._id ? "PATCH" : "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsed = await group.json();
        console.log(parsed);
        
        setLoading(false)
        if(parsed.status){
            reset(); 
            props.onOpenChange();
            data?.branchId && assignGroupToBranch(data?.branchId, parsed?._id)
        }else toast.error(parsed.message)
      }catch(err:any) {
        setLoading(false)
        toast.error(err.error)
      }
  
    }
    

    const assignGroupToBranch = async (branchId:string, groupId:string) => {
      try {
        setLoading(true)
        const branch = await fetch(`${BRANCH_API_URL}/${branchId}?type=reset`, {
          method: "PUT",
          body: JSON.stringify({groupId}),
          headers: { "Content-Type": "application/json" }
        })
        const parsed = await branch.json();
        if(parsed.status){
          setLoading(false)
        }else toast.error(parsed.message)
      } catch (err:any) {
        setLoading(false)
        toast.error(err.error)
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
                <DrawerHeader className="flex flex-col gap-1"> {props.group ? "Update":"New"} Group</DrawerHeader>
                <DrawerBody> 
  
  
                    <Input {...register("groupname", {required: true})} label="Group Name" placeholder="Enter Group Name" type="text" variant="flat" isRequired />
                    
                    {/* <Autocomplete defaultItems={employeeList} placeholder="Add Staffs"
                      onSelectionChange={onServiceSelection} disabledKeys={employeesId?.map((item:any) => item._id)} >
                      {(item:any) => <AutocompleteItem key={item._id}>{item.firstname} {item.lastname} </AutocompleteItem>}
                    </Autocomplete>
                    <div className="flex gap-2 flex-wrap">
                      {employeesId?.map((item:any) => (
                        <ServiceCard {...item} onDelete={() => onServiceSelection(item._id)} />
                      ))}
                    </div> */}
                    
                    {!!employeeList?.length && <Controller name="employeesId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelectMultiple field={field} data={employeeList} label="Staffs" keyName="employeeName" />
                      )}
                    />}

                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.group ? "Update" : "Save"} 
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


export default AddEditGroup
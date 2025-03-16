import React from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardHeader, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem } from "@heroui/react";
import { DeleteIcon, SaveIcon } from "../utilities/svgIcons";
import { useForm } from "react-hook-form";
import { BRANCH_API_URL, EMPLOYEES_API_URL, GROUP_API_URL } from "../utilities/api-url";

const AddEditGroup = (props:any) => {
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
      defaultValues: {groupname: null, branchId: null, status: false}
    });
    const [error, setError] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [branchList, setBranchList] = React.useState([]);
    const [employeeList, setEmployeeList] = React.useState([]);
    const [employeesId, setEmployeesId] = React.useState<any>([])


    React.useEffect(() => {
        if(props.group) {
            reset(props.group)
            setEmployeesId(props.group.employee)
        }
        else reset({groupname:null, branchId: null, status: false})

        getBranchList();
        getEmployeeList();
    }, [props.group])

    const getBranchList = async () => {
      try {
          const branches = await fetch(BRANCH_API_URL)
          const parsed = await branches.json();
          setBranchList(parsed);
        }catch(err:any) { setError(err) }
    }
    
    const getEmployeeList = async () => {
      try {
          const employee = await fetch(EMPLOYEES_API_URL)
          const parsed = await employee.json();
          setEmployeeList(parsed);
        }catch(err:any) { setError(err) }
    }

    const onServiceSelection = (value: any) => {
      const item:any = employeeList.find((service:any) => service._id === value);
      if(!item) return;
      let array = employeesId;
      const exists = array.some((obj:any) => obj["_id"] === item["_id"]);
      setEmployeesId(exists ? array.filter((obj:any) => obj["_id"] !== item["_id"]) : [...array, item]);
    };

    const onSubmit = async (data:any) => {
      data.employeesId = employeesId.map((e:any) => e._id)
      console.log(data);
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
            setError(null)
            reset(); 
            props.onOpenChange();
            data?.branchId && assignGroupToBranch(data?.branchId, parsed?._id)
        }else setError(parsed.message)
      }catch(err:any) {
        setLoading(false)
        setError(err)
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
        }else setError(parsed.message)
      } catch (err:any) {
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
                <DrawerHeader className="flex flex-col gap-1"> {props.group ? "Update":"New"} Group</DrawerHeader>
                <DrawerBody> 
  
  
                    <Input {...register("groupname", {required: true})} label="Group Name" placeholder="Enter Group Name" type="text" variant="flat" />
                    
                    <Autocomplete defaultItems={employeeList} placeholder="Add Staffs"
                      onSelectionChange={onServiceSelection} disabledKeys={employeesId?.map((item:any) => item._id)} >
                      {(item:any) => <AutocompleteItem key={item._id}>{item.firstname} {item.lastname} </AutocompleteItem>}
                    </Autocomplete>
                    <div className="flex gap-2 flex-wrap">
                      {employeesId?.map((item:any) => (
                        <ServiceCard {...item} onDelete={() => onServiceSelection(item._id)} />
                      ))}
                    </div>

                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  
                    <div className="text-danger">
                      {errors.groupname && <div>Group name is required</div>}
                      {errors.branchId && <div>Branch is required</div>}
                    </div>
  
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



  
const ServiceCard = (props:any) => {

  return (
    <Card className="w-full flex-shrink-0 min-w-[250px]">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <Avatar isBordered radius="full" size="sm" src={props.image} />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{props.firstname} {props.lastname} </h4>
            <h5 className="text-small tracking-tight text-default-400"> <strong> {props.email}</strong> </h5>
          </div>
        </div>
        <div className="cursor-pointer" onClick={props.onDelete}>
            <DeleteIcon  width="15" color="darkred" />
        </div> 
      </CardHeader>
    </Card>
  );
}

export default AddEditGroup
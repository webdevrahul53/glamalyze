import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Radio, RadioGroup, Select, SelectItem } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { ASSETS_API_URL, BRANCH_API_URL } from "../utilities/api-url";
import AvatarSelect from "../common/avatar-select";

const AddEditAsset = (props:any) => {
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm();
    const [branchList, setBranchList] = React.useState([]);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(props.asset) {
            reset(props.asset)
        }
        else reset({branchId: null, assetType: null, assetNumber: null, status: false})
        getBranchList();
    }, [props.asset])

    
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
        let url = data._id ? `${ASSETS_API_URL}/${data._id}` : ASSETS_API_URL
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
  
    const saveAsset = async (data:any) => {
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
                        <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" />
                      )}
                    />

                    <Select {...register("assetType", {required: true})} label="Type">
                      <SelectItem key={"chair"}>Chair</SelectItem>
                      <SelectItem key={"sofa"}>Sofa</SelectItem>
                      <SelectItem key={"bed"}>Bed</SelectItem>
                      <SelectItem key={"bath"}>Bath</SelectItem>
                    </Select>

                    
                    <Input {...register("assetNumber", {required: true})} label="Asset Number" placeholder="Enter Asset Number" type="text" variant="flat" />
                    
                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  
                    <div className="text-danger">
                      {errors.branchId && <div>Branch is required</div>}
                      {errors.assetType && <div>Type is required</div>}
                      {errors.assetNumber && <div>Asset Number is required</div>}
                    </div>
  
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

export default AddEditAsset
import React, { lazy, Suspense } from "react";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Progress, Radio, RadioGroup, Select, SelectItem, useDisclosure } from "@heroui/react";
import { PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ASSET_TYPES_API_URL, ASSETS_API_URL, BRANCH_API_URL } from "../utilities/api-url";
import AvatarSelect from "../common/avatar-select";
import { useSelector } from "react-redux";
const AddEditAssetTypes = lazy(() => import("@/core/drawer/add-edit-asset-types"));

const AddEditAsset = (props:any) => {
    const user = useSelector((state:any) => state.user.value)
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleAssignOpen = () => { onOpen(); };

    const { register, handleSubmit, control, reset } = useForm();
    const [branchList, setBranchList] = React.useState<any>([]);
    const [assetTypeList, setAssetTypeList] = React.useState<any>([]);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(props.asset) {
            reset(props.asset)
        }
        else {
          const branchId = user?.defaultBranch || branchList[0]?._id;
          reset({branchId, assetTypeId: null, assetNumber: null, status: true})
        }
        getBranchList();
        getAssetTypeList();
    }, [props.asset])

    
    const getBranchList = async () => {
      try {
        const branches = await fetch(BRANCH_API_URL)
        const parsed = await branches.json();
        setBranchList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }
    
    const getAssetTypeList = async () => {
      try {
        const assetTypes = await fetch(ASSET_TYPES_API_URL)
        const parsed = await assetTypes.json();
        setAssetTypeList(parsed);
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

    const onDrawerClose = () => {
        props.onOpenChange();
        reset(); 
    }
  
    const onAssignDrawerClose = () => {
      // setPageRefresh((val) => !val)
      onOpenChange(); 
      getAssetTypeList();
      // setSelectedKeys([])
    }
  
  
    return (
      <Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.asset ? "Update":"New"} Asset</DrawerHeader>
                <DrawerBody> 
  
  
                    {isOpen && (
                      <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
                        <AddEditAssetTypes  isOpen={isOpen} placement={"lg"} onOpenChange={() => onAssignDrawerClose()}  />
                      </Suspense>
                    )}

                    <Controller name="branchId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" isRequired={true} />
                      )}
                    />
                    
                    <Controller name="assetTypeId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={assetTypeList} label="Asset Type" keyName="assetTypeName" isRequired={true}
                        endContent={<Button className="-mt-5" size="sm" onPress={() => handleAssignOpen()}><PlusIcon width={10} />ADD</Button>} />
                      )}
                    />

                    {/* <Select {...register("assetType", {required: true})} label="Type" isRequired
                      endContent={<Button className="-mt-5" size="sm" onPress={() => handleAssignOpen()}><PlusIcon width={10} />ADD</Button>}
                      >
                        {assetTypeList?.map((item:any) => <SelectItem key={item.assetTypeName}>{item.assetTypeName}</SelectItem>)}
                    </Select> */}

                    
                    <Input {...register("assetNumber", {required: true})} label="Asset Number" placeholder="Enter Asset Number" type="text" variant="flat" isRequired />
                    
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

export default AddEditAsset
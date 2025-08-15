import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Radio, RadioGroup, Select, SelectItem } from "@heroui/react";
import { EyeFilledIcon, EyeSlashFilledIcon, ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm, useWatch } from "react-hook-form";
import { v4 } from "uuid";
import AvatarSelectMultiple from "../common/avatar-select-multiple";
import { BRANCH_API_URL, EMPLOYEES_API_URL, ROLES_API_URL, SERVICES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
import { handlePhoneNumberChange } from "../utilities/handlePhoneNumber";
// import AvatarSelect from "../common/avatar-select";

const AddEditEmployee = (props:any) => {
    const { register, handleSubmit, setValue, control, reset } = useForm({
      defaultValues: {image: null, firstname: null, lastname: null, email: null, password: null, phonenumber: "", gender: "male", servicesId: [], defaultBranch: null, roleId: null,
        // aboutself: null, expert: null, facebook: null, instagram: null, twitter: null, dribble: null, 
        isVisibleInCalendar: null, status: null}
    });
    const [branchList, setBranchList] = React.useState<any>([]);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [serviceList, setServiceList] = React.useState([]);
    const [roleList, setRoleList] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState(false);

    const gender = useWatch({ control, name: "gender" });
    const phonenumber = useWatch({ control, name: "phonenumber" });

    const toggleVisibility = () => setIsVisible(!isVisible);

    React.useEffect(() => {
        if(props.employees) {
          console.log(props.employees)
            reset(props.employees)
            setImagePreview(props.employees.image)
        }
        else {
          reset({image: null, firstname: null, lastname: null, email: null, password: null, phonenumber: "", gender: "male", servicesId: [], defaultBranch: null, roleId: null,
            // aboutself: null, expert: null, facebook: null, instagram: null, twitter: null, dribble: null, 
            isVisibleInCalendar: null, status: null})
        }
        getRolesList();
        getServiceList();
        getBranchList();
    }, [props.employees])

    const onSubmit = async (data:any) => {
      data.servicesId = (typeof data.servicesId === "string") ? data.servicesId?.split(",") : data.servicesId;
      console.log(data);
      
      setLoading(true)
      let file = data?.image?.[0]
      if(!file || typeof data.image === "string") saveemployees(data)
      else {
        const imageRef = ref(imageDb, `spa-management-system/employees/${v4()}`)
        uploadBytes(imageRef, file).then(() => {
            getDownloadURL(imageRef).then( async (image) => {
            data.image = image;
            saveemployees(data)
            })
        })
      }
  
    }

    const getRolesList = async () => {
      try {
        const roles = await fetch(ROLES_API_URL)
        const parsed = await roles.json();
        console.log(parsed);
        
        setRoleList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }


    const getBranchList = async () => {
      try {
        const branches = await fetch(BRANCH_API_URL)
        const parsed = await branches.json();
        setBranchList(parsed);
        setValue("defaultBranch", props?.employees?.defaultBranch || parsed[0]._id)
      }catch(err:any) { toast.error(err.error) }
    }

    const getServiceList = async () => {
      try {
          const services = await fetch(SERVICES_API_URL)
          const parsed = await services.json();
          setServiceList(parsed);
        }catch(err:any) { toast.error(err) }
    }

    const saveemployees = async (data:any) => {
      try {
        console.log(data);  
        
        let url = data._id ? `${EMPLOYEES_API_URL}/${data._id}` : EMPLOYEES_API_URL
        const employees = await fetch(url, {
            method: data._id ? "PATCH" : "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsed = await employees.json();
        console.log(parsed);
        
        setLoading(false)
        if(parsed.status){
            reset(); 
            setImagePreview(null);
            props.onOpenChange();
        }else toast.error(parsed.message)
      }catch(err:any) {
        setLoading(false)
        toast.error(err)
      }
    }


    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImagePreview(URL.createObjectURL(file)); // Generate preview URL
      }
    };
  

    const onDrawerClose = () => {
        props.onOpenChange();
        reset(); 
        setImagePreview(null)
    }
  
  
    return (
      <Drawer isOpen={props.isOpen} size="3xl" placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.employees ? "Update":"New"} Staff</DrawerHeader>
                <DrawerBody> 

                  
                  <div style={{display: "grid", gridTemplateColumns: "3fr 3fr", rowGap: 10, gap: 10, alignItems:"start"}}>
                    <div className="flex flex-col gap-3">
                      <Input {...register("firstname", {required: true})} label="Full Name" placeholder="Enter Full Name" type="text" variant="flat" isRequired />
                      {/* <Input {...register("lastname", {required: true})} label="Last Name" placeholder="Enter Last Name" type="text" variant="flat" isRequired /> */}
                      
                      <Controller name="roleId" control={control} rules={{ required: true }}
                        render={({ field }) => (
                          <Select label="Role" selectedKeys={field.value ? [field.value] : []} // prefill
                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])} isRequired >
                            {roleList?.map((role: any) => (
                              <SelectItem key={role._id} textValue={role.rolesName}>
                                {role.rolesName}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />

                    </div>
                    <div>
                      <div className="flex items-end">
                        {imagePreview ? (
                          <label htmlFor="image" className="cursor-pointer"><img src={imagePreview} alt="Preview" width="120" height="100" /></label>
                        ) : (
                            <label htmlFor="image" className="cursor-pointer">
                              <ImageIcon width="120" height="100" />
                            </label>
                          )}
                        <div className="flex items-center gap-1 ms-2 mb-3">
                          <Button type="button" color="primary"><label htmlFor="image" className="cursor-pointer">Upload</label></Button>
                          <Button type="button" color="danger" variant="bordered" onPress={() => {setValue("image", null); setImagePreview(null)}}>Remove</Button>
                        </div>
                        <input id="image" {...register("image")} type="file" onChange={handleImageChange} style={{width:"0", height:"0"}} />

                      </div>
                      <div className="flex gap-3 my-2 mx-3">
                        <Checkbox {...register("isVisibleInCalendar")} color="primary"> Show In Calendar </Checkbox>
                        {/* <Checkbox {...register("isManager")} color="primary">Is Manager</Checkbox> */}
                      </div>

                    </div>
                  </div>
  


                  <RadioGroup {...register("gender", {required: true})} className="mb-3 mx-1" label="Gender" orientation="horizontal" defaultValue={props.employees?.gender || gender} isRequired>
                    <Radio {...register("gender", {required: true})} value="male"className="border-3 border-gray-400 rounded px-4 mx-0">Male</Radio>
                    <Radio {...register("gender", {required: true})} value="female"className="border-3 border-gray-400 rounded px-4 mx-0">Female</Radio>
                    <Radio {...register("gender", {required: true})} value="intersex" className="border-3 border-gray-400 rounded px-4 mx-0">Intersex</Radio>
                  </RadioGroup>
                  
                  <div style={{display: "grid", gridTemplateColumns: "2fr 2fr 2fr", rowGap: 10, gap: 10}}>
                    <Input {...register("phonenumber", {required: true})} label="Phone Number" placeholder="Enter Phone Number" type="tel" variant="flat"  isRequired value={phonenumber || "+"} onChange={e => handlePhoneNumberChange(e, setValue)} />
                    <Input {...register("email")} label="Email" placeholder="Enter Email" type="email" variant="flat" />
                    <div style={{pointerEvents: props?.employees ? "none":"all"}}>
                      <Input label="Password" placeholder="Enter Password" type={isVisible ? "text" : "password"} tabIndex={-1}
                        {...register("password")} variant="flat" disabled={props.employees} endContent={
                        <button tabIndex={-1} aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibility} >
                          {isVisible ? ( <EyeSlashFilledIcon className="text-2xl text-red-400 pointer-events-none" /> ) : ( <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none " /> )}
                        </button>
                      } />
                    </div>
                  </div>

                  {/* <div style={{display: "grid", gridTemplateColumns: "2fr 4fr", rowGap: 10, gap: 10}}>
                    {branchList?.length ? <Controller name="defaultBranch" control={control}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={branchList} label="Default Branch" keyName="branchname" />
                      )}
                    /> : <></>}
                  </div> */}

                  {serviceList?.length ? <Controller name="servicesId" control={control} 
                    render={({ field }) => (
                      <AvatarSelectMultiple field={field} data={serviceList} label="Services" keyName="name" />
                    )}
                  /> : <></>}
                  

                  {/* <div style={{display: "grid", gridTemplateColumns: "3fr 3fr", rowGap: 10, gap: 10}}>
                    <Input {...register("aboutself")} label="About Self" placeholder="Enter About Self" type="text" variant="flat" />
                    <Input {...register("expert")} label="Expert" placeholder="Enter Expert" type="text" variant="flat" />
                    <Input {...register("facebook")} label="Facebook" placeholder="Enter Facebook" type="text" variant="flat" />
                    <Input {...register("instagram")} label="Instagram" placeholder="Enter Instagram" type="text" variant="flat" />
                    <Input {...register("twitter")} label="Twitter" placeholder="Enter Twitter" type="text" variant="flat" />
                    <Input {...register("dribble")} label="Dribble" placeholder="Enter Dribble" type="text" variant="flat" />
                  </div> */}
                

                  <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.employees ? "Update" : "Save"} 
                  </Button>
                  <Button color="danger" type="button" variant="bordered" onPress={() => onDrawerClose()}> Close </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </form>
      </Drawer>
    )
  }

export default AddEditEmployee
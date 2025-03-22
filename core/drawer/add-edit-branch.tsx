import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, CheckboxGroup, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Radio, RadioGroup, Textarea } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { v4 } from "uuid";
import AvatarSelectMultiple from "../common/avatar-select-multiple";
import AvatarSelect from "../common/avatar-select";
import { BRANCH_API_URL, EMPLOYEES_API_URL, SERVICES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";


const AddEditBranch = (props:any) => {
    const { register, handleSubmit, setValue, setError, formState: { errors }, control, reset } = useForm();
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [serviceList, setServiceList] = React.useState([]);
    const [employeeList, setEmployeeList] = React.useState([]);

    React.useEffect(() => {
        if(props.branches) {
          console.log(props.branches)
            reset(props.branches)
            setImagePreview(props.branches.image)
            getServiceList()
            getEmployeeList()
        }
        else {
          reset({image: null, branchname:null, gender: null, managerId: null, servicesId: [], contactnumber: null, email: null, address: null,
            landmark: null, country: null, city: null, state: null, postalcode:null, latitude: null, longitude: null, paymentmethods: [], 
            description: null, status: false})
          getServiceList();
          getEmployeeList()
        }
    }, [props.branches])

    const onSubmit = async (data:any) => {
      data.servicesId = (typeof data.servicesId === "string") ? data.servicesId?.split(",") : data.servicesId;
      data.managerId = data.managerId || null
      console.log(data);
      
      setLoading(true)
      if(typeof data.image === "string") savebranches(data);
      else {
        if(!data.image?.length) {
          setError("image", {type:"required"})
          setLoading(false)
          return;
        }
        let file = data?.image[0]
        const imageRef = ref(imageDb, `spa-management-system/branches/${v4()}`)
        uploadBytes(imageRef, file).then(() => {
            getDownloadURL(imageRef).then( async (image) => {
            data.image = image;
            savebranches(data)
            })
        })
      } 
  
    }

    const getServiceList = async () => {
      try {
          const services = await fetch(SERVICES_API_URL)
          const parsed = await services.json();
          setServiceList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }

    const getEmployeeList = async () => {
      try {
          const employees = await fetch(EMPLOYEES_API_URL)
          const parsed = await employees.json();
          setEmployeeList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }
  
    const savebranches = async (data:any) => {
        try {
            let url = data._id ? `${BRANCH_API_URL}/${data._id}` : BRANCH_API_URL
            const branches = await fetch(url, {
                method: data._id ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsed = await branches.json();
            console.log(parsed);
            
            setLoading(false)
            if(parsed.status){
                reset(); 
                setImagePreview(null);
                props.onOpenChange();
            }else toast.error(parsed.message)
          }catch(err:any) {
            setLoading(false)
            toast.error(err.error)
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
      <Drawer isOpen={props.isOpen} size="5xl" placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.branches ? "Update":"New"} Branch</DrawerHeader>
                <DrawerBody> 

                  
                  <div style={{display: "grid", gridTemplateColumns: "3fr 3fr"}}>
                    <div>
                      <Input {...register("branchname", {required: true})} label="Branch Name" placeholder="Enter Branch Name" type="text" variant="flat" />
                      {errors.branchname && <div className="text-danger text-sm ms-3">Branch Name is required</div>}
                      
                      <RadioGroup {...register("gender", {required: true})} className="my-3 mx-1" label="Gender" orientation="horizontal" defaultValue={props.branches?.gender}>
                        <Radio {...register("gender", {required: true})} value="unisex" className="border-3 border-gray-400 rounded px-4 mx-0">Unisex</Radio>
                        <Radio {...register("gender", {required: true})} value="female"className="border-3 border-gray-400 rounded px-4 mx-0">Female</Radio>
                        <Radio {...register("gender", {required: true})} value="male"className="border-3 border-gray-400 rounded px-4 mx-0">Male</Radio>
                      </RadioGroup>
                      {errors.gender && <div className="text-danger text-sm ms-3">Gender is required</div>}

                    </div>
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
                      <input id="image" {...register("image", {required: props.branches ? false : true})} type="file" onChange={handleImageChange} style={{width:"0", height:"0"}} />
                      {errors.image && <div className="text-danger text-sm ms-3">Image is required</div>}

                    </div>
                  </div>

                  <div style={{display: "grid", gridTemplateColumns: "2fr 4fr", rowGap: 10, gap: 10}}>
                    <div>
                      <Controller name="managerId" control={control}
                        render={({ field }) => (
                          <AvatarSelect field={field} data={employeeList} label="Manager" keyName="firstname" />
                        )}
                      />
                    </div>
                    <div>
                      <Controller name="servicesId" control={control} rules={{required: true}}
                        render={({ field }) => (
                          <AvatarSelectMultiple field={field} data={serviceList} label="Services" keyName="name" />
                        )}
                      />
                      {errors.servicesId && <div className="text-danger text-sm ms-3">Service is required</div>}
                    </div>
                  </div>
                  

                  <div style={{display: "grid", gridTemplateColumns: "3fr 3fr", rowGap: 10, gap: 10}}>
                    <div>
                      <Input {...register("contactnumber", {required: true})} label="Contact Number" placeholder="Enter Contact Number" type="text" variant="flat" />
                      {errors.contactnumber && <div className="text-danger text-sm ms-3">Contact Number is required</div>}
                    </div>
                    <div>
                      <Input {...register("email", {required: true})} label="Email" placeholder="Enter Email" type="text" variant="flat" />
                      {errors.email && <div className="text-danger text-sm ms-3">Email is required</div>}
                    </div>
                    <div>
                      <Input {...register("address", {required: true})} label="Shop Number, Building Name, Area" placeholder="Enter Shop Number, Building Name, Area" type="text" variant="flat" />
                      {errors.address && <div className="text-danger text-sm ms-3">Address is required</div>}
                    </div>
                    <div>
                      <Input {...register("landmark", {required: false})} label="Landmark, near by" placeholder="Enter Landmark, near by" type="text" variant="flat" />
                      {errors.landmark && <div className="text-danger text-sm ms-3">Landmark is required</div>}
                    </div>
                  </div>

                  <div style={{display: "grid", gridTemplateColumns: "2fr 2fr 2fr 2fr", rowGap: 10, gap: 10}}>
                    <div>
                      <Input {...register("country", {required: true})} label="Country" placeholder="Enter Country" type="text" variant="flat" />
                      {errors.country && <div className="text-danger text-sm ms-3">Country is required</div>}
                    </div>
                    <div>
                      <Input {...register("state", {required: true})} label="State" placeholder="Enter State" type="text" variant="flat" />
                      {errors.state && <div className="text-danger text-sm ms-3">State is required</div>}
                    </div>
                    <div>
                      <Input {...register("city", {required: true})} label="City" placeholder="Enter City" type="text" variant="flat" />
                      {errors.city && <div className="text-danger text-sm ms-3">City is required</div>}
                    </div>
                    <div>
                      <Input {...register("postalcode", {required: true})} label="Postal Code" placeholder="Enter Postal Code" type="text" variant="flat" />
                      {errors.postalcode && <div className="text-danger text-sm ms-3">Postal Code is required</div>}
                    </div>
                    <div>
                      <Input {...register("latitude", {required: true})} label="Latitude" placeholder="Enter Latitude" type="text" variant="flat" />
                      {errors.latitude && <div className="text-danger text-sm ms-3">Latitude is required</div>}
                    </div>
                    <div>
                      <Input {...register("longitude", {required: true})} label="Logitude" placeholder="Enter Logitude" type="text" variant="flat" />
                      {errors.longitude && <div className="text-danger text-sm ms-3">Logitude is required</div>}
                    </div>
                    <div>
                      <Controller
                        name="paymentmethods"
                        control={control}
                        render={({ field }) => (
                          <CheckboxGroup
                            color="primary"
                            label="Supported Payment Method"
                            orientation="horizontal"
                            value={field.value} // Controlled value
                            onChange={field.onChange} // Update form value
                          >
                            <Checkbox value="cash">Cash</Checkbox>
                            <Checkbox value="upi">UPI</Checkbox>
                          </CheckboxGroup>
                        )} 
                      />
                      {errors.paymentmethod && <div className="text-danger text-sm ms-3">Payment Method is required</div>}
                    </div>
                  </div>

                  
                  <Textarea {...register("description")} label="Description" placeholder="Enter description" />

                  <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.branches ? "Update" : "Save"} 
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

  
export default AddEditBranch
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Radio, RadioGroup } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { useForm, useWatch } from "react-hook-form";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { CUSTOMERS_API_URL } from "../utilities/api-url";

const AddEditCustomer = (props:any) => {
    const { register, handleSubmit, setValue, control, reset } = useForm({
      defaultValues: {image: null, firstname: null, lastname: null, gender: "male", email: null, phonenumber: null, status: false}
    });
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false)

    const gender = useWatch({ control, name: "gender" });


    React.useEffect(() => {
        if(props.customer) {
            reset(props.customer)
            setImagePreview(props.customer.image)
        }
        else reset({image: null, firstname:null, lastname: null, email: null, phonenumber: null, gender: "male", status: false})
    }, [props.customer])

    const onSubmit = async (data:any) => {
      console.log(data);
      
      setLoading(true)
      let file = data?.image?.[0]
      if(!file || typeof data.image === "string") saveCustomer(data)
        else {
            const imageRef = ref(imageDb, `spa-management-system/customers/${v4()}`)
            uploadBytes(imageRef, file).then(() => {
                getDownloadURL(imageRef).then( async (image) => {
                data.image = image;
                saveCustomer(data)
                })
            })
        } 
  
    }
  
    const saveCustomer = async (data:any) => {
        try {
            let url = data._id ? `${CUSTOMERS_API_URL}/${data._id}` : CUSTOMERS_API_URL
            const customer = await fetch(url, {
                method: data._id ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsed = await customer.json();
            console.log(parsed);
            
            setLoading(false)
            if(parsed.status){
                reset(); 
                setImagePreview(null);
                props.onOpenChange();
            }else toast.error(parsed.message)
          }catch(err:any) {
            setLoading(false)
            toast.error(err.error.message)
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
      <Drawer isOpen={props.isOpen} placement={props.placement} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.customer ? "Update":"New"} Customer</DrawerHeader>
                <DrawerBody> 
  
                    <div className="text-danger text-sm ms-2 -mt-2">
                    </div>
                    
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
  
  
                    <Input id="image" {...register("image")} type="file" variant="flat" onChange={handleImageChange} />
                    <Input {...register("firstname", {required: true})} label="First Name" placeholder="Enter First Name" type="text" variant="flat" isRequired />
                    <Input {...register("lastname", {required: true})} label="Last Name" placeholder="Enter Last Name" type="text" variant="flat" isRequired />
                    <Input {...register("phonenumber", {required: true})} label="Phone Number" placeholder="Enter Phone Number" type="tel" variant="flat" isRequired />

                    <Input {...register("email")} label="Email" placeholder="Enter Email" type="email" variant="flat" />
                    <RadioGroup {...register("gender")} className="my-3 mx-1" label="Gender" orientation="horizontal" defaultValue={props.customer?.gender || gender}>
                      <Radio {...register("gender")} value="male">Male</Radio>
                      <Radio {...register("gender")} value="female">Female</Radio>
                      <Radio {...register("gender")} value="intersex">Intersex</Radio>
                    </RadioGroup>
                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
                    
                    
  
  
  
                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.customer ? "Update" : "Save"} 
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

export default AddEditCustomer
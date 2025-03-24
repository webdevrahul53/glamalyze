import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Radio, RadioGroup } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { CUSTOMERS_API_URL } from "../utilities/api-url";

const AddEditCustomer = (props:any) => {
    const { register, handleSubmit, reset } = useForm();
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(props.customer) {
            reset(props.customer)
            setImagePreview(props.customer.image)
        }
        else reset({image: null, firstname:null, lastname: null, email: null, phonenumber: null, gender:null, status: false})
    }, [props.customer])

    const onSubmit = async (data:any) => {
        console.log(data);
        
        let file = data.image[0]
        if(!file) return;
        setLoading(true)

        if(typeof data.image === "string") saveCustomer(data);
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
                      <img src={imagePreview} alt="Preview" width="120" height="100" />
                    ) : (
                      <label htmlFor="image" className="cursor-pointer">
                          <ImageIcon width="120" height="100" />
                        </label>
                      )}
  
  
                    <Input id="image" {...register("image", {required: props.customer ? false : true})} type="file" variant="flat" onChange={handleImageChange} isRequired />
                    <Input {...register("firstname", {required: true})} label="First Name" placeholder="Enter First Name" type="text" variant="flat" isRequired />
                    <Input {...register("lastname", {required: true})} label="Last Name" placeholder="Enter Last Name" type="text" variant="flat" isRequired />
                    <RadioGroup {...register("gender", {required: true})} className="my-3 mx-1" label="Gender" orientation="horizontal" defaultValue={props.customer?.gender} isRequired>
                      <Radio {...register("gender", {required: true})} value="male">Male</Radio>
                      <Radio {...register("gender", {required: true})} value="female">Female</Radio>
                      <Radio {...register("gender", {required: true})} value="intersex">Intersex</Radio>
                    </RadioGroup>
                    
                    <Input {...register("email", {required: true})} label="Email" placeholder="Enter Email" type="email" variant="flat" isRequired />
                    <Input {...register("phonenumber", {required: true})} label="Phone Number" placeholder="Enter Phone Number" type="tel" variant="flat" isRequired />
                    
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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { CATEGORIES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";

const AddEditCategory = (props:any) => {
    const { register, handleSubmit, reset } = useForm();
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(props.category) {
            reset(props.category)
            setImagePreview(props.category.image)
        }
        else reset({categoryname:"", status: false, image: null})
    }, [props.category])

    const onSubmit = async (data:any) => {
        let file = data.image[0]
        if(!file) return;
        setLoading(true)

        if(typeof data.image === "string") saveCategory(data);
        else {
            const imageRef = ref(imageDb, `spa-management-system/categories/${v4()}`)
            uploadBytes(imageRef, file).then(() => {
                getDownloadURL(imageRef).then( async (image) => {
                data.image = image;
                saveCategory(data)
                })
            })
        } 
  
    }
  
    const saveCategory = async (data:any) => {
        try {
            let url = data._id ? `${CATEGORIES_API_URL}/${data._id}` : CATEGORIES_API_URL
            const category = await fetch(url, {
                method: data._id ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsed = await category.json();
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
      <Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.category ? "Update":"New"} Category</DrawerHeader>
                <DrawerBody> 
  
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" width="120" height="100" />
                      ) : (
                        <label htmlFor="image" className="cursor-pointer">
                          <ImageIcon width="120" height="100" />
                        </label>
                      )}
  
  
                    <Input id="image" {...register("image", {required: props.category ? false : true})} type="file" variant="flat" onChange={handleImageChange} isRequired />
                    <Input {...register("categoryname", {required: true})} label="Category" placeholder="Enter Category Name" type="text" variant="flat" isRequired />
                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  
                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.category ? "Update" : "Save"} 
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

export default AddEditCategory
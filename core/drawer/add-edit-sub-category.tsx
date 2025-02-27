import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Avatar, Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem, Switch } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm } from "react-hook-form";
import { v4 } from "uuid";
import AvatarSelect from "../common/avatar-select";

export const AddEditSubCategory = (props:any) => {
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm();
    const [error, setError] = React.useState(null)
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [categoryList, setCategoryList] = React.useState([]);

    // React.useEffect(() => {props.isOpen && getCategoryList()}, [props.isOpen])

    React.useEffect(() => {
      getCategoryList()
      if(props.subcategory) {
        console.log(props.subcategory)
          reset(props.subcategory)
          setImagePreview(props.subcategory.image)
      }
      else reset({categoryId: null, subcategoryname:"", status: false, image: null})
    }, [props.subcategory])

    const onSubmit = async (data:any) => {
        console.log(data);
        
        let file = data.image[0]
        if(!file) return;
        setLoading(true)

        if(typeof data.image === "string") saveSubCategory(data);
        else {
            const imageRef = ref(imageDb, `spa-management-system/sub-categories/${v4()}`)
            uploadBytes(imageRef, file).then(() => {
                getDownloadURL(imageRef).then( async (image) => {
                data.image = image;
                saveSubCategory(data)
                })
            })
        } 
  
    }

    const getCategoryList = async () => {
      try {
          const category = await fetch("/api/categories")
          const parsed = await category.json();
          setCategoryList(parsed);
        }catch(err:any) { setError(err) }

    }
  
    const saveSubCategory = async (data:any) => {
        try {
            let url = data._id ? "/api/sub-categories/"+data._id : "/api/sub-categories"
            const subcategory = await fetch(url, {
                method: data._id ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsed = await subcategory.json();
            console.log(parsed);
            
            setLoading(false)
            if(parsed.status){
                setError(null)
                reset(); 
                setImagePreview(null);
                props.onOpenChange();
            }else setError(parsed.message)
          }catch(err:any) {
            setLoading(false)
            setError(err)
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
                <DrawerHeader className="flex flex-col gap-1"> {props.subcategory ? "Update":"New"} Sub Category</DrawerHeader>
                <DrawerBody> 
  
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" width="120" height="100" />
                      ) : (
                        <label htmlFor="image" className="cursor-pointer">
                          <ImageIcon width="120" height="100" />
                        </label>
                      )}
  
  
                    <Input id="image" {...register("image", {required: props.subcategory ? false : true})} type="file" variant="flat" onChange={handleImageChange} />
                    
                    
                    <Controller name="categoryId" control={control}
                      render={({ field }) => (
                        <AvatarSelect field={field} label="Category" data={categoryList} keyName="categoryname" />
                      )}
                    />


                    <Input {...register("subcategoryname", {required: true})} label="Sub Category" placeholder="Enter Sub Category Name" type="text" variant="flat" />
                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
                    <div className="text-danger">
                      {errors.image && <div>Image is required</div>}
                      {errors.subcategoryname && <div>Sub category name is required</div>}
                      {errors.categoryId && <div>Category is required</div>}
                    </div>
  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.subcategory ? "Update" : "Save"} 
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
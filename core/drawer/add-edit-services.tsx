import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { v4 } from "uuid";
import AvatarSelect from "../common/avatar-select";
import { CATEGORIES_API_URL, SERVICES_API_URL, SUBCATEGORIES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";

const AddEditServices = (props:any) => {
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm({
      defaultValues: { image: null, categoryId: null, subCategoryId: null, name: null, assetType: null, variants: [{serviceDuration: null, defaultPrice: null}], description:null, status: false }
    });
    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [categoryList, setCategoryList] = React.useState([]);
    const [subCategoryList, setSubCategoryList] = React.useState([]);

    React.useEffect(() => {
        if(props.services) {
          console.log(props.services)
            reset(props.services)
            setImagePreview(props.services.image)
            getCategoryList()
            getSubCategoryList(props.services.categoryId)
        }
        else {
          reset({categoryId: null, subCategoryId: null, name: null, assetType: null, status: false, image: null, variants: [{serviceDuration: null, defaultPrice: null}]})
          getCategoryList();
        }
    }, [props.services])

    const onSubmit = async (data:any) => {
      console.log(data);
      setLoading(true)
      if(typeof data.image === "string") saveServices(data);
      else {
          let file = data?.image[0]
          const imageRef = ref(imageDb, `spa-management-system/services/${v4()}`)
          uploadBytes(imageRef, file).then(() => {
              getDownloadURL(imageRef).then( async (image) => {
              data.image = image;
              saveServices(data)
              })
          })
      } 
  
    }

    const getCategoryList = async () => {
      try {
          const category = await fetch(CATEGORIES_API_URL)
          const parsed = await category.json();
          setCategoryList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }
    const getSubCategoryList = async (id:string) => {
      if(!id) return;
      try {
          const category = await fetch(`${SUBCATEGORIES_API_URL}?categoryId=${id}`)
          const parsed = await category.json();
          setSubCategoryList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }
  
    const saveServices = async (data:any) => {
        try {
            let url = data._id ? `${SERVICES_API_URL}/${data._id}` : SERVICES_API_URL
            const services = await fetch(url, {
                method: data._id ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsed = await services.json();
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
      <Drawer isOpen={props.isOpen} size="lg" placement={"right"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.services ? "Update":"New"} Service</DrawerHeader>
                <DrawerBody> 
  
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" width="120" height="100" />
                    ) : (
                        <label htmlFor="image" className="cursor-pointer">
                          <ImageIcon width="120" height="100" />
                        </label>
                      )}
  
  
                    <Input id="image" {...register("image", {required: props.services ? false : true})} type="file" variant="flat" onChange={handleImageChange} />
                    {errors.image && <div className="text-danger text-sm -mt-2 ms-3">Image is required</div>}

                    <Controller name="categoryId" control={control}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={categoryList} label="Category" keyName="categoryname" onChange={(id:string) => getSubCategoryList(id)}  />
                      )}
                      />
                    {errors.categoryId && <div className="text-danger text-sm -mt-2 ms-3">Category is required</div>}
                    
                    <Controller name="subCategoryId" control={control}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={subCategoryList} label="Sub Category" keyName="subcategoryname" />
                      )}
                    />
                    {errors.subCategoryId && <div className="text-danger text-sm -mt-2 ms-3">Sub category name is required</div>}
                    
                    <Input {...register("name", {required: true})} label="Name" placeholder="Enter Name" type="text" variant="flat" />
                    {errors.name && <div className="text-danger text-sm -mt-2 ms-3">Name is required</div>}

                    <Select {...register("assetType", {required: true})} label="Asset Type" placeholder="Select Asset Type">
                      <SelectItem key={"chair"}>Chair</SelectItem>
                      <SelectItem key={"bed"}>Bed</SelectItem>
                      <SelectItem key={"sofa"}>Sofa</SelectItem>
                      <SelectItem key={"bath"}>Bath</SelectItem>
                    </Select>


                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2" >
                        <Input {...register(`variants.${index}.serviceDuration`, {required: true})} label="Duration (Mins)" placeholder="Enter Duration" type="number" variant="flat" />
                        <Input {...register(`variants.${index}.defaultPrice`, {required: true})} label="Price (Rs)" placeholder="Enter Price" type="number" variant="flat" />
                        {fields.length > 1 && <button type="button" onClick={() => remove(index)}>❌</button>}
                      </div>
                    ))}
                    
                    <div className="text-center cursor-pointer my-2" onClick={() => append({ serviceDuration: null, defaultPrice: null })}>Add Variants ➕ </div>
                    
                    <Textarea {...register("description")} label="Description" placeholder="Enter description" />

                    <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
  

                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.services ? "Update" : "Save"} 
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

  export default AddEditServices
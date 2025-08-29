import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { imageDb } from "../utilities/firebaseConfig";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Textarea } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { v4 } from "uuid";
import AvatarSelect from "../common/avatar-select";
import { ASSET_TYPES_API_URL, CATEGORIES_API_URL, SERVICES_API_URL, SUBCATEGORIES_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
import AvatarSelectMultiple from "../common/avatar-select-multiple";

const AddEditServices = (props:any) => {
    const { register, handleSubmit, setValue, control, reset } = useForm({
      defaultValues: { image: null, categoryId: null, name: null, assetTypeId: null, variants: [{serviceDuration: null, defaultPrice: null, staffCommission: null}], description:null, status: false }
    });
    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [categoryList, setCategoryList] = React.useState([]);
    const [subCategoryList, setSubCategoryList] = React.useState([]);
    const [assetTypeList, setAssetTypeList] = React.useState<any>([]);

    React.useEffect(() => {
        if(props.services) {
          console.log(props.services)
            reset(props.services)
            setImagePreview(props.services.image)
            getCategoryList()
            getAssetTypeList();
            getSubCategoryList(props.services.categoryId)
        }
        else {
          reset({categoryId: null, name: null, assetTypeId: null, status: false, image: null, variants: [{serviceDuration: null, defaultPrice: null, staffCommission: null}]})
          getCategoryList();
          getAssetTypeList();
        }
    }, [props.services])

    const onSubmit = async (data:any) => {
      console.log(data);
      setLoading(true)
      let file = data?.image?.[0]
      if(!file || typeof data.image === "string") saveServices(data)
      else {
          let file = data?.image[0]
          const imageRef = ref(imageDb, `glamalyze/services/${v4()}`)
          uploadBytes(imageRef, file).then(() => {
              getDownloadURL(imageRef).then( async (image) => {
              data.image = image;
              saveServices(data)
              })
          })
      } 
  
    }

    const getAssetTypeList = async () => {
      try {
        const assetTypes = await fetch(ASSET_TYPES_API_URL)
        const parsed = await assetTypes.json();
        setAssetTypeList(parsed);
      }catch(err:any) { toast.error(err.error) }
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
                    <Controller name="categoryId" control={control}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={categoryList} label="Category" keyName="categoryname" onChange={(id:string) => getSubCategoryList(id)} isRequired />
                      )}
                    />
                    {/* <Controller name="subCategoryId" control={control}
                      render={({ field }) => (
                        <AvatarSelect field={field} data={subCategoryList} label="Sub Category" keyName="subcategoryname" isRequired />
                      )}
                    /> */}
                    
                    <Input {...register("name", {required: true})} label="Name" placeholder="Enter Name" type="text" variant="flat" isRequired />

                    
                    <Controller name="assetTypeId" control={control} rules={{required: true}}
                      render={({ field }) => (
                        <AvatarSelectMultiple field={field} data={assetTypeList} label="Asset Type" keyName="assetTypeName"
                        // endContent={<Button className="-mt-5" size="sm" onPress={() => handleAssignOpen()}><PlusIcon width={10} />ADD</Button>} 
                        />
                      )}
                    />

                    {/* <Select {...register("assetType", {required: true})} label="Asset Type" placeholder="Select Asset Type" isRequired>
                      <SelectItem key={"chair"}>Chair</SelectItem>
                      <SelectItem key={"bed"}>Bed</SelectItem>
                      <SelectItem key={"sofa"}>Sofa</SelectItem>
                      <SelectItem key={"bath"}>Bath</SelectItem>
                    </Select> */}


                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2" >
                        <Input {...register(`variants.${index}.serviceDuration`, {required: true})} label="Duration (Mins)" placeholder="Enter Duration" type="number" variant="flat" isRequired />
                        <Input {...register(`variants.${index}.defaultPrice`, {required: true})} label="Price (฿)" placeholder="Enter Price" type="number" variant="flat" isRequired />
                        <Input {...register(`variants.${index}.staffCommission`, {required: true})} label="Commission (฿)" placeholder="0.00" type="number" variant="flat" isRequired />
                        {fields.length > 1 && <button type="button" onClick={() => remove(index)}>❌</button>}
                      </div>
                    ))}
                    
                    <div className="text-center cursor-pointer my-2" onClick={() => append({ serviceDuration: null, defaultPrice: null, staffCommission: null })}>Add Variants ➕ </div>
                    
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
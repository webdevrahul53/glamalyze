import React from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input } from "@heroui/react";
import { ImageIcon, SaveIcon } from "../utilities/svgIcons";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ASSET_TYPES_API_URL } from "../utilities/api-url";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { imageDb } from "../utilities/firebaseConfig";
import { v4 } from "uuid";


const AddEditAssetTypes = (props:any) => {
    const { register, handleSubmit, setValue, reset } = useForm({
      defaultValues: {image: null, assetTypeName:null, status: true}
    });
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false)


    React.useEffect(() => {
        if(props.assetType) {
            reset(props.assetType)
            setImagePreview(props.assetType.image)
        }
        else reset({image: null, assetTypeName:null, status: true})
    }, [props.assetType])

    const onSubmit = async (data:any) => {
      console.log(data);
      
      setLoading(true)
      let file = data?.image?.[0]
      if(!file || typeof data.image === "string") saveAssetType(data)
        else {
            const imageRef = ref(imageDb, `spa-management-system/asset-types/${v4()}`)
            uploadBytes(imageRef, file).then(() => {
                getDownloadURL(imageRef).then( async (image) => {
                data.image = image;
                saveAssetType(data)
                })
            })
        } 
  
    }
  
    const saveAssetType = async (data:any) => {
        try {
            let url = data._id ? `${ASSET_TYPES_API_URL}/${data._id}` : ASSET_TYPES_API_URL
            const assetType = await fetch(url, {
                method: data._id ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsed = await assetType.json();
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
  


    const onModalClose = () => {
      props.onOpenChange();
      reset(); 
    }
  
  
    return (
      <Modal isOpen={props.isOpen} size={"lg"} onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1"> New Asset Type </ModalHeader>
                <ModalBody> 
  
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
                    <Input {...register("assetTypeName", {required: true})} label="Asset Type Name" placeholder="Enter Asset Type Name" type="text" variant="flat" isRequired />

  
                </ModalBody>
                <ModalFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.assignBranch ? "Update" : "Save"} 
                  </Button>
                  <Button color="danger" variant="bordered" onPress={() => onModalClose()}> Close </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </form>
      </Modal>
    )
  }

export default AddEditAssetTypes
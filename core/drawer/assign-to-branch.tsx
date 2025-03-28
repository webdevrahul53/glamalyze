import React from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, DatePicker } from "@heroui/react";
import { SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import {parseDate} from "@internationalized/date";
import { BRANCH_API_URL, GROUP_API_URL } from "../utilities/api-url";
import AvatarSelect from "../common/avatar-select";
import moment from "moment";


const AssignToBranch = (props:any) => {
    const { handleSubmit, control, reset } = useForm({
      defaultValues: {
        branchId: null,
        effectiveFrom: parseDate(moment().format("YYYY-MM-DD")), 
        effectiveTo: parseDate(moment().add(21, "days").format("YYYY-MM-DD")), 
      }

    });
    const [branchList, setBranchList] = React.useState([]);
    const [loading, setLoading] = React.useState(false)

    // Watch selected dates
    const effectiveFrom = useWatch({ control, name: "effectiveFrom" });
    const effectiveTo = useWatch({ control, name: "effectiveTo" });



    React.useEffect(() => {
      getBranchList();
    }, [])

    
    // Calculate days difference
    const totalDays = effectiveFrom && effectiveTo ? moment(effectiveTo).diff(moment(effectiveFrom), "days") : 0;

    const getBranchList = async () => {
      try {
        const branches = await fetch(BRANCH_API_URL)
        const parsed = await branches.json();
        setBranchList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }
   
    const onSubmit = async (data:any) => {
      setLoading(true)
      data.effectiveFrom = data.effectiveFrom?.toString();
      data.effectiveTo = data.effectiveTo?.toString();
      if(props?.selectedKeys?.length === 0) return;
      props?.selectedKeys?.map(async (groupId: string) => {
        try {
          const group = await fetch(`${GROUP_API_URL}/${groupId}`, {
              method: "PATCH",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" }
          })
          const parsed = await group.json();
          console.log(parsed);
          if(parsed.status){
            assignGroupToBranch(data?.branchId, groupId)
            setLoading(false)
          }else toast.error(parsed.message)
        }catch(err:any) {
          toast.error(err)
          setLoading(false)
        }
      })

    }

    const assignGroupToBranch = async (branchId:any, groupId:string) => {
      try {
        setLoading(true)
        const branch = await fetch(`${BRANCH_API_URL}/${branchId}?type=reset`, {
          method: "PUT",
          body: JSON.stringify({groupId}),
          headers: { "Content-Type": "application/json" }
        })
        const parsed = await branch.json();
        if(parsed.status){
          onModalClose();
          setLoading(false)
        }else console.log(parsed.message)
      } catch (err:any) {
        setLoading(false)
        console.log(err);
      }
    }


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
                <ModalHeader className="flex flex-col gap-1"> Assign To </ModalHeader>
                <ModalBody> 
  
                  <Controller name="branchId" control={control} rules={{required: true}}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={branchList} label="Branch" keyName="branchname" isRequired={true} />
                    )}
                  />

                  <div className="flex items-center gap-3">
                    {/* From Date */}
                    <Controller name="effectiveFrom" control={control}
                      render={({ field }) => (
                        <DatePicker label="From Date" {...field} defaultValue={field.value} 
                        onChange={(date: any) => field.onChange(date)} />
                      )}
                    />

                    {/* To Date */}
                    <Controller name="effectiveTo" control={control}
                      render={({ field }) => (
                        <DatePicker label="To Date" {...field} defaultValue={field.value} 
                        onChange={(date: any) => field.onChange(date)} />
                      )}
                    />
                  </div>

                  <p className="text-lg font-semibold mb-3">
                    {totalDays >= 0 ? totalDays : "Invalid dates selected"} Days
                  </p>

  
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

export default AssignToBranch
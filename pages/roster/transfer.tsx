/* eslint-disable @typescript-eslint/no-explicit-any */
import AvatarSelect from "@/core/common/avatar-select";
import { BRANCH_API_URL, TRANSFERRED_EMPLOYEES_API_URL } from "@/core/utilities/api-url";
import { TimeList } from "@/core/utilities/time-list";
import { Avatar, Button, Modal, ModalContent, Select, SelectItem } from "@heroui/react";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function TransferComponent(props:any) {


    const { control, register, handleSubmit } = useForm({
      defaultValues: {
        transfers: [
          { branchId: null, employeeId: null, openingAt: "", closingAt: "" }
        ]
      }
    });

    const { fields, append, remove } = useFieldArray({
      control,
      name: "transfers"
    });
  
    const [branchList, setBranchList] = React.useState<any>([]);
    
    React.useEffect(() => {
      getBranchList();
    }, [])
    


    const onSubmit = async (data: any) => {
        
        const errors = [];
        const transfers = data.transfers;
        
        for (let i = 0; i < transfers.length; i++) {
            const aStart = parseInt(transfers[i].openingAt);
            const aEnd = parseInt(transfers[i].closingAt);
        
            if (aStart >= aEnd) {
            errors.push(`In Transfer ${i + 1}, opening time must be less than closing time.`);
            }
        
            for (let j = i + 1; j < transfers.length; j++) {
            const bStart = parseInt(transfers[j].openingAt);
            const bEnd = parseInt(transfers[j].closingAt);
        
            // Overlap condition
            const isOverlapping = !(aEnd <= bStart || aStart >= bEnd);
        
            if (isOverlapping) {
                errors.push(`Transfer ${i + 1} overlaps with Transfer ${j + 1}`);
            }
            }
        }
        
        if (errors.length > 0) {
            toast.error(errors.join("\n")); // Replace with toast/snackbar as needed
            return;
        }
        
        data.dateFor = props.dateFor
        data.employeeId = props?.employee._id;
        console.log("Form Submitted", data)
        
        try {
            // setLoading(true)
            const branch = await fetch(`${TRANSFERRED_EMPLOYEES_API_URL}`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
            })
            const parsed = await branch.json();
            console.log(parsed);
            
            if(parsed.status !== 500) {
                toast.info(parsed.message)
                props.onOpenChange();
                // setLoading(false)
                // setPageRefresh(val => !val)
            }else{
                toast.error(parsed.message)
            }
        } catch (err:any) {
            // setLoading(false)
            console.log(err);
        }
    };
      
    
    const getBranchList = async () => {
      try {
        const branches = await fetch(BRANCH_API_URL)
        let parsed = await branches.json();
        parsed = parsed.filter((item:any) => item._id != props?.branchId)
        
        setBranchList(parsed);
      }catch(err:any) { toast.error(err.error) }
    }
  
    return (<Modal isOpen={props.isOpen} size="lg" onOpenChange={props.onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
            <ModalContent>
                {() => (
                <>
                    <div className="flex items-center gap-2 justify-end p-5 bg-white sticky top-0" style={{zIndex: 10}}>
                
                        <div className="flex items-center gap-2">
                            <Avatar size="sm" src={props?.employee?.image} style={{width: "25px", height: "25px"}} />
                            <div className="text-sm"> {props?.employee?.firstname} {props?.employee?.lastname} </div>
                        </div>
                        <Button
                        size="sm"
                        className="text-center ms-auto"
                        variant="bordered"
                        type="button"
                        onClick={() => append({ branchId: null, employeeId: props?.employee._id, openingAt: "", closingAt: "" })}
                        >
                        + Add more transfer
                        </Button>
    
                        <Button size="sm" className="text-center" variant="solid" type="submit">
                        Apply
                        </Button>
                    </div>
                    <form
                        className="px-4"
                        style={{ width: "100%", height: "70vh", overflow: "auto" }}
                        onSubmit={handleSubmit(onSubmit)}
                    >
        
                            
                        {fields.map((item, index) => (
                            <div key={item.id} className="my-6 border-b-3">
                            <Controller
                                name={`transfers.${index}.branchId`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                <AvatarSelect
                                    field={field}
                                    data={branchList}
                                    label="Branch"
                                    keyName="branchname"
                                    isRequired={true}
                                />
                                )}
                            />

                            <div className="flex items-center gap-2 mt-2">
                                <Select {...register(`transfers.${index}.openingAt`)} label="Opening" isRequired>
                                {TimeList?.map((item) => (
                                    <SelectItem key={item.key} textValue={item.key.toString()}>
                                    {item.value}
                                    </SelectItem>
                                ))}
                                </Select>
        
                                <Select {...register(`transfers.${index}.closingAt`)} label="Closing" isRequired>
                                {TimeList?.map((item) => (
                                    <SelectItem key={item.key} textValue={item.key.toString()}>
                                    {item.value}
                                    </SelectItem>
                                ))}
                                </Select>
                            </div>
        
                            {index > 0 && (
                                <Button
                                size="sm"
                                className="mt-2"
                                variant="light"
                                color="danger"
                                onClick={() => remove(index)}
                                >
                                X Remove
                                </Button>
                            )}
                            </div>
                        ))}
                    </form>
                    
                </>
                )}
            </ModalContent>
        </form>
    </Modal>
    );
  }
import React from "react";
import {
  Button, Checkbox, Drawer, DrawerBody, DrawerContent,
  DrawerFooter, DrawerHeader, Input
} from "@heroui/react";
import { CloseIcon, PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { COUPONS_API_URL, SERVICES_API_URL } from "../utilities/api-url";
import { useSelector } from "react-redux";
import AvatarSelect from "../common/avatar-select";

const AddEditVouchers = (props: any) => {
  const user = useSelector((state: any) => state.user.value);
  const { register, handleSubmit, control, reset, watch } = useForm({
    defaultValues: {
      voucherName: "",
      voucherBalance: 10,
      status: true,
      services: [{ serviceId: "", duration: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const [serviceList, setServiceList] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(false);
  const [defaultPrice, setDefaultPrice] = React.useState<number>(0);
  const [quantity, setQuantity] = React.useState<number>(0);


  React.useEffect(() => {
    if (props.voucher) {
      // Map serviceId and duration into services array
      const services = props.voucher.services?.map((s: any) => ({
        serviceId: s.serviceId,
        duration: s.duration,
      })) || [{ serviceId: "", duration: "" }];
      reset({ ...props.voucher, services });
    } else {
      reset({
        voucherName: "",
        voucherBalance: 10,
        status: true,
        services: [{ serviceId: "", duration: "" }],
      });
    }
    getServiceList();
  }, [props.voucher]);

  const getServiceList = async () => {
    try {
      const services = await fetch(SERVICES_API_URL);
      const parsed = await services.json();
      setServiceList(parsed);
    } catch (err: any) {
      toast.error(err.error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const url = data._id ? `${COUPONS_API_URL}/${data._id}` : COUPONS_API_URL;
      const res = await fetch(url, {
        method: data._id ? "PATCH" : "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      const parsed = await res.json();
      setLoading(false);

      if (parsed.status) {
        reset();
        props.onOpenChange();
      } else {
        toast.error(parsed.message);
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.error?.message || "Something went wrong.");
    }
  };

  const onDrawerClose = () => {
    props.onOpenChange();
    reset();
  };

  return (
    <Drawer isOpen={props.isOpen} size="xl" placement="right" onOpenChange={props.onOpenChange}>
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                {props.voucher ? "Update" : "New"} Voucher
              </DrawerHeader>

              <DrawerBody>

                <Input {...register("voucherName", { required: true })} label="Voucher Name" placeholder="Enter Voucher Name" type="text" variant="flat" isRequired />
                <Input {...register("voucherBalance", { required: true })} label="Voucher Balance" placeholder="Enter Voucher Balance" type="number" variant="flat" isRequired />


                {fields.map((field, index) => {
                  const serviceId = watch(`services.${index}.serviceId`);   
                  const selectedService = serviceList.find(
                    (item: any) => item._id === serviceId
                  );

                  return (
                    <div key={field.id} className="flex gap-3 items-center mb-2">
                      <div className="w-2/3 flex-1">
                        <Controller name={`services.${index}.serviceId`} control={control} rules={{ required: true }}
                          render={({ field }) => (
                            <AvatarSelect
                              field={field} data={serviceList} label="Services" keyName="name"
                            />
                          )}
                        />
                      </div>

                      <div className="w-1/3 border-2 rounded p-0">
                        
                        <Controller control={control} name={`services.${index}.duration`} 
                          render={({ field }) => {
                            const serviceId = control._formValues.services[index]?.serviceId;
                            const variants = serviceList.find((s:any) => s._id === serviceId)?.variants || [];

                            return (
                              <select {...field} className="w-full outline-none border-0 p-3" 
                                onChange={(e) => {
                                  const selectedVariant = variants.find((v:any) => v._id === e.target.value);
                                  if (index === 0 && selectedVariant) {
                                    setDefaultPrice(selectedVariant.defaultPrice);
                                  }
                                  field.onChange(e);
                                }}
                              >
                                <option value="">Select Duration</option>
                                {variants.map((v: any) => (
                                  <option key={v._id} value={v._id}>
                                    {v.serviceDuration}m (฿ {v.defaultPrice})
                                  </option>
                                ))}
                              </select>
                            );
                          }}
                        />
                      </div>

                      {(fields.length - 1) > index ? <div style={{cursor: "pointer"}} onClick={() => remove(index)}>
                        <CloseIcon width={20} color="darkred" />
                      </div>: <div style={{cursor: "pointer"}} onClick={() => append({ serviceId: "", duration: "" })}>
                        <PlusIcon width={20} />  
                      </div>}
                    </div>
                  );
                })}



                <Checkbox {...register("status")} color="primary">
                  Active
                </Checkbox>
              </DrawerBody>

              <DrawerFooter style={{ display: "flex", flexDirection: "column", justifyContent: "start" }}>
                <div className="flex justify-between items-center gap-2 my-2">
                  <div className="w-1/4 text-3xl border-3 rounded p-2 px-4">{defaultPrice}</div>
                  <div className="text-3xl">X</div>
                  <div className="w-1/4 text-3xl border-3 rounded p-2 px-4">
                    <input type="text" style={{width: "100%"}} value={quantity} onChange={(event:any) => setQuantity(event.target.value)} />
                  </div>
                  <div className="text-3xl">=</div>
                  <div className="w-1/4 text-3xl border-3 rounded p-2 px-4">{defaultPrice * quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button color="primary" type="submit" disabled={loading}>
                    <SaveIcon width="15" color="white" />
                    {loading ? "Loading..." : props.voucher ? "Update" : "Save"}
                  </Button>
                  <Button color="danger" variant="bordered" onPress={onDrawerClose}>
                    Close
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </form>
    </Drawer>
  );
};

export default AddEditVouchers;

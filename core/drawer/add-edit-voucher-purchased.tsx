import React, { lazy, Suspense } from "react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Progress, useDisclosure } from "@heroui/react";
import { PlusIcon, SaveIcon } from "../utilities/svgIcons";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CUSTOMERS_API_URL, VOUCHER_PURCHASED_API_URL, VOUCHERS_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
import ServiceCard from "../common/servicd-card";
import AvatarSelect from "../common/avatar-select";
const AddEditCustomer = lazy(() => import("@/core/drawer/add-edit-customer"));


const AddEditVoucherPurchased = (props:any) => {
  
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleOpen = () => { onOpen(); };

    const { register, handleSubmit, reset, control, setValue } = useForm({
      defaultValues: {voucherId: null, customerId: null, voucherBalance: null, remainingVoucher: null, paymentMethod: "Cash", status: true}
    });
    const [loading, setLoading] = React.useState(false)
    const [customerList, setCustomerList] = React.useState([]);
    const [voucherList, setVoucherList] = React.useState([]);

    const voucherId = useWatch({ control, name: "voucherId" });
    const customerId = useWatch({ control, name: "customerId" });
    const paymentMethod = useWatch({ control, name: "paymentMethod" });


    React.useEffect(() => {
        if(props.voucherPurchased) {
            reset(props.voucherPurchased)
        }
        else reset({voucherId: null, customerId: null, voucherBalance: null, remainingVoucher: null, paymentMethod: "Cash", status: true})

        getCustomerList();
        getVoucherList();
    }, [props.voucherPurchased])

    const getCustomerList = async () => {
      try {
          const customer = await fetch(CUSTOMERS_API_URL)
          const parsed = await customer.json();
          setCustomerList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }
    
    const getVoucherList = async () => {
      try {
          const voucher = await fetch(VOUCHERS_API_URL)
          const parsed = await voucher.json();
          setVoucherList(parsed);
        }catch(err:any) { toast.error(err.error) }
    }


    const onSubmit = async (data:any) => {
      console.log(data);
      try {
        let url = data._id ? `${VOUCHER_PURCHASED_API_URL}/${data._id}` : VOUCHER_PURCHASED_API_URL
        const voucherPurchased = await fetch(url, {
            method: data._id ? "PATCH" : "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsed = await voucherPurchased.json();
        console.log(parsed);
        
        setLoading(false)
        if(parsed.status){
            reset(); 
            props.onOpenChange();
        }else toast.error(parsed.message)
      }catch(err:any) {
        setLoading(false)
        toast.error(err.error)
      }
  
    }


    
    const onDrawerClose = () => {
        props.onOpenChange();
        reset(); 
    }
  
  
    return (
      <Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        {isOpen && (
        <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
          <AddEditCustomer isOpen={isOpen} placement={"left"} onOpenChange={() => {onOpenChange(); getCustomerList()} }  />
        </Suspense>
        )}
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1"> {props.voucherPurchased ? "Update":"New"} Voucher Purchased</DrawerHeader>
                <DrawerBody>

                  {voucherId ? (() => {
                    const voucher: any = voucherList.find((voucher: any) => voucher._id === voucherId);
                    setValue("voucherBalance", voucher?.voucherBalance);
                    setValue("remainingVoucher", voucher?.voucherBalance);
                    if (voucher) {
                      return <ServiceCard 
                      name={voucher?.voucherName} 
                      email={`Voucher Balance: ${voucher?.voucherBalance} - Pay For: ${voucher?.quantity}`} 
                      onDelete={() => setValue("voucherId", null)} />;
                    }
                    return null;
                  })() : <Controller name={`voucherId`} control={control} rules={{ required: true }}
                    render={({ field }) => (
                      <AvatarSelect field={field} data={voucherList} label="Voucher" keyName="voucherName"
                      />
                    )}
                  />}

                  

                  {customerId ? <ServiceCard {...customerList?.find((e:any) => e._id === customerId) || {}} onDelete={() => setValue("customerId", null)}  /> : 
                    <Autocomplete {...register("customerId", {required: true})} defaultItems={customerList} label="Customer" 
                    labelPlacement="inside" placeholder="Select a customer" variant="bordered"
                    onSelectionChange={(item:any)=> setValue("customerId",item)}
                    endContent={<Button size="sm" onPress={() => handleOpen()}><PlusIcon width={10} />ADD</Button>}>
                    {(user:any) => (
                      <AutocompleteItem key={user._id} textValue={user.name}>
                        <div className="flex gap-2 items-center">
                          <Avatar alt={user.name} className="flex-shrink-0" size="sm" src={user.image} />
                          <div className="flex flex-col">
                            <span className="text-small">{user.name}</span>
                            <span className="text-tiny text-default-400">{user.email}</span>
                          </div>
                        </div>
                      </AutocompleteItem>
                    )}
                    
                  </Autocomplete>}
                  
                  <section className="flex items-center gap-0">
                    <small role="button" className={`w-1/3 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2 ${paymentMethod === "Cash" && "bg-gray-500 text-white"}`} onClick={() => setValue("paymentMethod", "Cash")}>CASH</small>
                    <small role="button" className={`w-1/3 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2 ${paymentMethod === "Card" && "bg-gray-500 text-white"}`} onClick={() => setValue("paymentMethod", "Card")}>CARD</small>
                    <small role="button" className={`w-1/3 text-center border-1 border-gray-500 flex items-center justify-center h-full p-2 ${paymentMethod === "Transfer" && "bg-gray-500 text-white"}`} onClick={() => setValue("paymentMethod", "Transfer")}>TRANSFER</small>
                  </section>
                  
                      
                  <Checkbox {...register("status")} color="primary"> Active </Checkbox>
  
                </DrawerBody>
                <DrawerFooter style={{justifyContent: "start"}}>
                  <Button color="primary" type="submit" className={`${loading ? "bg-light text-dark":""}`} disabled={loading}> 
                    <SaveIcon width="15" color="white" />  
                    {loading ? "Loading...": props.voucherPurchased ? "Update" : "Save"} 
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


export default AddEditVoucherPurchased
import React from "react";
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@heroui/react";
import { VOUCHER_PURCHASED_API_URL } from "../utilities/api-url";
import { toast } from "react-toastify";
import { GiftIcon, GiftUnboxedIcon } from "../utilities/svgIcons";


const ApplyVoucher = (props:any) => {
  const [paxData, setPaxData] = React.useState<any[]>([]);
  const [serviceList, setServiceList] = React.useState<any[]>([]);
  const [voucherList, setVoucherList] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    let data = props.pax;
    console.log(data)
    setPaxData(data)
  }, [props.pax])

  React.useEffect(() => {
    props.voucherList && setVoucherList(props.voucherList)
  }, [props.voucherList]);


  React.useEffect(() => {
    props.serviceList && setServiceList(props.serviceList)
  }, [props.serviceList]);


    

  const onDrawerClose = () => {
      props.onOpenChange();
  }


  return (
    <Drawer isOpen={props.isOpen} placement={props.placement} onOpenChange={props.onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1"> Vouchers </DrawerHeader>
            <DrawerBody> 


              <div className="flex flex-col gap-4">
                {paxData.map((item:any, paxIndex: number) => {
                  return (<>
                    {item.map((pax:any, serviceIndex:number) => {
                      const service = serviceList.find((s: any) => s._id === pax.serviceId);
                      const voucher = voucherList.find(item => item.services.includes(pax.serviceId));
                      console.log(pax.voucherUsed);
                      
                      return voucher ? (
                        <div
                          key={serviceIndex}
                          className={`flex items-center justify-between gap-4 px-4 py-3 border border-gray-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md bg-white transition`}
                        >
                          <div className="flex flex-col gap-1 pl-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="font-medium text-gray-800">
                                {voucher.voucherName}
                              </span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                Balance: {voucher.voucherBalance}
                              </span>
                            </div>
    
                            <div className="text-sm font-semibold text-blue-600">
                              {service?.name || "Unknown Service"}
                            </div>
                          </div>
    
                          <button
                            onClick={() => props.applyVoucher(paxIndex, serviceIndex, voucher)}
                            disabled={pax.voucherUsed}
                            className={`text-xs font-semibold px-3 py-1 
                              ${!pax.voucherUsed ? "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white": "border border-gray-600 text-gray-600"} 
                              rounded transition flex items-center gap-2`}
                          >
                            {pax.voucherUsed ? <GiftUnboxedIcon width={15} height={15} color="gray" /> : <></>}
                            {pax.voucherUsed ? "Applied" : "Redeem"}
                          </button>
                        </div>
                      ) : (<></>);
                    })}
                  
                  </>)
                })}
              </div>



                



            </DrawerBody>
            <DrawerFooter style={{justifyContent: "start"}}>
              
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default ApplyVoucher
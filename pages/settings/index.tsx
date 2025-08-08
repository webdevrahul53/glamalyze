/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import { SETTINGS_API_URL } from "@/core/utilities/api-url";
import { Button, Input, Progress } from "@heroui/react";
import moment from "moment";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function Settings() {

  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getSettings()
  }, [])

  const getSettings = async () => {
    try {
      const settings = await fetch(`${SETTINGS_API_URL}?settingType=global`)
      const parsed = await settings.json();
      reset(parsed[0])
    }catch(err:any) { toast.error(err.error) }
  }

  
  const onSubmit = async (data:any) => {
    data.settingType = "global"
    try {
      const asset = await fetch(SETTINGS_API_URL, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" }
      })
      const parsed = await asset.json();
      console.log(parsed);
      
      setLoading(false)
      
    }catch(err:any) {
      setLoading(false)
      console.log(err);
      
      // toast.error(err.error.message)
    } 

  }
  

  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      
      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      
      <section className="p-2 my-5">
        <div className="text-3xl font-bold">Global Settings</div>
        {/* <p className="text-gray-500"> {moment().format("DD dddd MMM yyyy")} </p> */}
      </section>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className="grid grid-cols-4 gap-3">
          <Input {...register("transferCommission", {required: true})} label="Transfer Commission" placeholder="Enter Transfer Commission" 
          type="text" variant="faded" isRequired />

          
          <Input {...register("personalBookingCommission", {required: true})} label="Personal Booking Commission" placeholder="Enter Personal Booking Commission" 
          type="text" variant="faded" isRequired />

          
          <Input {...register("seniorPremiumCommission", {required: true})} label="Senior Premium" placeholder="Enter Senior Premium" 
          type="text" variant="faded" isRequired />

        </div>

        <Button type="submit" className="mt-4" color="primary" variant="solid">Save</Button>


      </form>


    </div>
  );
}

import { Avatar, Select, SelectItem } from '@heroui/react'
import React from 'react'

type propsType = {field:any, data:any, label:string, keyName: string, onChange?: any, disabledKeys?: any[], showStatus?: boolean}

export default function AvatarSelect({field, data = [], label, keyName, onChange, disabledKeys = [], showStatus = false}: propsType) {
    
  return (
    <Select
        {...field}
        items={data}
        label={label}
        placeholder={"Select " + label}
        disabledKeys={disabledKeys?.map((item: any) => item.employeeId)}
        selectedKeys={field.value ? [field.value] : []}
        onSelectionChange={(keys) => {field.onChange([...keys][0]); onChange && onChange([...keys][0])}}
        renderValue={(items:any) =>
        items?.map((item:any) => (
            <div key={item.key} className="flex items-center gap-2">
            <Avatar alt={item.data[keyName]} className="flex-shrink-0" size="sm" src={item.data.image} style={{width: 22, height: 22}} />
            <div className="flex flex-col">
                <span>{item.data[keyName]}</span>
                {/* {item.data.email && <span className="text-default-500 text-tiny">{item.data.email}</span>} */}
            </div>
            </div>
        ))
        }
    >
        {(user:any) => {

            const employee = disabledKeys?.find((item:any) => item.employeeId == user._id);
            console.log(employee)
            return <SelectItem key={user._id} textValue={user[keyName]}>
                <div className="flex gap-2 items-center">
                    <Avatar alt={user[keyName]} className="flex-shrink-0" size="sm" src={user.image} />
                    <div className="flex flex-col">
                        <span className="text-small">{user[keyName]}</span>
                    </div>
                    {showStatus && <>
                        {employee ? <span style={{fontSize: "10px"}} className={`bg-red-800 ms-auto text-white px-2 rounded`}>Busy till {employee.nextAvailableTime} </span> :
                        <span style={{fontSize: "10px"}} className={`bg-green-800 ms-auto text-white px-2 rounded`}>Available</span>}
                    </>}
                    
                </div>
            </SelectItem>
        }}
    </Select>
  )
}

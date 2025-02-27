import { Avatar, Select, SelectItem } from '@heroui/react'
import React from 'react'

type propsType = {field:any, data:any, label:string, keyName: string, onChange?: any}

export default function AvatarSelect({field, data = [], label, keyName, onChange}: propsType) {
  return (
    <Select
        {...field}
        items={data}
        label={field.value ? "":label}
        placeholder={"Select " + label}
        selectedKeys={field.value ? [field.value] : []}
        onSelectionChange={(keys) => {field.onChange([...keys][0]); onChange && onChange([...keys][0])}}
        renderValue={(items:any) =>
        items?.map((item:any) => (
            <div key={item.key} className="flex items-center gap-2">
            <Avatar alt={item.data[keyName]} className="flex-shrink-0" size="sm" src={item.data.image} />
            <div className="flex flex-col">
                <span>{item.data[keyName]}</span>
                {/* <span className="text-default-500 text-tiny">({item.data.createdAt})</span> */}
            </div>
            </div>
        ))
        }
    >
        {(user:any) => (
        <SelectItem key={user._id} textValue={user[keyName]}>
            <div className="flex gap-2 items-center">
            <Avatar alt={user[keyName]} className="flex-shrink-0" size="sm" src={user.image} />
            <div className="flex flex-col">
                <span className="text-small">{user[keyName]}</span>
                {/* <span className="text-tiny text-default-400">{user.createdAt}</span> */}
            </div>
            </div>
        </SelectItem>
        )}
    </Select>
  )
}

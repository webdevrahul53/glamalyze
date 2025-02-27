import { Avatar, Chip, Select, SelectItem } from '@heroui/react'
import React from 'react'

type propsType = {field:any, data:any, label:string, keyName: string}

export default function AvatarSelectMultiple({field, data = [], label, keyName}: propsType) {
  return (
    <Select
        isMultiline={true}
        items={data}
        aria-label={label} // Add this for accessibility
        label={field.value?.length ? "":label}
        placeholder={"Select " + label}
        selectionMode="multiple"
        variant="bordered"
        selectedKeys={new Set(field.value || [])} // ✅ Set default selected values for editing
        onSelectionChange={(keys) => field.onChange(Array.from(keys))} // ✅ Convert Set to Array
        renderValue={(items) => (
            <div className="flex flex-wrap gap-3">
                {items?.map((item:any) => (
                    <div key={item.key} className="flex items-center gap-1">
                    <Avatar alt={item.data[keyName]} className="flex-shrink-0" size="sm" src={item.data.image} style={{width: "25px", height: "25px"}} />
                    <div className="flex flex-col">
                        <span>{item.data[keyName]}</span>
                        {/* <span className="text-default-500 text-tiny">({item.data.createdAt})</span> */}
                    </div>
                    </div>
                ))}
            </div>
        )}
        >
        {(user:any) => (
            <SelectItem key={String(user._id)} textValue={user.name}>
            <div className="flex gap-2 items-center">
                <Avatar alt={user.name} className="flex-shrink-0" size="sm" src={user.image} />
                <div className="flex flex-col">
                <span className="text-small">{user.name}</span>
                <span className="text-tiny text-default-400">{user.email}</span>
                </div>
            </div>
            </SelectItem>
        )}
    </Select>
  )
}

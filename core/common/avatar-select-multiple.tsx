import { Avatar, Select, SelectItem, Checkbox } from '@heroui/react';
import React from 'react';

type PropsType = { field: any; data: any[]; label: string; keyName: string; };

export default function AvatarSelectMultiple({field, data = [], label, keyName}: PropsType) {
  const allKeys = data.map((item) => String(item._id));

  const handleSelectionChange = (keys: any) => {
    const keysArr = Array.from(keys);

    // Handle "Select All"
    if (keysArr.includes('select-all')) {
      if (field.value?.length === allKeys.length) {
        field.onChange([]); // Deselect all
      } else {
        field.onChange(allKeys); // Select all
      }
    } else {
      field.onChange(keysArr);
    }
  };

  return (
    <Select
      isMultiline
      aria-label={label}
      label={field.value?.length ? '' : label}
      placeholder={`Select ${label}`}
      selectionMode="multiple"
      variant="bordered"
      selectedKeys={new Set(field.value || [])}
      onSelectionChange={handleSelectionChange}
      renderValue={(items) => (
        <div className="flex flex-wrap gap-1 my-2">
          {items
            ?.filter((item: any) => item.key !== 'select-all') // ✅ skip select-all
            .map((item: any) => {
                item = JSON.parse(item.textValue)
                return <div
                    key={item?._id}
                    className="flex items-center gap-1 p-1"
                >
                    <Avatar
                    alt={item?.name || ""}
                    className="flex-shrink-0"
                    size="sm"
                    src={item?.image}
                    style={{ width: '25px', height: '25px' }}
                    />
                    <span>{item?.[keyName]}</span>
                </div>
            })}
        </div>
      )}
      
    >
    <>
        {/* Select All Item */}
        <SelectItem key="select-all" textValue="Select All">
        <div className="flex items-center gap-2">
            <Checkbox isSelected={field.value?.length === allKeys.length} />
            <strong>SELECT ALL</strong>
        </div>
        </SelectItem>

        {/* Regular Items */}
        {data.map((user: any) => (
        <SelectItem key={String(user._id)} textValue={JSON.stringify(user)}>
            <div className="flex gap-2 items-center">
            <Checkbox isSelected={field.value?.includes(String(user._id))} />
            <Avatar
                alt={user[keyName]}
                className="flex-shrink-0"
                size="sm"
                src={user.image}
            />
            <div className="flex flex-col">
                <span className="text-small">{user[keyName]}</span>
                <span className="text-tiny text-default-400">{user.email}</span>
            </div>
            </div>
        </SelectItem>
        ))}
    </>
    </Select>
  );
}

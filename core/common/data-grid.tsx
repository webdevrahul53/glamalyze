/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Tooltip,
  Chip,
} from "@heroui/react";
import { DeleteIcon, EditIcon } from "../utilities/svgIcons";
import { AvatarType } from "../utilities/table-types";

export const columns = [
  {name: "NAME", uid: "name"},
  {name: "ROLE", uid: "role"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

export const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Senior Developer",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Community Manager",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
];


const statusColorMap:any = {
  Active: "success",
  Inactive: "warning",
  paused: "danger",
  vacation: "warning",
};


export default function DataGrid(props:any) {
  
  const renderCell = React.useCallback((user: any, columnKey: any) => {
    const cellValue = user[columnKey];
    
    if(AvatarType.includes(columnKey)){
      return (
        <User
          avatarProps={{radius: "lg", src: user.image || user.avatar}}
          description={user.email}
          name={cellValue}
        >
          {cellValue} - hello
        </User>
      );
    }else if(columnKey === "role"){
      return (
        <div className="flex flex-col">
          <p className="text-bold text-sm capitalize">{cellValue}</p>
          <p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
        </div>
      );
    }else if(columnKey === "status"){
      return (
        <Chip className="capitalize" color={statusColorMap[user.status ? "Active": "Inactive"]} size="sm" variant="flat">
          {cellValue ? "Active": "Inactive"}
        </Chip>
      );
    }else if(columnKey === "actions"){
      return (
        <div className="relative flex items-center justify-center gap-2">
          {/* <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <EyeIcon width={30} height={20} />
            </span>
          </Tooltip> */}
          <Tooltip content="Edit user">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => props.onEdit(user)}>
              <EditIcon width={30} height={20} color={"darkblue"} />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete user">
            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => props.onDelete(user._id)}>
              <DeleteIcon width={30} height={20} color={"darkred"} />
            </span>
          </Tooltip>
        </div>
      );

    }else {
      return cellValue;
    }
  }, []);

  return (
    <Table isStriped selectionMode="multiple" aria-label="Example table with custom cells">
      <TableHeader columns={props.columns || columns}>
        {(column:any) => (
          <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={props.data || users}>
        {(item:any) => (
          <TableRow key={item._id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


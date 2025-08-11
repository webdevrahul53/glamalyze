/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Tooltip, Chip, Button, AvatarGroup, Avatar, 
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Progress} from "@heroui/react";
import { BathIcon, BedIcon, ChairIcon, DeleteIcon, EditIcon, SofaIcon } from "../utilities/svgIcons";
import { ArrayType, AvatarGroupType, AvatarType, AvatarType2, BoxButtonType, DateOnlyType, DateType, RoleType } from "../utilities/table-types";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { setPerPage } from "../redux/datagridSlice/datagridSlice";

const statusColorMap:any = {
  Active: "success",
  Inactive: "warning",
  paused: "danger",
  vacation: "warning",
};

const roleCSS: any = {
  Manager: "bg-blue-100 text-blue-500",
  Staff: "bg-red-100 text-red-800",
  Therapist: "bg-pink-100 text-pink-800",
}

export const taskStatusCSS: any = {
  Pending: "bg-gray-200 text-gray-800 border-gray-500",
  CheckedIn: "bg-teal-200 text-teal-800 border-teal-500",
  CheckedOut: "bg-purple-200 text-purple-800 border-purple-500",
  Completed: "bg-green-200 text-green-800 border-green-500",
  Cancelled: "bg-red-200 text-red-800 border-red-500",
}

const assetIcons: any = {
  chair: <ChairIcon width={25} height={25} />,
  sofa: <SofaIcon width={40} height={25} />,
  bed: <BedIcon width={25} height={25} />,
  bath: <BathIcon width={25} height={25} />,
}


const formatDateTime = (date:string) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().replace("T", " ").substring(0, 19); 
};


export default function DataGrid(props:any) {
  const dispatch = useDispatch();
  const perPage = useSelector((state:any) => state.datagrid.perPage) || "10"; // Default to 10 if not set in Redux store
  const [page, setPage] = React.useState(1);
  const [users, setUsers] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);


  // Fetch data from API based on the page
  React.useEffect(() => {
    fetchUsers();
  }, [page, props.search, props.pageRefresh]);

  const fetchUsers = async (rowsPerPage: string = perPage) => {
    dispatch(setPerPage(rowsPerPage)); // Update Redux store with selected rows per page
    setLoading(true);
    try {
      const response = await fetch(
        `${props.api}?page=${page}&limit=${rowsPerPage}&search=${props.search}`
      );
      const data = await response.json();

      setUsers(data?.data); // Assuming API returns { users: [], totalPages: N }
      setTotalPages(Math.ceil(data?.totalPages));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const deleteUser = async (id:string) => {
    const confirm = window.confirm("Are you sure to delete ?")
    if(!confirm) return;
    try {
      await fetch(`${props.api}/${id}`, {method: "DELETE"});
      fetchUsers()
    } catch (error) {
      console.log(error);
      
    }
  }

  
  const renderCell = React.useCallback((user: any, columnKey: any) => {
    let cellValue = user[columnKey];
    
    if(AvatarType.includes(columnKey)){
      return (
        <User
          avatarProps={{radius: "lg", src: user.image || user.avatar}}
          description={user.email}
          name={cellValue}
        >
          {cellValue}
        </User>
      );
    }else if(AvatarType2.includes(columnKey)){
      const keys = columnKey.split(":")
      cellValue = user?.[keys[0]]?.[keys[1]]
      return cellValue == null ? <></> : (
        <User
          avatarProps={{radius: "lg", src: user[keys[0]].image || user[keys[0]].avatar}}
          description={user[keys[0]].email || user[keys[0]].createdAt}
          name={cellValue}
        >
          {cellValue}
        </User>
      );
    }else if(AvatarGroupType.includes(columnKey)){
      return <AvatarGroup isBordered max={3}>
        {cellValue?.map((item:any) => (
          <Avatar key={item._id} src={item.image} size="sm" />
        ))}
      </AvatarGroup>
    }else if(ArrayType.includes(columnKey)){
      const value = columnKey.split(":");
      console.log()
      return <div className="flex items-center">
        {user[value[0]].map((item:any, index: number, arr:any) => (<span key={index}> {(index === arr.length || index === 0) ? "":","} {item[value[1]]} </span>))}
      </div>
    }else if(columnKey === "assetType"){
      return <div className="flex items-center justify-center">
        {assetIcons[cellValue]}
      </div>
    }else if(columnKey === "taskStatus"){
      return <Dropdown >
        <DropdownTrigger>
          <div className={`${taskStatusCSS[cellValue]} p-1 rounded text-center cursor-pointer`}>{cellValue}</div>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" 
          selectionMode="single"  // Ensure single selection
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]; // Extract the selected value
            props?.updateStatus(user.appointmentId, {taskStatus: selectedKey})
          }}>
          <DropdownItem key="Pending">Pending</DropdownItem>
          <DropdownItem key="CheckedIn">Check In</DropdownItem>
          <DropdownItem key="CheckedOut">Check Out</DropdownItem>
          <DropdownItem key="Completed">Completed</DropdownItem>
          <DropdownItem key="Cancelled" className="text-danger" color="danger">
            Cancelled
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    }else if(columnKey === "paymentStatus"){
      return <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="bordered">{cellValue}</Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem key="Pending">Pending</DropdownItem>
          <DropdownItem key="Cash">Cash</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    }else if(DateType.includes(columnKey)){
      const formattedDateTime = formatDateTime(cellValue);
      return formattedDateTime
    }else if(DateOnlyType.includes(columnKey)){
      const formattedDate = moment(cellValue).toDate().toDateString();
      return formattedDate
    }else if(RoleType.includes(columnKey)){
      return <span className={`p-1 px-2 rounded ${roleCSS[cellValue]}`}>{cellValue}</span>
    }else if(BoxButtonType.includes(columnKey)){
      return <span className="p-1 px-2 bg-primary text-white rounded">{cellValue}</span>
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
          {props.onEdit != undefined && <Tooltip content="Edit user">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => props.onEdit(user)}>
              <EditIcon width={30} height={20} color={"darkblue"} />
            </span>
          </Tooltip>}
          <Tooltip color="danger" content="Delete user">
            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => deleteUser(user._id)}>
              <DeleteIcon width={30} height={20} color={"darkred"} />
            </span>
          </Tooltip>
          
        </div>
      );

    }else if(columnKey === "gender") {
      const capitalized = cellValue.charAt(0).toUpperCase() + cellValue.slice(1);
      return capitalized;
    }else {
      return cellValue;
    }
  }, []);

  return (
    <>
      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
      <section>
        <div style={{maxHeight: "calc(100vh - 250px)", overflow: "auto"}}>
          <Table isStriped selectionMode="multiple" aria-label="Example table with custom cells" style={{borderRadius: 0}}
            onSelectionChange={(keys) => props?.onKeysSelection && props?.onKeysSelection(keys === "all" ? users.map((item:any) => item._id) : keys) }>
            <TableHeader columns={props.columns}>
              {(column:any) => (
                <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={users}>
              {(item:any) => (
                <TableRow key={item._id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex w-full justify-center gap-3 py-3">
          <div className="border-2 px-2">
            <select className="py-2 pe-4 outline-none" value={perPage} onChange={(event:any) => fetchUsers(event.target.value)}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <Pagination isCompact showControls showShadow color="secondary" page={page} total={totalPages}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      </section>
    </>
  );
}


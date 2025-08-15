/* eslint-disable @typescript-eslint/no-explicit-any */
const AddEditEmployee = lazy(() => import("@/core/drawer/add-edit-employee"));
const Roles = lazy(() => import("@/pages/staffs/roles"));
import React, { lazy, Suspense } from 'react'
import DataGrid from "@/core/common/data-grid";
import { PageTitle } from '@/core/common/page-title';
import { Button, Progress, useDisclosure } from '@heroui/react';
import { PlusIcon } from '@/core/utilities/svgIcons';

import SearchComponent from '@/core/common/search';
import { EMPLOYEES_API_URL } from '@/core/utilities/api-url';



export default function Staffs() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };

  
  const {isOpen: isOpenRoles, onOpen: onOpenRoles, onOpenChange: onOpenRolesChange} = useDisclosure();
  const handleOpenRoles = () => { onOpenRoles(); };

  const [selectedEmployees, setSelectedEmployees] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedEmployees(null)
  }

  
  const onRolesDrawerClose = () => {
    onOpenRolesChange();
  }

  return (
    <section className="">
        <PageTitle title="Staffs" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            {/* <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button> */}
            <div className="flex items-center ms-auto gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" variant="bordered" color="primary" onPress={() => handleOpenRoles()}> Roles</Button>
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AddEditEmployee employees={selectedEmployees} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          {isOpenRoles && (
            <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
              <Roles isOpen={isOpenRoles} placement={"left"} onOpenChange={() => onRolesDrawerClose()}  />
            </Suspense>
            )}

          <DataGrid columns={columns} api={EMPLOYEES_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedEmployees(item); handleOpen()}} />
          
        </div>
    </section>
  )
}

const columns = [
  {name: "EMPLOYEE NAME", uid: "employeeName"},
  {name: "GENDER", uid: "gender"},
  {name: "TOTAL SERVICES", uid: "totalServices"},
  {name: "Role", uid: "role"},
  {name: "PHONE NUMBER", uid: "phonenumber"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];
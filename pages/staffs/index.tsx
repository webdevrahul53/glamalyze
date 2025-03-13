/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import DataGrid from "@/core/common/data-grid";
import { PageTitle } from '@/core/common/page-title';
import { Button, useDisclosure } from '@heroui/react';
import { DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons';
import { AddEditEmployee } from '@/core/drawer/add-edit-employee';
import SearchComponent from '@/core/common/search';
import { EMPLOYEES_API_URL } from '@/core/utilities/api-url';



export default function Staffs() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedEmployees, setSelectedEmployees] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedEmployees(null)
  }

  return (
    <section className="">
        <PageTitle title="Staffs" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditEmployee employees={selectedEmployees} 
          isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          <DataGrid columns={columns} api={EMPLOYEES_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedEmployees(item); handleOpen()}} />
          
        </div>
    </section>
  )
}

const columns = [
  {name: "EMPLOYEE NAME", uid: "employeeName"},
  {name: "TOTAL SERVICES", uid: "totalServices"},
  {name: "Role", uid: "role"},
  {name: "PHONE NUMBER", uid: "phonenumber"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];
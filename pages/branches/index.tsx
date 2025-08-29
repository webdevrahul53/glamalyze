/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { lazy, Suspense } from 'react'
import DataGrid from "@/core/common/data-grid";
import { PageTitle } from '@/core/common/page-title';
import { Button, Progress, useDisclosure } from '@heroui/react';
import { PlusIcon } from '@/core/utilities/svgIcons';
import SearchComponent from '@/core/common/search';
import { BRANCH_API_URL } from '@/core/utilities/api-url';
const AddEditBranch = lazy(() => import("@/core/drawer/add-edit-branch"));




export default function Branches() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedBranches, setSelectedBranches] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedBranches(null)
  }

  return (
    <section className="">
        <PageTitle title="Branches" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            {/* <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button> */}
            <div className="flex items-center ms-auto gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AddEditBranch branches={selectedBranches} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          <DataGrid columns={columns} api={BRANCH_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedBranches(item); handleOpen()}}  />
          
        </div>
    </section>
  )
}

const columns = [
  {name: "BRANCH   NAME", uid: "branchname"},
  {name: "CONTACT NUMBER", uid: "contactnumber"},
  {name: "MANAGER", uid: "manager:firstname"},
  {name: "CITY", uid: "city"},
  // {name: "STAFFS", uid: "groupEmployees"},
  {name: "POSTAL CODE", uid: "postalcode"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

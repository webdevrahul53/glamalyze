/* eslint-disable @typescript-eslint/no-explicit-any */
const AddEditServices = lazy(() => import("@/core/drawer/add-edit-services"));
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search';
import { SERVICES_API_URL } from '@/core/utilities/api-url';
import { DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons';
import { Button, Progress, useDisclosure } from '@heroui/react';
import React, { lazy, Suspense } from 'react'

export default function Services() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedServices, setSelectedServices] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedServices(null)
  }

  return (
    <section className="">
        <PageTitle title="Services" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AddEditServices services={selectedServices} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          <DataGrid columns={columns} api={SERVICES_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedServices(item); handleOpen()}} />
          
        </div>
    </section>
  )
}



const columns = [
  {name: "NAME", uid: "name"},
  {name: "DURATION (Mins)", uid: "variants:serviceDuration"},
  {name: "PRICE (Rs)", uid: "variants:defaultPrice"},
  {name: "CATEGORY", uid: "categoryName"},
  {name: "TYPE", uid: "assetType"},
  // {name: "CREATED AT", uid: "createdAt"},
  // {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

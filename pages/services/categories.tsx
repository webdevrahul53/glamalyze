/* eslint-disable @typescript-eslint/no-explicit-any */
const AddEditCategory = lazy(() => import("@/core/drawer/add-edit-category"));
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search'
import { CATEGORIES_API_URL } from '@/core/utilities/api-url'
import { PlusIcon } from '@/core/utilities/svgIcons'
import { Button, Progress, useDisclosure } from '@heroui/react'
import React, { lazy, Suspense } from 'react'

export default function Categories() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedCategory(null)
  }

  return (
    <section className="">
        <PageTitle title="Categories" />

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
            <AddEditCategory category={selectedCategory} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}


          <DataGrid columns={columns} api={CATEGORIES_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedCategory(item); handleOpen()}} />
          
        </div>
    </section>
  )
}




const columns = [
  {name: "NAME", uid: "categoryname"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

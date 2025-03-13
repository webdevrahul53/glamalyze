/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search';
import { AddEditSubCategory } from '@/core/drawer/add-edit-sub-category';
import { SUBCATEGORIES_API_URL } from '@/core/utilities/api-url';
import { DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons';
import { Button, useDisclosure } from '@heroui/react';
import React from 'react'

export const columns = [
  {name: "NAME", uid: "subcategoryname"},
  {name: "CATEGORY", uid: "categoryName"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

export default function SubCategories() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedSubCategory(null)
  }

  return (
    <section className="">
        <PageTitle title="Sub Categories" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditSubCategory subcategory={selectedSubCategory} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          <DataGrid columns={columns} api={SUBCATEGORIES_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedSubCategory(item); handleOpen()}} />
          
        </div>
    </section>
  )
}

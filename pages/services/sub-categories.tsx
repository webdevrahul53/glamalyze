/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import { AddEditSubCategory } from '@/core/drawer/add-edit-sub-category';
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons';
import { Button, Input, Progress, useDisclosure } from '@heroui/react';
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
  const [subCategories, setSubCategories] = React.useState([])
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getSubCategories();
  }, [])


  const getSubCategories = async () => {
    try {
      setLoading(true)
      const category = await fetch("/api/sub-categories");
      const parsed = await category.json();
      setSubCategories(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }

  const deleteSubCategory = async (id:string) => {
    try {
      await fetch(`/api/sub-categories/${id}`, {method: "DELETE"});
      getSubCategories()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getSubCategories();
    setSelectedSubCategory(null)
  }

  return (
    <section className="">
        <PageTitle title="Sub Categories" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditSubCategory subcategory={selectedSubCategory} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {sub-categories.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={subCategories} 
          onEdit={(item:any)=> {setSelectedSubCategory(item); handleOpen()}} 
          onDelete={(id:string) => deleteSubCategory(id)} />
          
        </div>
    </section>
  )
}

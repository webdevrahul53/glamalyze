/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import { AddEditCategory } from '@/core/drawer/add-edit-category'
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons'
import { Button, Input, Progress, useDisclosure } from '@heroui/react'
import React from 'react'

export const columns = [
  {name: "NAME", uid: "categoryname"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

export default function Categories() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [categories, setCategories] = React.useState([])
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)


  React.useEffect(() => {
    getCategories();
  }, [])


  const getCategories = async () => {
    try {
      setLoading(true)
      const category = await fetch("/api/categories");
      const parsed = await category.json();
      setCategories(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
      
    }
  }

  const deleteCategory = async (id:string) => {
    try {
      await fetch(`/api/categories/${id}`, {method: "DELETE"});
      getCategories()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getCategories();
    setSelectedCategory(null)
  }

  return (
    <section className="">
        <PageTitle title="Categories" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditCategory category={selectedCategory} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {categories.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={categories} 
          onEdit={(item:any)=> {setSelectedCategory(item); handleOpen()}} 
          onDelete={(id:string) => deleteCategory(id)} />
          
        </div>
    </section>
  )
}

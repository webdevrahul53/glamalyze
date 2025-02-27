import React from 'react'
import DataGrid from "@/core/common/data-grid";
import { PageTitle } from '@/core/common/page-title';
import { Button, Input, Progress, useDisclosure } from '@heroui/react';
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons';
import { AddEditBranch } from '@/core/drawer/add-edit-branch';

export const columns = [
  {name: "Branch NAME", uid: "branchname"},
  {name: "CONTACT NUMBER", uid: "contactnumber"},
  {name: "MANAGER", uid: "managerName"},
  {name: "CITY", uid: "city"},
  {name: "ASSIGN STAFF", uid: "employeesCount"},
  {name: "POSTAL CODE", uid: "postalcode"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];


export default function Branches() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [branches, setBranches] = React.useState([])
  const [selectedBranches, setSelectedBranches] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getBranches();
  }, [])


  const getBranches = async () => {
    try {
      setLoading(true)
      const branches = await fetch("/api/branches");
      const parsed = await branches.json();
      setBranches(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }

  const deleteBranch = async (id:string) => {
    try {
      await fetch(`/api/branches/${id}`, {method: "DELETE"});
      getBranches()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getBranches();
    setSelectedBranches(null)
  }

  return (
    <section className="">
        <PageTitle title="Branches" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditBranch branches={selectedBranches} 
          isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {branches.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={branches} 
          onEdit={(item:any)=> {setSelectedBranches(item); handleOpen()}} 
          onDelete={(id:string) => deleteBranch(id)} />
          
        </div>
    </section>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import { AddEditGroup } from '@/core/drawer/add-edit-groups'
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons'
import { Button, Input, Progress, useDisclosure } from '@heroui/react'
import React from 'react'

export const columns = [
  {name: "NAME", uid: "groupname"},
  {name: "Branch", uid: "branch:branchname"},
  {name: "Staffs", uid: "employee"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

export default function Groups() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [groups, setGroups] = React.useState([])
  const [selectedGroup, setSelectedGroup] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)


  React.useEffect(() => {
    getGroups();
  }, [])


  const getGroups = async () => {
    try {
      setLoading(true)
      const group = await fetch("/api/groups");
      const parsed = await group.json();
      setGroups(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
      
    }
  }

  const deleteGroup = async (id:string) => {
    try {
      await fetch(`/api/groups/${id}`, {method: "DELETE"});
      getGroups()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getGroups();
    setSelectedGroup(null)
  }

  return (
    <section className="">
        <PageTitle title="Groups" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditGroup group={selectedGroup} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {groups.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={groups} 
          onEdit={(item:any)=> {setSelectedGroup(item); handleOpen()}} 
          onDelete={(id:string) => deleteGroup(id)} />
          
        </div>
    </section>
  )
}

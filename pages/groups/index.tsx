/* eslint-disable @typescript-eslint/no-explicit-any */
const AddEditGroup = lazy(() => import("@/core/drawer/add-edit-groups"));
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search'

import { BRANCH_API_URL, GROUP_API_URL } from '@/core/utilities/api-url'
import { DashboardIcon, DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Progress, useDisclosure } from '@heroui/react'
import React, { lazy, Suspense } from 'react'
import { toast } from 'react-toastify';


export default function Groups() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedGroup, setSelectedGroup] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [branchList, setBranchList] = React.useState([]);

  
  React.useEffect(() => {
    getBranchList();
  }, [])

  const getBranchList = async () => {
    try {
        const branches = await fetch(BRANCH_API_URL)
        const parsed = await branches.json();
        setBranchList(parsed);
      }catch(err:any) { console.log(err) }
  }

  const updateGroup = async (branchId: any, groupId: string) => {
    try {
      const group = await fetch(`${GROUP_API_URL}/${groupId}`, {
          method: "PATCH",
          body: JSON.stringify({branchId}),
          headers: { "Content-Type": "application/json" }
      })
      const parsed = await group.json();
      console.log(parsed);
      if(parsed.status){
        assignGroupToBranch(branchId, groupId)
      }else toast.error(parsed.message)
    }catch(err:any) {
      toast.error(err)
    }

  }

  const assignGroupToBranch = async (branchId:any, groupId:string) => {
    try {
      // setLoading(true)
      const branch = await fetch(`${BRANCH_API_URL}/${branchId}?type=reset`, {
        method: "PUT",
        body: JSON.stringify({groupId}),
        headers: { "Content-Type": "application/json" }
      })
      const parsed = await branch.json();
      if(parsed.status){
        // setLoading(false)
      }else console.log(parsed.message)
    } catch (err:any) {
      // setLoading(false)
      console.log(err);
    }
  }

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedGroup(null)
  }

  return (
    <section className="">
        <PageTitle title="Groups" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button size="md" color="secondary" variant="bordered" isDisabled={selectedKeys.length === 0}> 
                    <DashboardIcon color="primary" width="25" height="25" /> Asign To
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions" selectionMode="single"
                  onSelectionChange={(keys) => {
                    const branchId = Array.from(keys)[0]; // Extract the selected value
                    selectedKeys.forEach((id: string) => (updateGroup(branchId, id)))
                    setPageRefresh((val) => !val)
                  }}>
                  {branchList?.map((item:any) => (<DropdownItem key={item._id}>{item.branchname}</DropdownItem>))}
                </DropdownMenu>
              </Dropdown>
              
            </div>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AddEditGroup group={selectedGroup} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          <DataGrid columns={columns} api={GROUP_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedGroup(item); handleOpen()}} onKeysSelection={(keys: any) => setSelectedKeys(Array.from(keys))} />
          
        </div>
    </section>
  )
}



const columns = [
  {name: "NAME", uid: "groupname"},
  {name: "Branch", uid: "branch:branchname"},
  {name: "Staffs", uid: "employee"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];
/* eslint-disable @typescript-eslint/no-explicit-any */
const AddEditGroup = lazy(() => import("@/core/drawer/add-edit-groups"));
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search'
import AssignToBranch from '@/core/drawer/assign-to-branch';

import { GROUP_API_URL } from '@/core/utilities/api-url'
import { DashboardIcon, DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons'
import { Button, Progress, useDisclosure } from '@heroui/react'
import React, { lazy, Suspense } from 'react'


export default function Groups() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const {isOpen: isAssignOpen, onOpen: onAssignOpen, onOpenChange: onAssignOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const handleAssignOpen = () => { onAssignOpen(); };
  const [selectedGroup, setSelectedGroup] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  // const [branchList, setBranchList] = React.useState([]);

  
  // React.useEffect(() => {
  //   getBranchList();
  // }, [])

  // const getBranchList = async () => {
  //   try {
  //       const branches = await fetch(BRANCH_API_URL)
  //       const parsed = await branches.json();
  //       setBranchList(parsed);
  //     }catch(err:any) { console.log(err) }
  // }


  
  const onAssignDrawerClose = () => {
    setPageRefresh((val) => !val)
    onAssignOpenChange(); 
    // setSelectedKeys([])
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
              <Button size="md" color="secondary" variant="bordered" isDisabled={selectedKeys.length === 0} onPress={() => handleAssignOpen()}> 
                <DashboardIcon color="primary" width="25" height="25" /> Asign To
              </Button>
              
            </div>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          {isAssignOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AssignToBranch selectedKeys={selectedKeys} isOpen={isAssignOpen} placement={"lg"} onOpenChange={() => onAssignDrawerClose()}  />
          </Suspense>
          )}


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
  {name: "FROM", uid: "effectiveFrom"},
  {name: "TO", uid: "effectiveTo"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];
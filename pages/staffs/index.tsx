import React from 'react'
import DataGrid from "@/core/common/data-grid";
import { PageTitle } from '@/core/common/page-title';
import { Button, Input, Progress, useDisclosure } from '@heroui/react';
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons';
import { AddEditEmployee } from '@/core/drawer/add-edit-employee';

export const columns = [
  {name: "EMPLOYEE NAME", uid: "employeeName"},
  {name: "TOTAL SERVICES", uid: "totalServices"},
  {name: "Branch", uid: "branchName"},
  {name: "Role", uid: "role"},
  {name: "PHONE NUMBER", uid: "phonenumber"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];


export default function Staffs() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [employees, setEmployees] = React.useState([])
  const [selectedEmployees, setSelectedEmployees] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getEmployees();
  }, [])


  const getEmployees = async () => {
    try {
      setLoading(true)
      const employees = await fetch("/api/employees");
      const parsed = await employees.json();
      setEmployees(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }

  const deleteEmployee = async (id:string) => {
    try {
      await fetch(`/api/employees/${id}`, {method: "DELETE"});
      getEmployees()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getEmployees();
    setSelectedEmployees(null)
  }

  return (
    <section className="">
        <PageTitle title="Staffs" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditEmployee employees={selectedEmployees} 
          isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {employees.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={employees} 
          onEdit={(item:any)=> {setSelectedEmployees(item); handleOpen()}} 
          onDelete={(id:string) => deleteEmployee(id)} />
          
        </div>
    </section>
  )
}

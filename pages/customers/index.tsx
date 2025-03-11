/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import { AddEditCustomer } from '@/core/drawer/add-edit-customer'
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons'
import { Button, Input, Progress, useDisclosure } from '@heroui/react'
import React from 'react'

export const columns = [
  {name: "NAME", uid: "name"},
  {name: "GENDER", uid: "gender"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

export default function Customers() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [customers, setCustomers] = React.useState([])
  const [selectedCustomer, setSelectedCustomer] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)


  React.useEffect(() => {
    getCustomers();
  }, [])


  const getCustomers = async () => {
    try {
      setLoading(true)
      const customer = await fetch("/api/customers");
      const parsed = await customer.json();
      setCustomers(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
      
    }
  }

  const deleteCustomer = async (id:string) => {
    try {
      await fetch(`/api/customers/${id}`, {method: "DELETE"});
      getCustomers()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getCustomers();
    setSelectedCustomer(null)
  }

  return (
    <section className="">
        <PageTitle title="Customers" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditCustomer customer={selectedCustomer} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {customers.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={customers} 
          onEdit={(item:any)=> {setSelectedCustomer(item); handleOpen()}} 
          onDelete={(id:string) => deleteCustomer(id)} />
          
        </div>
    </section>
  )
}

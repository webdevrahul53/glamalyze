/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import { AddEditServices } from '@/core/drawer/add-edit-services';
import { DownloadIcon, PlusIcon, SearchIcon } from '@/core/utilities/svgIcons';
import { Button, Input, Progress, useDisclosure } from '@heroui/react';
import React from 'react'

export const columns = [
  {name: "NAME", uid: "name"},
  {name: "DURATION (Mins)", uid: "serviceDuration"},
  {name: "PRICE (Rs)", uid: "defaultPrice"},
  {name: "CATEGORY", uid: "categoryName"},
  {name: "CREATED AT", uid: "createdAt"},
  {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

export default function Services() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [services, setServices] = React.useState([])
  const [selectedServices, setSelectedServices] = React.useState(null)
  const [isLoading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getServices();
  }, [])


  const getServices = async () => {
    try {
      setLoading(true)
      const services = await fetch("/api/services");
      const parsed = await services.json();
      setServices(parsed)
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }

  const deleteService = async (id:string) => {
    try {
      await fetch(`/api/services/${id}`, {method: "DELETE"});
      getServices()
    } catch (error) {
      console.log(error);
      
    }
  }

  const onDrawerClose = () => {
    onOpenChange(); 
    getServices();
    setSelectedServices(null)
  }

  return (
    <section className="">
        <PageTitle title="Services" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Search ..." type="email" startContent={ <SearchIcon width="20" /> } />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          <AddEditServices services={selectedServices} 
          isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />

          {/* {services.length && } */}
          {isLoading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}
          <DataGrid columns={columns} data={services} 
          onEdit={(item:any)=> {setSelectedServices(item); handleOpen()}} 
          onDelete={(id:string) => deleteService(id)} />
          
        </div>
    </section>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const AddEditVoucherPurchased = lazy(() => import("@/core/drawer/add-edit-voucher-purchased"));
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search'

import { VOUCHER_PURCHASED_API_URL } from '@/core/utilities/api-url'
import { DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons'
import { Button, Progress, useDisclosure } from '@heroui/react'
import React, { lazy, Suspense } from 'react'


export default function VoucherPurchased() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedVoucherPurchased, setSelectedVoucherPurchased] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)


  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange(); 
    setSelectedVoucherPurchased(null)
  }

  return (
    <section className="">
        <PageTitle title="Voucher Purchased" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
              
            </div>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>


          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AddEditVoucherPurchased voucherPurchased={selectedVoucherPurchased} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          <DataGrid columns={columns} api={VOUCHER_PURCHASED_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedVoucherPurchased(item); handleOpen()}}  />
          
        </div>
    </section>
  )
}



const columns = [
  {name: "Customer", uid: "customer:firstname"},
  {name: "Voucher", uid: "voucherName"},
  {name: "Voucher Balance", uid: "voucherBalance"},
  {name: "Remaining Voucher", uid: "remainingVoucher"},
  {name: "Payment", uid: "paymentMethod"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];
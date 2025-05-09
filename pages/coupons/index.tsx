/* eslint-disable @typescript-eslint/no-explicit-any */
import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import SearchComponent from '@/core/common/search'
import { COUPONS_API_URL } from '@/core/utilities/api-url'
import { DownloadIcon, PlusIcon } from '@/core/utilities/svgIcons'
import { Button, Progress, useDisclosure } from '@heroui/react'
import React, { lazy, Suspense } from 'react'
const AddEditCoupons = lazy(() => import("@/core/drawer/add-edit-coupons"));


export default function Coupons() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const handleOpen = () => { onOpen(); };
  const [selectedCoupon, setSelectedCoupon] = React.useState(null)
  const [search, setSearch] = React.useState("")
  const [pageRefresh, setPageRefresh] = React.useState(false)

  const onDrawerClose = () => {
    setPageRefresh((val) => !val)
    onOpenChange();
    setSelectedCoupon(null)
  }

  return (
    <section className="">
        <PageTitle title="Coupons" />

        <div className="bg-white rounded" style={{margin: "-30px 40px"}}>
          <div className="flex items-center justify-between p-4">
            <Button size="md" color="secondary"> <DownloadIcon color="white" width="25" height="25" /> Export</Button>
            <div className="flex items-center gap-3">
              <SearchComponent onSearch={setSearch} />
              <Button size="md" color="primary" onPress={() => handleOpen()}> <PlusIcon color="white" width="25" height="25" /> New</Button>
            </div>
          </div>

          {isOpen && (
          <Suspense fallback={<Progress isIndeterminate aria-label="Loading..." size="sm" />}>
            <AddEditCoupons coupon={selectedCoupon} isOpen={isOpen} placement={"right"} onOpenChange={() => onDrawerClose()}  />
          </Suspense>
          )}

          <DataGrid columns={columns} api={COUPONS_API_URL} search={search} pageRefresh={pageRefresh}
          onEdit={(item:any)=> {setSelectedCoupon(item); handleOpen()}} />
          
        </div>
    </section>
  )
}



const columns = [
  // {name: "BRANCH", uid: "branch"},
  // {name: "SERVICE", uid: "service"},
  {name: "NAME", uid: "couponName"},
  // {name: "STAFFS", uid: "groupEmployees"},
  {name: "Discount ( % )", uid: "discountPercent"},
  {name: "VALID FROM", uid: "validFrom"},
  {name: "VALID TO", uid: "validTo"},
  // {name: "CREATED AT", uid: "createdAt"},
  // {name: "UPDATED AT", uid: "updatedAt"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

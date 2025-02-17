import DataGrid from '@/core/common/data-grid'
import { PageTitle } from '@/core/common/page-title'
import React from 'react'

export default function Categories() {
  return (
    <section className="">
        <PageTitle title="Categories" />
        <div className="px-6" style={{margin: "-30px auto"}}>
            <DataGrid />
        </div>
    </section>
  )
}

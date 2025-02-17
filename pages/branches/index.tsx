import React from 'react'
import DataGrid from "@/core/common/data-grid";
import { PageTitle } from '@/core/common/page-title';

export default function Branches() {

  return (
    <section className="">
        <PageTitle title="Branches" />
        <div className="px-6" style={{margin: "-30px auto"}}>
            <DataGrid />
        </div>
    </section>
  )
}

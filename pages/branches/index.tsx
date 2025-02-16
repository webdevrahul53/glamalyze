import React from 'react'
import DataGrid from "@/core/common/data-grid";
import { IconWrapper, PlusIcon } from "@/core/utilities/svgIcons";
import { useDisclosure } from '@heroui/react';
import HeroUIDrawer from '@/core/common/drawer';

export default function Branches() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleOpen = () => { onOpen(); };

  return (
    <section className="">
      <div className="flex bg-pink-500 text-white" style={{padding: "40px"}}>
        <h1 className="text-4xl">Branches</h1>
        <div className="flex items-center bg-blue-800 gap-2 p-2 px-3 ms-auto me-4 rounded cursor-pointer" onClick={() => handleOpen()}>
          <IconWrapper width={15} height={15} color="white" > <PlusIcon /> </IconWrapper>
          <div>Assignment</div>
        </div>
        <HeroUIDrawer isOpen={isOpen} placement={"right"} onOpenChange={() => onOpenChange()}></HeroUIDrawer>
      </div>
      <div className="pe-4" style={{width: "96%", margin: "-30px auto"}}>
        <DataGrid />
      </div>
    </section>
  )
}

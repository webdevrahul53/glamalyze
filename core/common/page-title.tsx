import React from 'react'
import { PlusIcon } from '../utilities/svgIcons'
import HeroUIDrawer from './drawer'
import { useDisclosure } from '@heroui/react';

export const PageTitle = ({title}: any) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleOpen = () => { onOpen(); };

  return ( 
    <div className="flex bg-primary text-white" style={{padding: "40px"}}>
        <h1 className="text-4xl">{title}</h1>
        <div className="flex items-center bg-secondary gap-2 p-3 px-6 ms-auto rounded cursor-pointer" onClick={() => handleOpen()}>
            <PlusIcon  width={15} height={15} color="white" />
            <div>Assignment</div>
        </div>
        <HeroUIDrawer isOpen={isOpen} placement={"right"} onOpenChange={() => onOpenChange()}></HeroUIDrawer>
    </div>
  )
}

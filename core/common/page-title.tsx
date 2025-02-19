import React from 'react'
import { PlusIcon } from '../utilities/svgIcons'
import HeroUIDrawer from './drawer'
import { useDisclosure } from '@heroui/react';

const NewAssignment = () => {
  return (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
        risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
        quam.
      </p>
      <p>
        Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor
        adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit duis sit
        officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
      </p>
    </>
  )
}

export const PageTitle = ({title}: any) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const handleOpen = () => { onOpen(); };

  return ( 
    <div className="flex bg-primary text-white" style={{padding: "40px", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px"}}>
        <h1 className="text-4xl">{title}</h1>
        <div className="flex items-center bg-secondary gap-2 p-3 px-6 ms-auto rounded cursor-pointer" onClick={() => handleOpen()}>
            <PlusIcon  width={15} height={15} color="white" />
            <div>Assignment</div>
        </div>
        <HeroUIDrawer isOpen={isOpen} placement={"right"} onOpenChange={() => onOpenChange()} 
          title="New Assignment" body={<NewAssignment />}></HeroUIDrawer>
    </div>
  )
}

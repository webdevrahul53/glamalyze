import { DashboardIcon, CalendarIcon, PeopleIcon, ServicesIcon, CodeBranch, CircleDotIcon, DotIcon, ListIcon, UserIcon, PersonIcon } from "@/core/utilities/svgIcons";
import Logo from "@/public/logo.png";
import Image from 'next/image'
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import {Accordion, AccordionItem} from "@heroui/react";


const ListboxWrapper = ({ Icon, title, href }: any) => {
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = React.useState<string>("black");

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure it's running on the client-side
      const root = getComputedStyle(document.documentElement);
      setPrimaryColor(root.getPropertyValue("--primary").trim());
    }
  }, []);

  return <Link href={href} className={`${router?.pathname == href ? "border-s-5 border-primary text-primary bg-light":""} flex items-center gap-3 p-2 px-3 hover:bg-gray-200 cursor-pointer`}>
    <Icon width={30} height={20} color={router?.pathname == href ? primaryColor:"black"} />
    <div>{title}</div>
  </Link>
};
  
  
export default function Layout(props:any) {
  const [navbarHeight, setNavbarHeight] = React.useState<number>();
  useEffect(() => {
    setNavbarHeight(document.getElementById("navbar")?.offsetHeight)
  }, [])
  
  return (
    <div style={{display: "grid", gridTemplateColumns: "1fr 5fr"}}>
      {/* Left Side */}
      <div>
        <Image src={Logo} alt="Logo" width={150} height={100} className="mx-3 my-6 pb-3" />

        <ListboxWrapper Icon={DashboardIcon} href={"/"} title="Dashboard"/>
        <ListboxWrapper Icon={CodeBranch} href={"/branches"} title="Branches" />
        <ListboxWrapper Icon={CalendarIcon} href={"/bookings"} title="Bookings" />
        
        <Accordion className="accordian flex flex-col gap-1 p-0" showDivider={false} variant="bordered" >
          <AccordionItem key="1" startContent={<ServicesIcon width={30} height={20} />} title="Services">
            <ListboxWrapper Icon={ListIcon} href={"/services"} title="List"/>
            <ListboxWrapper Icon={CircleDotIcon} href={"/services/categories"} title="Categories" />
            <ListboxWrapper Icon={DotIcon} href={"/services/sub-categories"} title="Sub Categories" />
          </AccordionItem>
        </Accordion>


        <ListboxWrapper Icon={PeopleIcon} href={"/staffs"} title="Staffs" />
        <ListboxWrapper Icon={PersonIcon} href={"/customers"} title="Customers" />
      </div>

      {/* Right Side */}
      <div className="bg-gray-100">

          {/* Navbar */}
          <section id="navbar" className="flex items-center bg-white px-5">
              <div className="p-3 px-5 hover:bg-gray-200 cursor-pointer border-b-4 border-blue-400 bg-blue-100">Main</div>
              <div className="p-3 px-5 hover:bg-gray-200 cursor-pointer">Shop</div>
              <div className="p-3 px-5 hover:bg-gray-200 cursor-pointer">Company</div>
              <div className="p-3 px-5 hover:bg-gray-200 cursor-pointer">Users</div>

              <div className="ms-auto px-4">
              <UserIcon width={40} height={30} />
              </div>
          </section>

          {/* Body */}
          <section style={{height: `calc(100vh - ${navbarHeight}px)`, overflow: "auto"}}>
            {props.children}
          </section>
        
      </div>
    </div>
  )
}

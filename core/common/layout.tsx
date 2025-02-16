import { DashboardIcon, CalendarIcon, PeopleIcon, ServicesIcon, PersonIcon, CodeBranch, PlusIcon } from "@/core/utilities/svgIcons";
import Logo from "@/public/logo.png";
import Image from 'next/image'
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from 'react'

const IconWrapper = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={props.width} height={props.height} fill={props.color}>
      {props.children}
    </svg>
  )
  
  export const ListboxWrapper = ({ Icon, title, href, active = false }: { Icon: any; title: string, href: string; active?: boolean; }) => {
    const router = useRouter();

    return <Link href={href} className={`${router.pathname == href ? "border-s-5 border-blue-400 text-blue-400 bg-blue-100":""} flex items-center gap-3 p-2 px-3 hover:bg-gray-200 cursor-pointer`}>
      <IconWrapper width={30} height={20} color={active ? "#60a5fa":"black"}> <Icon /> </IconWrapper>
      <div>{title}</div>
    </Link>
  };
  
  
export const Layout = (props:any) => {
  return (
    <div className="container mx-auto h-screen overflow-hidden">
      <div className="flex flex-wrap -mx-4 h-full">
        {/* Left Side */}
        <div className="w-full md:w-2/12 ps-4 h-full">
          <Image src={Logo} alt="Logo" width={150} height={100} className="mx-3 my-6 pb-3" />

          <ListboxWrapper Icon={DashboardIcon} href={"/"} title="Dashboard"/>
          <ListboxWrapper Icon={CodeBranch} href={"/branches"} title="Branches" active={true} />
          <ListboxWrapper Icon={CalendarIcon} href={"/bookings"} title="Bookings" />
          <ListboxWrapper Icon={ServicesIcon} href={"/services"} title="Services" />
          <ListboxWrapper Icon={PeopleIcon} href={"/staffs"} title="Staffs" />
        </div>

        {/* Right Side */}
        <div className="w-full md:w-10/12 bg-gray-100 h-full">

            {/* Navbar */}
            <section className="flex items-center bg-white px-5 pt-3">
                <div className="p-2 px-4 hover:bg-gray-200 cursor-pointer border-b-4 border-blue-400 bg-blue-100">Main</div>
                <div className="p-2 px-4 hover:bg-gray-200 cursor-pointer">Shop</div>
                <div className="p-2 px-4 hover:bg-gray-200 cursor-pointer">Company</div>
                <div className="p-2 px-4 hover:bg-gray-200 cursor-pointer">Users</div>

                <div className="ms-auto px-4">
                <IconWrapper width={40} height={30} > <PersonIcon /> </IconWrapper>
                </div>
            </section>

            {/* Body */}
            <section style={{width: "99%", height: "calc(100vh - 70px)", overflowX: "scroll"}}>
                {props.children}
            </section>
          
        </div>
      </div>
    </div>
  )
}

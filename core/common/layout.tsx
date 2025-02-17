import { DashboardIcon, CalendarIcon, PeopleIcon, ServicesIcon, PersonIcon, CodeBranch, IconWrapper } from "@/core/utilities/svgIcons";
import Logo from "@/public/logo.png";
import Image from 'next/image'
import Link from "next/link";
import { useRouter } from "next/router";
import React from 'react'

const ListboxWrapper = ({ Icon, title, href }: any) => {
  const router = useRouter();

  return <Link href={href} className={`${router?.pathname == href ? "border-s-5 border-blue-400 text-blue-400 bg-blue-100":""} flex items-center gap-3 p-2 px-3 hover:bg-gray-200 cursor-pointer`}>
    <IconWrapper width={30} height={20} color={router?.pathname == href ? "#60a5fa":"black"}> <Icon /> </IconWrapper>
    <div>{title}</div>
  </Link>
};
  
  
export default function Layout(props:any) {
  return (
    <div style={{display: "grid", gridTemplateColumns: "1fr 4fr"}}>
      {/* Left Side */}
      <div>
        <Image src={Logo} alt="Logo" width={150} height={100} className="mx-3 my-6 pb-3" />

        <ListboxWrapper Icon={DashboardIcon} href={"/"} title="Dashboard"/>
        <ListboxWrapper Icon={CodeBranch} href={"/branches"} title="Branches" />
        <ListboxWrapper Icon={CalendarIcon} href={"/bookings"} title="Bookings" />
        <ListboxWrapper Icon={ServicesIcon} href={"/services"} title="Services" />
        <ListboxWrapper Icon={PeopleIcon} href={"/staffs"} title="Staffs" />
      </div>

      {/* Right Side */}
      <div className="bg-gray-100">

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
          <section style={{height: "calc(100vh - 80px)", overflow: "auto"}}>
            {props.children}
          </section>
        
      </div>
    </div>
  )
}

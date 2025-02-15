/* eslint-disable @typescript-eslint/no-explicit-any */

import { DashboardIcon, CalendarIcon, PeopleIcon, ServicesIcon, PersonIcon, CodeBranch, PlusIcon } from "@/core/utilities/svgIcons";
import DataGrid from "@/core/common/data-grid";
import Logo from "@/public/logo.png";
import Image from "next/image";

const IconWrapper = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={props.width} height={props.height} fill={props.color}>
    {props.children}
  </svg>
)

export const ListboxWrapper = ({ Icon, title, active = false }: { Icon: any; title: string; active?: boolean; }) => (
  <div className={`${active ? "border-s-5 border-blue-400 text-blue-400 bg-blue-100":""} flex items-center gap-3 p-2 px-3 hover:bg-gray-200 cursor-pointer`}>
    <IconWrapper width={30} height={20} color={active ? "#60a5fa":"black"}> <Icon /> </IconWrapper>
    <div>{title}</div>
  </div>
);


export default function Home() {
  return (
    <div className="container mx-auto h-screen overflow-hidden">
      <div className="flex flex-wrap -mx-4 h-full">
        {/* Left Side */}
        <div className="w-full md:w-2/12 ps-4 h-full">
          <Image src={Logo} alt="Logo" width={150} height={100} className="mx-3 my-6 pb-3" />

          <ListboxWrapper Icon={DashboardIcon} title="Dashboard"/>
          <ListboxWrapper Icon={CodeBranch} title="Branches" active={true} />
          <ListboxWrapper Icon={CalendarIcon} title="Bookings" />
          <ListboxWrapper Icon={ServicesIcon} title="Services" />
          <ListboxWrapper Icon={PeopleIcon} title="Staffs" />
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
          <section className="">
            <div className="flex bg-pink-500 text-white" style={{padding: "40px"}}>
              <h1 className="text-4xl">Branches</h1>
              <div className="flex items-center bg-blue-800 gap-2 p-2 px-3 ms-auto me-4 rounded">
                <IconWrapper width={15} height={15} color="white" > <PlusIcon /> </IconWrapper>
                <div>Assignment</div>
              </div>
            </div>
            <div className="pe-4" style={{width: "96%", margin: "-30px auto"}}>
              <DataGrid />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

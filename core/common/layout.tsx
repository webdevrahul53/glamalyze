import { DashboardIcon, CalendarIcon, PeopleIcon, ServicesIcon, CodeBranch, CircleDotIcon, ListIcon, UserIcon, SettingIcon, UserGroupIcon, ChairIcon, CalendarOutlinedIcon } from "@/core/utilities/svgIcons";
import Logo from "@/public/logo.svg";
import Image from 'next/image'
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import {Accordion, AccordionItem, Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice/userSlice";


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
  const router = useRouter();
  const dispatch = useDispatch();
  const [navbarHeight, setNavbarHeight] = React.useState<number>();
  const user = useSelector((state:any) => state.user.value)

  useEffect(() => {
    setNavbarHeight(document.getElementById("navbar")?.offsetHeight || 0)
  }, [])
  
  return (
    <div style={{display: "grid", gridTemplateColumns: "1fr 5fr"}}>
      {/* Left Side */}
      <div>
        <Image src={Logo} alt="Logo" height={100} className="bg-primary" style={{width: "100%", padding: "11px", marginBottom: "20px"}} />

        <ListboxWrapper Icon={DashboardIcon} href={"/"} title="Dashboard"/>
        <ListboxWrapper Icon={CodeBranch} href={"/branches"} title="Branches" />
        <ListboxWrapper Icon={CalendarIcon} href={"/bookings"} title="Bookings" />
        <ListboxWrapper Icon={CalendarOutlinedIcon} href={"/shifts"} title="Shifts" />
        <ListboxWrapper Icon={SettingIcon} href={"/roster"} title="Roster" />
        
        <Accordion className="accordian flex flex-col gap-1 p-0" showDivider={false} variant="bordered" >
          <AccordionItem key="1" startContent={<ServicesIcon width={30} height={20} />} title="Services">
            <ListboxWrapper Icon={ListIcon} href={"/services"} title="List"/>
            <ListboxWrapper Icon={CircleDotIcon} href={"/services/categories"} title="Categories" />
            {/* <ListboxWrapper Icon={DotIcon} href={"/services/sub-categories"} title="Sub Categories" /> */}
          </AccordionItem>
        </Accordion>


        <ListboxWrapper Icon={PeopleIcon} href={"/staffs"} title="Staffs" />
        <ListboxWrapper Icon={UserGroupIcon} href={"/groups"} title="Groups" />
        <ListboxWrapper Icon={ChairIcon} href={"/asset-management"} title="Asset Management" />
        <ListboxWrapper Icon={UserIcon} href={"/customers"} title="Customers" />

        <Dropdown placement="right-end">
          <DropdownTrigger>
            <div className={`flex items-center gap-3 p-2 px-3 hover:bg-gray-200 cursor-pointer`}>
              <Avatar isBordered as="button" className="transition-transform" size="sm"
              src={user?.image || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"} />
              <div>Account</div>
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="auth" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{user?.email}</p>
            </DropdownItem>
            <DropdownItem key="profile" startContent={<UserIcon width={20} height={15} />}>Profile</DropdownItem>
            <DropdownItem key="settings" startContent={<SettingIcon width={20} height={15} />}>My Settings</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={() => {dispatch(setUser(null)); router.push("/auth/login")}}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Right Side */}
      <div className="bg-gray-100">

          {/* Body */}
          <section style={{height: `calc(100vh - ${navbarHeight}px)`, overflow: "auto"}}>
            {props.children}
          </section>
        
      </div>
    </div>
  )
}

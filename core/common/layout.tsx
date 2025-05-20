import { DashboardIcon, CalendarIcon, PeopleIcon, ServicesIcon, CodeBranch, CircleDotIcon, ListIcon, UserIcon, SettingIcon, UserGroupIcon, ChairIcon, CalendarOutlinedIcon, CouponIcon, VoucherIcon, VoucherPurchasedIcon, FinanceIcon, PersonIcon } from "@/core/utilities/svgIcons";
import Logo from "@/public/logo.svg";
import Image from 'next/image'
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import {Accordion, AccordionItem, Avatar, Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
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
  const [navbarHeight, setNavbarHeight] = React.useState<number>(0);
  const user = useSelector((state:any) => state.user.value)
  const [openAccordion, setOpenAccordion] = React.useState(null);

  const handleAccordionChange = (keys: any) => {
    const key:any = Array.from(keys)[0];
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    setNavbarHeight(document.getElementById("navbar")?.offsetHeight || 0)
  }, [])
  
  return (
    <div style={{display: "grid", gridTemplateColumns: "1fr 5fr"}}>
      {/* Left Side */}
      <div>
        <Image id="navbar" src={Logo} alt="Logo" height={100} className="bg-primary" style={{width: "100%", padding: "11px", marginBottom: "20px"}} />

        <div style={{height: `calc(100vh - ${(navbarHeight + 30)}px)`, overflow: "auto"}}>
          
          {/* <Accordion className="accordian flex flex-col gap-1 p-0" showDivider={false} variant="bordered"
            selectedKeys={openAccordion ? [openAccordion] : []}
            onSelectionChange={handleAccordionChange} >
            <AccordionItem key="0" startContent={<DashboardIcon width={30} height={20} />} title="Dashboard">
              <ListboxWrapper Icon={DashboardIcon} href={"/"} title="Main"/>
              <ListboxWrapper Icon={FinanceIcon} href={"/finance"} title="Finance" />
            </AccordionItem>
          </Accordion>
          

          

          <Accordion className="accordian flex flex-col gap-1 p-0" showDivider={false} variant="bordered"
            selectedKeys={openAccordion ? [openAccordion] : []}
            onSelectionChange={handleAccordionChange} >
            <AccordionItem key="2" startContent={<VoucherIcon width={30} height={20} />} title="Voucher & Coupon">
              <ListboxWrapper Icon={CouponIcon} href={"/coupons"} title="Coupons"/>
              <ListboxWrapper Icon={VoucherIcon} href={"/vouchers"} title="Vouchers" />
              <ListboxWrapper Icon={VoucherPurchasedIcon} href={"/voucher-purchased"} title="Voucher Purchased" />
            </AccordionItem>
          </Accordion>

  
          <Accordion className="accordian flex flex-col gap-1 p-0" showDivider={false} variant="bordered"
            selectedKeys={openAccordion ? [openAccordion] : []}
            onSelectionChange={handleAccordionChange} >
            <AccordionItem key="3 " startContent={<PeopleIcon width={30} height={20} />} title="Staff Management">
              <ListboxWrapper Icon={SettingIcon} href={"/roster"} title="Roster"/>
              <ListboxWrapper Icon={PeopleIcon} href={"/staffs"} title="Staffs" />
              <ListboxWrapper Icon={UserGroupIcon} href={"/groups"} title="Groups" />
            </AccordionItem>
          </Accordion> */}


          
          <ListboxWrapper Icon={DashboardIcon} href={"/"} title="Dashboard"/>
          <ListboxWrapper Icon={FinanceIcon} href={"/finance"} title="Finance Dashboard"/>
          <Divider />

          <ListboxWrapper Icon={CodeBranch} href={"/branches"} title="Branches" />
          <ListboxWrapper Icon={CalendarIcon} href={"/bookings"} title="Bookings" />
          <ListboxWrapper Icon={CalendarOutlinedIcon} href={"/shifts"} title="Shifts" />

          <Accordion className="accordian flex flex-col gap-1 p-0" showDivider={false} variant="bordered"
            selectedKeys={openAccordion ? [openAccordion] : []}
            onSelectionChange={handleAccordionChange} >
            <AccordionItem key="1" startContent={<ServicesIcon width={30} height={20} />} title="Services">
              <ListboxWrapper Icon={ListIcon} href={"/services"} title="List"/>
              <ListboxWrapper Icon={CircleDotIcon} href={"/services/categories"} title="Categories" />
            </AccordionItem>
          </Accordion>

          <ListboxWrapper Icon={CouponIcon} href={"/coupons"} title="Coupons" />
          <ListboxWrapper Icon={VoucherIcon} href={"/vouchers"} title="Vourchers" />
          <ListboxWrapper Icon={VoucherPurchasedIcon} href={"/voucher-purchased"} title="Vourcher Purchased" />
          <Divider />
          <ListboxWrapper Icon={SettingIcon} href={"/roster"} title="Roster" />
          <ListboxWrapper Icon={PeopleIcon} href={"/staffs"} title="Staffs" />
          <ListboxWrapper Icon={UserGroupIcon} href={"/groups"} title="Groups" />
          <Divider />
          <ListboxWrapper Icon={ChairIcon} href={"/asset-management"} title="Asset Management" />
          <ListboxWrapper Icon={PersonIcon} href={"/customers"} title="Customers" />

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
      </div>

      {/* Right Side */}
      <div className="bg-gray-100">

          {/* Body */}
          <section style={{height: `calc(100vh)`, overflow: "auto"}}>
            {props.children}
          </section>
        
      </div>
    </div>
  )
}

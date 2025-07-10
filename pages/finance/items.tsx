/* eslint-disable @typescript-eslint/no-explicit-any */
// import DataGrid from "@/core/common/data-grid";
import AvatarSelect from "@/core/common/avatar-select";
import { BRANCH_API_URL, CATEGORIES_API_URL, DASHBOARD_API_URL } from "@/core/utilities/api-url";
import { ImageIcon } from "@/core/utilities/svgIcons";
import { Accordion, AccordionItem, Input, Progress } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";


export default function Finance() {

  const [loading, setLoading] = React.useState(false);
  const [serviceData, setServiceData] = React.useState<any>(null);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [categoryList, setCategoryList] = React.useState<any>([]);

  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState<string>("");



  React.useEffect(() => {
    getBranchList();
    getCategoryList();
  }, [])


  React.useEffect(() => {
    getDashboardData();
  }, [searchText, selectedBranch, selectedCategory]);

  const getBranchList = async () => {
    try {
      const branches = await fetch(BRANCH_API_URL);
      const parsed = await branches.json();
      setBranchList(parsed);
    } catch (err: any) {
      toast.error(err.error);
    }
  };
  
  const getCategoryList = async () => {
    try {
        const category = await fetch(CATEGORIES_API_URL)
        const parsed = await category.json();
        setCategoryList(parsed);
      }catch(err:any) { toast.error(err.error) }
  }

  const getDashboardData = async () => {
    try {
      setLoading(true)
      let query = "";
      if (selectedBranch) query += `?branchId=${selectedBranch}`;
      if (selectedCategory) query += `${query ? "&" : "?"}categoryId=${selectedCategory}`;
      if (searchText) query += `${query ? "&" : "?"}searchText=${searchText}`;

      const services = await fetch(`${DASHBOARD_API_URL}/items${query}`);
      const parsed = await services.json();
      
      const grouped = groupByService(parsed.data);

      console.log(grouped);
      setServiceData(grouped);
      
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.error);
    }
  };

  function groupByService(data: any) {
    const grouped: any = {};
  
    data.forEach((item: any) => {
      const { service, branch, category, price } = item;
  
      if (!grouped[service._id]) {
        grouped[service._id] = {
          service, branch, category,
          prices: [price],
          children: [item]
        };
      } else {
        grouped[service._id].prices.push(price);
        grouped[service._id].children.push(item);
      }
    });
  
    // Convert grouped object into the desired array structure with priceRange
    const result = Object.values(grouped).map((group:any) => {
      const min = Math.min(...group.prices);
      const max = Math.max(...group.prices);
      return {
        service: group.service,
        branch: group.branch,
        category: group.category,
        priceRange: min === max ? `฿ ${min}` : `฿ ${min} - ฿ ${max}`,
        children: group.children
      };
    });
  
    return result;
  }
  


  return (
    <div style={{padding: "20px 40px 20px 30px"}}>
      
      <section className="flex gap-4 mb-2 w-3/5">
        
        <Input variant="faded" className="max-w-xs" label="Search" type="text" onChange={e => setSearchText(e.target.value)} />
        <AvatarSelect data={categoryList} label="Category" keyName="categoryname" field={{value: selectedCategory, onChange: (e:any) => setSelectedCategory(e?.target?.value || null)}} />
        <AvatarSelect data={branchList} label="Branch" keyName="branchname" field={{value: selectedBranch, onChange: (e:any) => setSelectedBranch(e?.target?.value || null)}}  />
        
      </section>


      
      <div className="grid grid-cols-2 gap-3 border-b-2 border-gray-400" style={{padding: "10px 15px"}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon width={40} height={30} />
            <strong>Item</strong>
          </div>
          <strong>Reporting Category</strong>
        </div>
        <div className="flex items-center justify-between">
          <strong>Location</strong>
          <strong style={{paddingRight: "35px"}}>Price</strong>
        </div>
      </div>
      {loading && <Progress isIndeterminate aria-label="Loading..." size="sm" />}      

      <Accordion itemType="single" defaultExpandedKeys={"0"}>
        {serviceData?.length && serviceData?.map((item:any, index:number) => <AccordionItem key={index} title={<div>
          <div className="grid grid-cols-2 px-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <img src={item.service.image} width={30} alt="" className="rounded" />
                <span className="text-lg font-semibold">{item.service.name}  </span>
              </div>
              <div>
                <i>{item.category.categoryname}</i> 
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <small className="ms-3 p-1">{item.branch.branchname}</small> 
              <span className="text-sm text-gray-500">{item.priceRange}</span>
            </div>
          </div>
        </div>}>

          {item.children.map((child:any, childIndex:number) => (
            <div key={childIndex} className="border-b-2" style={{padding: "10px 40px"}}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <ImageIcon width={30} height={20} />
                  <div>{child.duration} min </div>
                </div>
                <div className="flex items-center justify-between">
                  <small>{item.branch.branchname}</small>
                  <span className="text-gray-500">฿ {child.price}</span>
                </div>
              </div>
              
            </div>
          ))}
          
        </AccordionItem>)}
      </Accordion>
      
    </div>
  );
}

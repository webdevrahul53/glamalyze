import { Avatar, Card, CardHeader, Tooltip } from "@heroui/react";
import { CloseIcon, InfoIcon } from "../utilities/svgIcons";


const ServiceCard = (props:any) => {
    const name = props?.name ? props?.name : props?.firstname + " " + props?.lastname
    return (
      <Card className="w-full flex-shrink-0 shadow-sm border-2">
        <CardHeader className="justify-between">
          <div className="flex gap-3">
            <Avatar isBordered radius="full" size="sm" src={props.image} />
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600 flex items-center">
                {name}
                <Tooltip content={`Note: ${props.note}`} placement="right" color="primary" showArrow={true}>
                  <div><InfoIcon width={30} height={20} color="gray" /></div>
                </Tooltip>
              </h4>
              <h5 className="text-small tracking-tight text-default-400"> <strong> {props.email || props.createdAt}</strong> </h5>
            </div>
          </div>
          <div className="cursor-pointer" onClick={props.onDelete}>
            <CloseIcon width="20" height="20" />  
          </div> 
        </CardHeader>
      </Card>
    );
}
  

export default ServiceCard
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ROLES_API_URL } from "@/core/utilities/api-url";
import { CloseIcon } from "@/core/utilities/svgIcons";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Input } from "@heroui/react";
import React from "react";
import { toast } from "react-toastify";

export default function Roles(props:any) {

    const [roleList, setRoleList] = React.useState<any>([]);
    const [rolesName, setRolesName] = React.useState<string>("");

    React.useEffect(() => {
        getRolesList();
    }, []);

    const getRolesList = async () => {
        try {
            const roles = await fetch(ROLES_API_URL);
            const parsed = await roles.json();
            setRoleList(parsed)
        } catch (err:any) {
            console.error(err);
        }
    }

    const onSubmit = async (data:any) => {
        console.log(data);
        try {
            // Simulate an API call to save the role
            const response = await fetch(ROLES_API_URL, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });
            const parsed = await response.json();
            console.log(parsed);
            if(!parsed.status) {
                toast.error(parsed.message);
                
            }

            getRolesList();
            // Close the drawer after saving
            // props.onOpenChange();
        } catch (err:any) {
            console.error(err);
        }
    }


    const deleteRole = async (roleId:string) => {
        try {
            await fetch(`${ROLES_API_URL}/${roleId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            getRolesList();
        } catch (err:any) {
            console.error(err);
        }
    }
    
    
    
    return (<Drawer isOpen={props.isOpen} placement={"right"} onOpenChange={props.onOpenChange}>
        <DrawerContent>
            {() => (
            <>
                <DrawerHeader className="flex flex-col gap-1"> 
                    {/* <div className="text-gray-500 text-sm">{moment(props?.dateFor).toDate().toDateString()}</div>     */}
                    {/* <div>{props.group.groupname}</div>     */}
                        <h2>Roles</h2>
                </DrawerHeader>
                <DrawerBody> 
                    
                    {/* <input type="color" /> */}
                    <Input label="Role" placeholder="Enter Role" type="text" variant="flat" isRequired value={rolesName} onChange={e => setRolesName(e.target.value)} />
                    <Button variant="solid" onPress={() => onSubmit({rolesName})}>ADD</Button>
                    
                    <div className="flex-1 px-4">
                        {roleList.map((role:any) => (
                            <div key={role._id} className="flex items-center gap-2 justify-between p-2 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Avatar size="sm" src={role.image} style={{width: "25px", height: "25px"}} />
                                    <div className="text-sm"> {role.rolesName} </div>
                                </div>
                                <div className="cursor-pointer" onClick={() => {
                                    // Handle delete role logic here
                                    deleteRole(role._id);
                                }}>
                                    <CloseIcon color="darkred" width={25} height={25} />
                                </div>
                            </div> 
                        ))}

                    </div>

                </DrawerBody>
            </>
            )}
        </DrawerContent>
    </Drawer>
    );
  }
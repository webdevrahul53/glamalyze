import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import { SaveIcon } from "../utilities/svgIcons";

export default function HeroUIDrawer(props:any) {
  return (
    <>
      <Drawer isOpen={props.isOpen} placement={props.placement} onOpenChange={props.onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">{props.title}</DrawerHeader>
              <DrawerBody> {props.body} </DrawerBody>
              <DrawerFooter style={{justifyContent: "start"}}>
                <Button color="primary" onPress={() => props.saveClicked()}> 
                  <SaveIcon width="15" color="white" />  {props.loading ? "Saving":"Save"} 
                </Button>
                <Button color="danger" variant="bordered" onPress={onClose}> Close </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}


import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    useColorModeValue,
    useDisclosure,
    UseDisclosureProps,
} from "@chakra-ui/react";

const DrawerContainer = ({
    onClose,
    onOpen,
    isOpen,
    children,
}: UseDisclosureProps & {
    children: React.ReactNode;
}) => {
    return (
        <Drawer
            onClose={onClose ?? (() => undefined)}
            isOpen={isOpen || false}
            size={"full"}
        >
            <DrawerOverlay />
            <DrawerContent mt={NAVBAR_HEIGHT}>
                <DrawerCloseButton />
                <DrawerHeader
                    fontWeight={"normal"}
                    bgColor={useColorModeValue("white", "gray.900")}
                >
                    <Container maxWidth={PAGE_CONTAINER_SIZE}> </Container>
                </DrawerHeader>
                <DrawerBody bgColor={useColorModeValue("white", "gray.900")}>
                    {children}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default DrawerContainer;

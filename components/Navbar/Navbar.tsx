"use client";

import { useAuthContainer } from "@/app/providers";
import { signInWithGoogle, signOutWithGoogle } from "@/firebase/google";
import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Link,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "lucide-react";
import UserAvatar from "../Display/Avatar";

const Navbar = () => {
    const { toggleColorMode, colorMode } = useColorMode();

    const authCtx = useAuthContainer();

    const user = authCtx?.user;

    return (
        // <Container size={PAGE_CONTAINER_SIZE} height={NAVBAR_HEIGHT}>
        //     <Text> Hello ! </Text>
        // </Container>

        <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
            {/* <Container> */}
            <Flex
                h={16}
                alignItems={"center"}
                justifyContent={"space-between"}
                width="100%"
            >
                <Flex alignItems="center">
                    {/* {router.pathname !== "/" && (
                        <IconButton
                            onClick={goBack}
                            variant="ghost"
                            // w={4}
                            // h={4}
                            p={0}
                            minW={8}
                            icon={<ChevronLeftIcon p={0} />}
                            aria-label="Go back"
                        />
                    )} */}

                    {/* <NextLink passHref href={"/"}>
                        
                        <Link></Link>
                    </NextLink> */}
                    <Text>Canvaid</Text>
                </Flex>

                <Flex alignItems={"center"}>
                    <Stack direction={"row"} spacing={2}>
                        {/* <Timer /> */}
                        <Button onClick={toggleColorMode}>
                            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                        </Button>

                        <Menu>
                            <MenuButton
                                as={Button}
                                rounded={"full"}
                                variant={"link"}
                                cursor={"pointer"}
                                minW={0}
                            >
                                {/* <Avatar
                                            size={"sm"}
                                            src={
                                                user
                                                    // ? user.photo_url
                                                    ? undefined
                                                    : ""
                                            }
                                            name={user?.first_name}
                                        /> */}
                                {/* <UserAvatar user={user} /> */}
                                {/* <Button> Menu </Button> */}
                                <Text> Menu </Text>
                            </MenuButton>
                            <MenuList alignItems={"center"}>
                                {user ? (
                                    <>
                                        <br />
                                        <Center>
                                            <UserAvatar
                                                user={user}
                                                size="2xl"
                                            />
                                        </Center>
                                        <br />
                                        <Center>
                                            <p>{user.displayName}</p>
                                        </Center>
                                        <Center>
                                            <p>{user.email}</p>
                                        </Center>
                                        <br />
                                        <MenuDivider />
                                        <MenuItem onClick={signOutWithGoogle}>
                                            Logout
                                        </MenuItem>
                                    </>
                                ) : (
                                    <Center>
                                        <Button onClick={signInWithGoogle}>
                                            {" "}
                                            Login{" "}
                                        </Button>
                                    </Center>
                                )}
                            </MenuList>
                        </Menu>
                    </Stack>
                </Flex>
            </Flex>
            {/* </Container> */}
        </Box>
    );
};

export default Navbar;

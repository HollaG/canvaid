"use client";

import { useAuthContainer } from "@/app/providers";
import { signInWithGoogle, signOutWithGoogle } from "@/firebase/auth/google";
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

import UserAvatar from "../Display/Avatar";
import { ChevronLeftIcon, MoonIcon, SunIcon, TimeIcon } from "@chakra-ui/icons";
import { signOutAll } from "@/firebase/auth";

import NextLink from "next/link";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import { useEffect, useState } from "react";

import MainLogo from "@/public/logos/main.png";
import Image from "next/image";
import { TbDoorExit } from "react-icons/tb";

const Navbar = () => {
    const { toggleColorMode, colorMode } = useColorMode();

    const authCtx = useAuthContainer();

    const user = authCtx?.user;

    // TODO: do we need this
    const [showShadow, setShowShadow] = useState(true);
    useScrollPosition(({ prevPos, currPos }) => {
        // setShowShadow(currPos.y < 0);
    });

    const [date, setDate] = useState<string>("");
    useEffect(() => {
        setDate(new Date().toLocaleDateString());
    }, []);
    return (
        // <Box height={NAVBAR_HEIGHT} px={6} pt={3} position="fixed" w="100%">
        //     <Box
        //         width="full"
        //         borderRadius={"full"}
        //         boxShadow="xl"
        //         p={3}
        //         // bgColor="teal.100"
        //         bgColor="white"
        //     >
        //         <Flex
        //             alignItems={"center"}
        //             justifyContent={"space-between"}
        //             width="100%"
        //         >
        //             <Flex alignItems="center">
        //                 <Link as={NextLink} href="/">
        //                     <Image
        //                         src={MainLogo}
        //                         height="34"
        //                         alt="Website logo"
        //                     />
        //                 </Link>
        //             </Flex>
        //             <Text>Current date: {date}</Text>
        //             <Flex alignItems={"center"}>
        //                 <Stack direction={"row"} spacing={2}>
        //                     {/* <Timer /> */}
        //                     <Button
        //                         onClick={toggleColorMode}
        //                         variant="ghost"
        //                         colorScheme="gray"
        //                     >
        //                         {colorMode === "light" ? (
        //                             <MoonIcon />
        //                         ) : (
        //                             <SunIcon />
        //                         )}
        //                     </Button>

        //                     <Menu>
        //                         <MenuButton
        //                             as={Button}
        //                             rounded={"full"}
        //                             cursor={"pointer"}
        //                             minW={0}
        //                             variant="ghost"
        //                             colorScheme="gray"
        //                         >
        //                             <Text> Menu </Text>
        //                         </MenuButton>
        //                         <MenuList alignItems={"center"}>
        //                             {user ? (
        //                                 <>
        //                                     <br />
        //                                     <Center>
        //                                         <UserAvatar
        //                                             user={user}
        //                                             size="2xl"
        //                                         />
        //                                     </Center>
        //                                     <br />
        //                                     <Center>
        //                                         <p>{user.displayName}</p>
        //                                     </Center>
        //                                     <Center>
        //                                         <p>{user.email}</p>
        //                                     </Center>
        //                                     <br />
        //                                     <MenuDivider />
        //                                     <MenuItem onClick={signOutAll}>
        //                                         Logout
        //                                     </MenuItem>
        //                                 </>
        //                             ) : (
        //                                 <Center>
        //                                     <Button as={NextLink} href="/auth">
        //                                         {" "}
        //                                         Login{" "}
        //                                     </Button>
        //                                 </Center>
        //                             )}
        //                         </MenuList>
        //                     </Menu>
        //                 </Stack>
        //             </Flex>
        //         </Flex>
        //     </Box>
        // </Box>
        // <Container size={PAGE_CONTAINER_SIZE} height={NAVBAR_HEIGHT}>
        //     <Text> Hello ! </Text>
        // </Container>
        <Box position={"relative"}>
            <Box
                bg={useColorModeValue("white", "gray.800")}
                opacity={showShadow ? 0.9 : 1}
                px={4}
                position="fixed"
                w="full"
                zIndex={10000}
                // boxShadow={showShadow ? "md" : "unset"}
                backdropBlur="xl"
                transition={"opacity 0.2s ease-in-out"}
            >
                <Box width="full">
                    <Flex
                        h={16}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        width="100%"
                    >
                        <Flex alignItems="center">
                            <Link as={NextLink} href="/">
                                <Image
                                    src={MainLogo}
                                    height="34"
                                    alt="Website logo"
                                />
                            </Link>
                        </Flex>
                        {/* <Text>Current date: {date}</Text> */}
                        <Flex alignItems={"center"}>
                            <Stack direction={"row"} spacing={2}>
                                {/* <Timer /> */}
                                <Button
                                    onClick={toggleColorMode}
                                    variant="ghost"
                                    colorScheme="gray"
                                >
                                    {colorMode === "light" ? (
                                        <MoonIcon />
                                    ) : (
                                        <SunIcon />
                                    )}
                                </Button>
                                {user && (
                                    <Button
                                        variant={"ghost"}
                                        colorScheme="gray"
                                        onClick={signOutAll}
                                    >
                                        <TbDoorExit />
                                    </Button>
                                )}

                                {/* <Menu>
                                    <MenuButton
                                        as={Button}
                                        rounded={"full"}
                                        cursor={"pointer"}
                                        minW={0}
                                        variant="ghost"
                                        colorScheme="gray"
                                    >
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
                                                <MenuItem onClick={signOutAll}>
                                                    Logout
                                                </MenuItem>
                                            </>
                                        ) : (
                                            <Center>
                                                <Button
                                                    as={NextLink}
                                                    href="/auth"
                                                >
                                                    {" "}
                                                    Login{" "}
                                                </Button>
                                            </Center>
                                        )}
                                    </MenuList>
                                </Menu> */}
                            </Stack>
                        </Flex>
                    </Flex>
                </Box>
            </Box>

            {/* Shadow element */}
            <Box
                position="fixed"
                zIndex={1}
                top={0}
                right={0}
                left={0}
                height={NAVBAR_HEIGHT}
                boxShadow={"md"}
                opacity={showShadow ? 1 : 0}
                transition={"opacity 200ms ease-in-out"}
                backdropBlur="xl"
                backdropFilter={"saturate(180%) blur(5px)"}
            ></Box>
        </Box>
    );
};

export default Navbar;

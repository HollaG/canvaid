"use client";

import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Box,
    Button,
    Container,
    Flex,
    Link,
    Menu,
    MenuButton,
    MenuList,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "lucide-react";

const Navbar = () => {
    const { toggleColorMode, colorMode } = useColorMode();

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

                        <Menu isLazy>
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
                            </MenuButton>
                            <MenuList alignItems={"center"}>
                                {/* {user ? (
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
                                            <p>{user.first_name}</p>
                                        </Center>
                                        <Center>
                                            <p>@{user.username}</p>
                                        </Center>
                                        <br />
                                        <MenuDivider />
                                        <MenuItem
                                            onClick={() => logoutHandler()}
                                        >
                                            Logout
                                        </MenuItem>
                                    </>
                                ) : (
                                    <Center>
                                        <LoginButton />
                                    </Center>
                                )} */}
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

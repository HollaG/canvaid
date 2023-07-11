import Head from "next/head";
import {
    Box,
    Heading,
    Container,
    Text,
    Button,
    Stack,
    Icon,
    useColorModeValue,
    createIcon,
    Flex,
    Center,
    SimpleGrid,
    Avatar,
    useBreakpoint,
    useMediaQuery,
    Link,
} from "@chakra-ui/react";
import { signInWithGoogle } from "@/firebase/auth/google";
import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import NextLink from "next/link";

import HomePageImage from "@/public/assets/homepage.svg";
import HomePageBackground from "@/public/assets/background.svg";
import GetStartedImage from "@/public/assets/get_started.svg";
import Features1 from "@/public/assets/features_1.svg";
import Features2 from "@/public/assets/features_2.svg";

import Image from "next/image";
import {
    ArrowDownIcon,
    ArrowForwardIcon,
    ArrowRightIcon,
} from "@chakra-ui/icons";
import { ReactElement, ReactNode } from "react";
import {
    FcAssistant,
    FcDonate,
    FcElectroDevices,
    FcEnteringHeavenAlive,
    FcInTransit,
    FcMindMap,
} from "react-icons/fc";

export default function NotAuthedHomePage() {
    const [showMainPhoto] = useMediaQuery("(min-width: 64em)");
    const [showSecondPerson] = useMediaQuery("(min-width: 48em)");
    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Stack spacing={0}>
                <Center
                    background={useColorModeValue("gray.100", "gray.900")}
                    backgroundImage={"url(/assets/background.svg)"}
                    backgroundAttachment="fixed"
                    minH={`100vh`}
                    position="relative"
                >
                    <Container maxW={PAGE_CONTAINER_SIZE} mt="-36" mb={24}>
                        <Stack
                            as={Box}
                            spacing={{ base: 8, md: 14 }}
                            py={{ base: 20, md: 36 }}
                        >
                            <Flex justifyContent={"space-between"}>
                                <Box maxWidth="900px" flexGrow="1">
                                    <Heading
                                        fontWeight={800}
                                        fontSize={{
                                            base: "5xl",
                                            sm: "6xl",
                                            md: "7xl",
                                        }}
                                        lineHeight={"110%"}
                                        letterSpacing="wide"
                                    >
                                        Study better <br />
                                        <Text as={"span"} color={"teal.400"}>
                                            with Canvaid!
                                        </Text>
                                    </Heading>
                                    <Text
                                        color={useColorModeValue(
                                            "gray.600",
                                            "gray.300"
                                        )}
                                        maxWidth="650px"
                                        fontSize="lg"
                                        mt={6}
                                        letterSpacing="wide"
                                    >
                                        A handy tool for redoing and reviewing
                                        any Canvas quiz! <br />
                                        Check your answers and learn from your
                                        mistakes!
                                    </Text>
                                    <Flex mt={10} flexWrap="wrap">
                                        <Box mr={6} mb={4}>
                                            <Button
                                                px={6}
                                                // onClick={signInWithGoogle}
                                                as={NextLink}
                                                href="/auth"
                                                data-testid="cta-btn"
                                                rightIcon={<ArrowForwardIcon />}
                                                size="lg"
                                            >
                                                Get Started
                                            </Button>
                                        </Box>
                                        <Box>
                                            <Button
                                                // onClick={signInWithGoogle}

                                                data-testid="learn-more-btn"
                                                rightIcon={<ArrowDownIcon />}
                                                variant="outline"
                                                size="lg"
                                            >
                                                Learn more
                                            </Button>
                                        </Box>
                                    </Flex>
                                </Box>
                                {showMainPhoto && (
                                    <Box flexGrow={0} maxWidth="400px">
                                        <Image
                                            src={HomePageImage}
                                            alt="Home page image"
                                        />
                                    </Box>
                                )}
                            </Flex>
                        </Stack>
                    </Container>{" "}
                    <Box
                        position="absolute"
                        bottom={"-73px"}
                        overflow="hidden"
                        width="400px"
                    >
                        <Image
                            src={GetStartedImage}
                            alt="Get started"
                            width="400"
                        />
                    </Box>
                </Center>
                <Box boxShadow={"inner"} position="relative">
                    <Container maxW={PAGE_CONTAINER_SIZE} minH="65vh">
                        <Stack spacing={8} mb={24}>
                            <Center mt={36}>
                                <Heading>
                                    {" "}
                                    Get started in{" "}
                                    <Text as={"span"} color={"teal.400"}>
                                        three easy steps
                                    </Text>
                                </Heading>
                            </Center>
                            <Instructions />
                        </Stack>
                    </Container>
                    <Center>
                        {showSecondPerson && (
                            <Box
                                position="absolute"
                                overflow="hidden"
                                width="200px"
                                transform={"scaleX(-1)"}
                                right="70%"
                                bottom="-22px"
                            >
                                <Image
                                    src={Features1}
                                    alt="Get started"
                                    width="200"
                                />
                            </Box>
                        )}
                        <Box
                            position="absolute"
                            overflow="hidden"
                            width="200px"
                            bottom={"-60px"}
                            left={showSecondPerson ? "70%" : "45%"}
                        >
                            <Image
                                src={Features2}
                                alt="Get started"
                                width="200"
                            />
                        </Box>{" "}
                    </Center>
                </Box>
                <Features />{" "}
                <Box>
                    <Container maxW={PAGE_CONTAINER_SIZE}></Container>
                </Box>
            </Stack>
        </>
    );
}

const Arrow = createIcon({
    displayName: "Arrow",
    viewBox: "0 0 72 24",
    path: (
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
            fill="currentColor"
        />
    ),
});

interface FeatureProps {
    title: string;
    text: React.ReactNode;
    icon: ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
    return (
        <Stack>
            <Flex
                w={16}
                h={16}
                align={"center"}
                justify={"center"}
                color={"white"}
                rounded={"full"}
                bg={"gray.100"}
                mb={1}
            >
                {icon}
            </Flex>
            <Text fontWeight={600}>{title}</Text>
            <Text color={"gray.600"}>{text}</Text>
        </Stack>
    );
};

function Instructions() {
    return (
        <Box p={4}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={20}>
                <Feature
                    icon={<Icon as={FcEnteringHeavenAlive} w={10} h={10} />}
                    title={"Sign in"}
                    text={
                        "By signing in, you can access your quizzes and study anytime, anywhere."
                    }
                />
                <Feature
                    icon={<Icon as={FcElectroDevices} w={10} h={10} />}
                    title={"Register your Canvas Token"}
                    text={
                        <>
                            Your Canvas Token allows us to streamline the
                            collection of your quiz data, making it easier for
                            you. Find your token{" "}
                            <Link
                                isExternal
                                href="https://canvas.nus.edu.sg/profile/settings#access_tokens_holder"
                                textDecor={"underline"}
                            >
                                here
                            </Link>
                            .
                        </>
                    }
                />
                <Feature
                    icon={<Icon as={FcMindMap} w={10} h={10} />}
                    title={"Upload quizzes"}
                    text={"Start your learning journey by uploading quizzes!"}
                />
            </SimpleGrid>
        </Box>
    );
}

const Testimonial = ({ children }: { children: ReactNode }) => {
    return <Box>{children}</Box>;
};

const TestimonialContent = ({ children }: { children: ReactNode }) => {
    return (
        <Stack
            bg={useColorModeValue("white", "gray.800")}
            boxShadow={"lg"}
            p={8}
            rounded={"xl"}
            align={"center"}
            pos={"relative"}
            _after={{
                content: `""`,
                w: 0,
                h: 0,
                borderLeft: "solid transparent",
                borderLeftWidth: 16,
                borderRight: "solid transparent",
                borderRightWidth: 16,
                borderTop: "solid",
                borderTopWidth: 16,
                borderTopColor: useColorModeValue("white", "gray.800"),
                pos: "absolute",
                bottom: "-16px",
                left: "50%",
                transform: "translateX(-50%)",
            }}
        >
            {children}
        </Stack>
    );
};

const TestimonialHeading = ({ children }: { children: ReactNode }) => {
    return (
        <Heading as={"h3"} fontSize={"xl"}>
            {children}
        </Heading>
    );
};

const TestimonialText = ({ children }: { children: ReactNode }) => {
    return (
        <Text
            textAlign={"center"}
            color={useColorModeValue("gray.600", "gray.400")}
            fontSize={"sm"}
        >
            {children}
        </Text>
    );
};

const TestimonialAvatar = ({
    name,
    title,
}: {
    name: string;
    title: string;
}) => {
    return (
        <Flex align={"center"} mt={8} direction={"column"}>
            <Avatar bg="teal.500" mb={2} />
            <Stack spacing={-1} align={"center"}>
                <Text fontWeight={600}>{name}</Text>
                <Text
                    fontSize={"sm"}
                    color={useColorModeValue("gray.600", "gray.400")}
                >
                    {title}
                </Text>
            </Stack>
        </Flex>
    );
};

function Features() {
    return (
        <Box bg={useColorModeValue("gray.50", "gray.700")}>
            <Container
                maxW={"7xl"}
                py={16}
                as={Stack}
                spacing={12}
                // borderTop="1px solid black"
            >
                <Stack spacing={0} align={"center"}>
                    <Heading> Features and benefits 🙌</Heading>
                    <Text>
                        Canvaid is designed to give you everything you need to
                        get that A for the exams.
                    </Text>
                </Stack>
                <SimpleGrid
                    columns={{ base: 1, md: 3 }}
                    spacing={{ base: 10, md: 4, lg: 10 }}
                >
                    <Testimonial>
                        <TestimonialContent>
                            <TestimonialHeading>
                                Question Compilation
                            </TestimonialHeading>
                            <TestimonialText>
                                I'm able to see all my questions for each course
                                in one place! It makes it so easy for me to
                                revise!
                            </TestimonialText>
                        </TestimonialContent>
                        <TestimonialAvatar
                            name={"Sarah"}
                            title={"Year 1, NUS"}
                        />
                    </Testimonial>
                    <Testimonial>
                        <TestimonialContent>
                            <TestimonialHeading>
                                Annotating questions
                            </TestimonialHeading>
                            <TestimonialText>
                                I am quite forgetful, and being able to leave a
                                comment for myself on each question on why I got
                                it wrong is soo helpful!
                            </TestimonialText>
                        </TestimonialContent>
                        <TestimonialAvatar
                            name={"Jane"}
                            title={"Year 2, NUS"}
                        />
                    </Testimonial>
                    <Testimonial>
                        <TestimonialContent>
                            <TestimonialHeading>
                                The best study buddy
                            </TestimonialHeading>
                            <TestimonialText>
                                Some of my courses don't have past year papers,
                                and Canvaid allows me to easily redo all my
                                course quizzes so I have at least something to
                                refer to!
                            </TestimonialText>
                        </TestimonialContent>
                        <TestimonialAvatar name={"Max"} title={"Year 2, NUS"} />
                    </Testimonial>
                </SimpleGrid>
            </Container>
        </Box>
    );
}

'use client'
import {Box, Flex, Button, Text} from '@chakra-ui/react'
import SignOutButton from './SignOutButton';
import Module from './Module';

const MainPage = () => {
  return (
    <Box p={4}>
      <SignOutButton />
      <Module />
    </Box>
  );
  //const { signOut } = useAuth(); // Replace with the sign-out function from firebase
  // const handleSignOut = () => {
  //   //call firebase sign out
  // };
  // return (
  //   <Button onClick = {handleSignOut}>Sign Out</Button>
  // )
}

export default MainPage
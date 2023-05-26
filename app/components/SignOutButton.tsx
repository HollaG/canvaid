'use client'
import { Button, Flex, Text, IconButton} from "@chakra-ui/react";

const SignOutButton = () => {
  return (
    <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center">
          {/* Add Canvaid icon */}
          ADD CANVAID ICON HERE
          <Text fontSize="xl" fontWeight="bold">Canvaid</Text>
        </Flex>
  <Button colorScheme="blue" > {/* onClick={handleSignOut} */}
    Sign Out
  </Button>
  </Flex>
  )
}

export default SignOutButton
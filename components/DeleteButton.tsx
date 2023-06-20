'use client'
import { Button, Flex, Text, IconButton} from "@chakra-ui/react";
import { deleteDoc , doc} from "firebase/firestore";
import {db} from "../firebase/database/index"
const COLLECTION_NAME = "uploads";
type DeleteButtonProps = {
  ID: string;
  onDelete: () => void;
}
function DeleteButton({ID, onDelete} : DeleteButtonProps) {
  const handleDelete = async () => {
    try {
      const docRef = doc(db, COLLECTION_NAME, ID);
      await deleteDoc(docRef);
      onDelete();
    } catch(error) {
      console.log(error);
    }
  }
    
  return (
    <Button colorScheme="red" onClick={handleDelete}>
      Delete
    </Button>
  )
 
  }
export default DeleteButton
 // return (
  //   <Flex align="center" justify="space-between" mb={4}>
  //       <Flex align="center">
  //         {/* Add Canvaid icon */}
  //         ADD CANVAID ICON HERE
  //         <Text fontSize="xl" fontWeight="bold">Canvaid</Text>
  //       </Flex>
  // <Button colorScheme="blue" > {/* onClick={handleSignOut} */}
  //   Sign Out
  // </Button>
  // </Flex>
  // )

import {
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    UseDisclosureProps,
    UseDisclosureReturn,
    AlertDialog,
} from "@chakra-ui/react";
import { useRef } from "react";

const CustomAlertDialog = ({
    bodyText,

    isOpen,
    onOpen,
    onClose,

    headerText,
    ConfirmButton,
}: UseDisclosureReturn & {
    headerText: string;
    bodyText: string;

    ConfirmButton: JSX.Element;
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader
                        fontSize="lg"
                        fontWeight="bold"
                        dangerouslySetInnerHTML={{
                            __html: headerText,
                        }}
                        whiteSpace="pre-line"
                    ></AlertDialogHeader>

                    <AlertDialogBody whiteSpace="pre-line">
                        {bodyText}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose} mr={3}>
                            Cancel
                        </Button>
                        {ConfirmButton}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default CustomAlertDialog;

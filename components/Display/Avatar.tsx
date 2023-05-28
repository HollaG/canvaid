import { Avatar } from "@chakra-ui/react";

/**
 * Renders a user avatar
 *
 * @param param0
 * @returns
 */
const UserAvatar: React.FC<{
    user: any | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
}> = ({ user, size = "sm" }) => {
    return (
        <Avatar
            size={size}
            src={
                user
                    ? // ? user.photo_url
                      undefined
                    : "https://coursemology3.s3.ap-southeast-1.amazonaws.com/uploads/images/user/111398/profile_photo/medium_image.jpg?X-Amz-Expires=600&X-Amz-Date=20230528T044818Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA2EQN7A45RM2X7VPX%2F20230528%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=0a523053225a2cbd68c53c3cfac80549b8f2f2871660781f3c32993abcee5404"
            }
            name={user?.first_name}
        />
    );
};

export default UserAvatar;

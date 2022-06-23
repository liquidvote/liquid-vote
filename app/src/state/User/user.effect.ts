import { useQuery, useMutation } from "@apollo/client";

import { USER } from "@state/User/typeDefs";

export default function useUser({
    userHandle
}: {
    userHandle?: string
}) {
    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle: userHandle },
        skip: userHandle === "new" || !userHandle
    });

    return {
        user: user_data?.User
    };
}
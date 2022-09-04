import { useQuery, useMutation } from "@apollo/client";

import { USER } from "@state/User/typeDefs";

export default function useUser({
    userHandle,
    groupHandle,
    skip
}: {
    userHandle?: string,
    groupHandle?: string | null,
    skip?: boolean
}) {
    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle: userHandle, groupHandle },
        skip: skip || userHandle === "new" || !userHandle
    });

    return {
        user: user_data?.User,
        user_refetch,
        user_loading
    };
}
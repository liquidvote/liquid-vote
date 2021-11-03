import { useQuery, useMutation } from "@apollo/client";

import { USER_REPRESENTED_BY, USER_REPRESENTING } from "@state/User/typeDefs";

export default function useUserRepresentedBy({
    userHandle, groupHandle, representativeHandle
}: {
    userHandle: string, groupHandle: string, representativeHandle?: string
}) {
    const {
        loading: user_represented_by_loading,
        error: user_represented_by_error,
        data: user_represented_by_data,
        refetch: user_represented_by_refetch
    } = useQuery(USER_REPRESENTED_BY, {
        variables: {
            handle: userHandle,
            groupHandle,
            representativeHandle
        },
        skip: !userHandle
    });

    return {
        representatives: user_represented_by_data?.UserRepresentedBy,
        representatives_refetch: user_represented_by_refetch,
        representatives_loading: user_represented_by_loading
    };
}
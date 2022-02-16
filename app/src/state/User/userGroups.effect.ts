import { useQuery, useMutation } from "@apollo/client";

import { USER_GROUPS } from "@state/User/typeDefs";

export default function useUserGroups({
    userHandle, representative
}: {
    userHandle?: string, representative?: string
}) {
    const {
        loading: userGroups_loading,
        error: userGroups_error,
        data: userGroups_data,
        refetch: userGroups_refetch
    } = useQuery(USER_GROUPS, {
        variables: { handle: userHandle, representative },
        skip: !userHandle
    });
    return {
        userGroups: userGroups_data?.UserGroups,
        userGroups_refetch
    };
}
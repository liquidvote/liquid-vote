import { useQuery } from "@apollo/client";

import { SEARCH_USERS } from "@state/User/typeDefs";

export default function useSearchUsers({
    searchText,
    inGroup,
    resultsOnEmpty
}: {
    searchText: string,
    inGroup?: string,
    resultsOnEmpty?: boolean
}) {
    const {
        loading: searchUsers_loading,
        error: searchUsers_error,
        data: searchUsers_data,
        refetch: searchUsers_refetch
    } = useQuery(SEARCH_USERS, {
        variables: {
            text: searchText,
            ...inGroup && { inGroup }
        },
        skip: !resultsOnEmpty && !searchText
    });

    return {
        searchUsers: searchUsers_data?.SearchUsers
    };
}
import { GROUP, EDIT_GROUP } from "@state/Group/typeDefs";
import { useQuery, useMutation } from "@apollo/client";

export default function useGroup({ handle }: { handle?: string }) {
    const {
        loading: group_loading,
        error: group_error,
        data: group_data,
        refetch: group_refetch
    } = useQuery(GROUP, {
        variables: { handle },
        skip: handle === "new" || !handle
    });

    const [editGroup, {
        loading: editGroup_loading,
        error: editGroup_error,
        data: editGroup_data,
    }] = useMutation(EDIT_GROUP, {
        update: cache => {
            // cache.evict({
            //     id: 'ROOT_QUERY',
            //     fieldName: 'UserGroups',
            //     broadcast: false,
            // });
            // cache.evict({
            //     id: "ROOT_QUERY",
            //     fieldName: "Group",
            //     args: { handle }
            // });
            // cache.gc();
        }
    });

    return {
        group: group_data?.Group,
        group_refetch,
        editGroup,
        editedGroup: editGroup_data?.editGroup
    };
}
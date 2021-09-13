import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { useQuery } from "@apollo/client";

export default function useAuthUser() {
    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    return {
        liquidUser: authUser_data?.authUser?.LiquidUser,
        liquidUser_refetch: authUser_refetch,
    };
}
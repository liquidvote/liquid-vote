import { useState, useEffect } from 'react';
import { useLocation, useHistory } from "react-router-dom";

export default function useSearchParams() {
    const location = useLocation();
    const history = useHistory();

    const allSearchParams = Object.fromEntries(new URLSearchParams(location.search)) as {
        theme?: '1' | '2' | '3',
        modal?: 'editProfile' | 'editGroup' | 'editQuestion' | 'listUsers' | 'listGroups',
        modalData?: any,
        refetch?: 'user' | 'group' | 'question',
        inviteId?: string
    };

    const getNewSearchParamsString = ({
        keysToRemove,
        paramsToAdd
    }: {
        keysToRemove?: Array<string>,
        paramsToAdd?: Object
    }) =>
        new URLSearchParams(Object.entries({
            ...allSearchParams,
            ...paramsToAdd
        })
            .filter(([k, v]) => !keysToRemove?.includes(k))
            .reduce((p, [k, v]) => ({ ...p, [k]: v }), {})).toString();

    const updateParams = ({ keysToRemove, paramsToAdd }: {
        keysToRemove?: Array<string>,
        paramsToAdd?: Object
    }) =>
        history.replace({
            pathname: location.pathname,
            search: getNewSearchParamsString({
                keysToRemove,
                paramsToAdd
            }),

        })

    return {
        allSearchParams,
        updateParams
    };
}
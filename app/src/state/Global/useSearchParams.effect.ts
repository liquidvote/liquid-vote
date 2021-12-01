import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from "react-router-dom";

export default function useSearchParams_() {
    const location = useLocation();
    let [searchParams, setSearchParams] = useSearchParams();

    const allSearchParams = Object.fromEntries(new URLSearchParams(location.search)) as {
        theme?: '1' | '2' | '3',
        modal?: 'editProfile' | 'editGroup' | 'editQuestion' | 'listUsers' | 'listGroups',
        modalData?: any,
        refetch?: 'user' | 'group' | 'question' | 'questions',
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
        // history.replace({
        //     pathname: location.pathname,
        //     search: getNewSearchParamsString({
        //         keysToRemove,
        //         paramsToAdd
        //     }),

        // })
        setSearchParams(getNewSearchParamsString({
            keysToRemove,
            paramsToAdd
        }));

    return {
        allSearchParams,
        updateParams
    };
}
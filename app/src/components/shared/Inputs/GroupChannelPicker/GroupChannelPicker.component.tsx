import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import { useQuery, useMutation } from "@apollo/client";
import { GROUP, EDIT_GROUP } from "@state/Group/typeDefs";
import { USER_GROUPS } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";


import GroupSVG from "@shared/Icons/Group-small.svg";

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    label?: string,
    name: string,
    value: any,
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    setValue: any
}

export const GroupChannelPicker: FunctionComponent<Props> = ({
    register,
    label,
    name,
    value,
    type = 'input',
    error,
    disabled,
    autoFocus,
    setValue
}) => {

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const {
        loading: yourGroups_loading,
        error: yourGroups_error,
        data: yourGroups_data,
        refetch: yourGroups_refetch
    } = useQuery(USER_GROUPS, {
        variables: { handle: authUser_data?.authUser?.LiquidUser?.handle },
        skip: !authUser_data?.authUser
    });

    // const {
    //     loading: group_loading,
    //     error: group_error,
    //     data: group_data,
    //     refetch: group_refetch
    // } = useQuery(GROUP, {
    //     variables: { handle: value?.group },
    //     skip: !value?.group
    // });

    // console.log({
    //     yourGroups_data,
    //     group_data,
    //     value
    // });

    const [isFocused, setIsFocused] = useState(false);

    const handleGroupPickChange = (e: any) => {
        setValue(
            name,
            {
                group: e?.target?.value,
                channel: value.channel
            },
            // { shouldValidate: true }
        );
    }

    const handleChannelPickChange = (e: any) => {
        setValue(
            name,
            {
                group: value.group,
                channel: e?.target?.value
            },
            // {
            //     shouldValidate: true
            // }
        );
    }

    return (
        <div className={
            `InputWrapper wrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {label || name}
            </label>
            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">

                <input
                    className="d-none"
                    {...register}
                    name={name}
                    type={'input'}
                // disabled={disabled}
                // autoFocus={autoFocus || false}
                />

                <div className="d-flex justify-content-between m-2">
                    <div className="d-flex align-items-center cursor flex-wrap mt-4 w-100">
                        <div data-tip="Channel to poll in">
                            <GroupSVG />
                        </div>
                        <select
                            className="badge select ml-1 mb-1 mt-1 inverted"
                            onChange={handleGroupPickChange}
                            value={value?.group}
                            onBlur={() => setIsFocused(false)}
                            onFocus={() => setIsFocused(true)}
                        >
                            {yourGroups_data?.UserGroups?.map((g: any) => (
                                <option
                                    key={'yourGroups-' + g.name}
                                    value={g.handle}
                                >{g.name}</option>
                            ))}
                            <option value="">--</option>
                        </select>
                        {/* <select
                            className="badge select ml-1 mb-1 mt-1 inverted"
                            onChange={handleChannelPickChange}
                            value={value?.channel}
                            onBlur={() => setIsFocused(false)}
                            onFocus={() => setIsFocused(true)}
                        >
                            {group_data?.Group?.channels.map((g: any) => (
                                <option
                                    key={'c-'+g.name}
                                    value={g.name}
                                >{g.name}</option>
                            ))}
                            <option value="">--</option>
                        </select> */}
                    </div>
                </div>

            </div>
            {error && <div className="error">{(error as any).message}</div>}


            {/* <pre>
                {JSON.stringify(group_data?.Group, null, 2)}
            </pre> */}
        </div>
    );
};

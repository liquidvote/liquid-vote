import React, { FunctionComponent } from 'react';
import { useQuery, useMutation } from "@apollo/client";
import { timeAgo } from '@state/TimeAgo';
import { Link } from "react-router-dom";

import { GROUPS } from "@state/Group/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import Popper from "@shared/Popper";
import { ADMIN_APPROVE_GROUP } from "@state/Group/typeDefs";

import './style.sass';

export const Causes: FunctionComponent<{}> = ({ }) => {

    const { liquidUser } = useAuthUser();

    const {
        loading,
        error,
        data,
        refetch
    } = useQuery(GROUPS, {
        skip: !liquidUser || liquidUser?.admin !== 'total'
    });


    const [adminApproveGroup, {
        loading: adminApproveGroup_loading,
        error: adminApproveGroup_error,
        data: adminApproveGroup_data,
    }] = useMutation(ADMIN_APPROVE_GROUP);

    console.log({ data });

    return (
        <div className='overflow-auto mw-100'>

            <table className="table white">
                <thead>
                    <tr>
                        <th scope="col">Handle</th>
                        <th scope="col">Name</th>
                        <th scope="col">Privacy</th>
                        <th scope="col">Admin Approved</th>
                        <th scope="col">Last Edit</th>
                        <th scope="col">Bio</th>
                        <th scope="col">Created On</th>
                        <th scope="col">External Link</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.Groups?.map(g => (
                        <tr>
                            <th scope="row">
                                <Link to={`/group/${g.handle}`}>
                                    {g.handle}
                                </Link>
                            </th>
                            <td>{g.name}</td>
                            <td>{g.privacy}</td>
                            <td>
                                <button
                                    className={`button_ small ml-2 white`}
                                    onClick={() => {
                                        adminApproveGroup({
                                            variables: {
                                                handle: g.handle,
                                                newStatus: !g.adminApproved
                                            }
                                        }).then(() => refetch())
                                    }}
                                >
                                    {g.adminApproved ? <>✔</> : <>❌</>}
                                </button>
                            </td>
                            <td>
                                <>{timeAgo.format(new Date(Number(g.lastEditOn)))}</>
                            </td>

                            <td>{g.bio}</td>
                            <td>{timeAgo.format(new Date(Number(g.createdOn)))}</td>
                            <td>{g.externalLink}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}


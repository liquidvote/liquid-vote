import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import Avatar from "@components/shared/Avatar";

import './style.sass';

export const VotedExplanation: FunctionComponent<{
    position?: string,
    forWeight?: boolean,
    againstWeight?: boolean,
    representeeVotes?: any,
    representatives?: any,
    user?: any,
    groupHandle?: string,
    when?: string,
}> = ({
    position,
    forWeight,
    againstWeight,
    representeeVotes,
    representatives,
    user,
    groupHandle,
    when
}) => {
        return (
            <div className='d-flex align-items-center'>
                <div className="d-flex align-items-center">
                    {/* {!!user && (
                    <span className="d-flex ml-1">
                        <Link to={`/profile/${user.handle}/cause/${groupHandle}`}>
                            <Avatar
                                person={user}
                                groupHandle={groupHandle}
                                type="tiny"
                            />
                        </Link>
                    </span>
                )} */}
                    <small className="d-inline-block mr-1">

                        {position && position !== "delegated" ? (
                            <>
                                Voted
                                <b className={`white ml-1 ${position?.toLowerCase()}Direct px-1 rounded`}>
                                    {position === 'for' ? 'yay' : position === 'against' ? 'nay' : position}
                                </b>
                            </>
                        ) : null}
                        {position && position === "delegated" ? <>Was</> : null}
                        {(!position && !!user) ? <span className='faded'>Did not vote</span> : null}
                    </small>

                    {position !== "delegated" && !!representeeVotes?.length && (
                        <small className="d-flex align-items-center mr-1">
                            Representing
                            <div className="d-flex ml-2 pl-1 mr-1">
                                {representeeVotes?.map((r: any) => (
                                    <Link
                                        key={`representeeVotes-${r.user.handle}`}
                                        to={`/profile/${r.user.handle}/cause/${groupHandle}`}
                                    >
                                        <Avatar
                                            person={r.user}
                                            groupHandle={groupHandle}
                                            type="tiny"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </small>
                    )}

                    {!!representatives?.length && (
                        <small className="d-flex align-items-center d-inline-block mr-1">
                            Represented by
                            <span className="d-flex ml-2 pl-1">
                                {representatives?.map((r: any, i: number) => (
                                    <Link
                                        key={`representatives-${r?.handle || i}`}
                                        to={`/profile/${r?.handle}/cause/${groupHandle}`}
                                    >
                                        <Avatar
                                            person={r}
                                            groupHandle={groupHandle}
                                            type="tiny"
                                        />
                                    </Link>
                                ))}
                            </span>

                            <div className='ml-2'>
                                <b className="forDirect white px-1 rounded">{forWeight?.toFixed(1)}</b>
                                /
                                <b className="againstDirect white px-1 rounded">{againstWeight?.toFixed(1)}</b>
                            </div>
                        </small>
                    )}
                </div>

                <small className='faded'>{when}</small>
            </div>
        )
    }


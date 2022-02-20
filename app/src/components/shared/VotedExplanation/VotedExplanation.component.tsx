import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import './style.sass';

export const VotedExplanation: FunctionComponent<{
    position?: string,
    representeeVotes?: any,
    representatives?: any,
    user?: any,
}> = ({
    position,
    representeeVotes,
    representatives,
    user
}) => {
        return position !== "delegated" ? (
            <div className="d-flex align-items-center">
                {!!user && (
                    <span className="d-flex ml-1">
                        <Link
                            to={`/profile/${user.handle}`}
                            className={`vote-avatar none tiny ml-n2`}
                            style={{
                                background: `url(${user.avatar}) 50% 50% / cover no-repeat`
                            }}
                            title={user.name}
                        ></Link>
                    </span>
                )}
                <small className="d-inline-block mr-1">
                    Voted
                    <b className={`white ml-1 ${position?.toLowerCase()}Direct px-1 rounded`}>
                        {position}
                    </b>
                </small>

                {!!representeeVotes.length && (
                    <small className="d-flex align-items-center mr-1">
                        Representing
                        <div className="d-flex ml-2 pl-1 mr-1">
                            {representeeVotes?.map((r: any) => (
                                <Link
                                    key={`representeeVotes-${r.user.handle}`}
                                    to={`/profile/${r.user.handle}`}
                                    className={`vote-avatar none tiny ml-n2`}
                                    style={{
                                        background: `url(${r.user.avatar}) 50% 50% / cover no-repeat`
                                    }}
                                    title={r.user.name}
                                ></Link>
                            ))}
                        </div>
                    </small>
                )}

                {!!representatives.length && (
                    <small className="d-flex align-items-center d-inline-block mr-1">
                        Represented by
                        <span className="d-flex ml-2 pl-1">
                            {representatives?.map((r: any, i: number) => (
                                <Link
                                    key={`representatives-${r?.representativeHandle || i}`}
                                    to={`/profile/${r?.representativeHandle}`}
                                    className={`vote-avatar tiny ${position} ml-n2`}
                                    style={{
                                        background: `url(${r?.representativeAvatar}) 50% 50% / cover no-repeat`
                                    }}
                                    title={r?.representativeName}
                                ></Link>
                            ))}
                        </span>
                    </small>
                )}
            </div>
        ) : null;
    }


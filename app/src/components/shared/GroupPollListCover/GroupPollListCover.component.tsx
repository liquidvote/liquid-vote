import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import GroupVisibilityPicker from '@components/shared/GroupVisibilityPicker';

import './style.sass';

export const GroupPollListCover: FunctionComponent<{ group: any }> = ({ group }) => {

    return (
        <>
            <div className="sticky-top">
                {/* <div className="poll-cover-container">
                    <div
                        className="poll-cover"
                        style={{
                            background: group?.cover && `url(${group?.cover}) 50% 50% / cover no-repeat`
                        }}
                    />
                    <div className="poll-cover-overlay">
                    </div>
                    <div className="poll-cover-info">
                        <Link to={`/group/${group?.handle}`}>
                            <h5 className="white p-0 m-0">
                                {group?.name}
                            </h5>
                        </Link>
                    </div>
                </div> */}

                <div className="poll-cover-container">
                    <div
                        className="poll-cover"
                        style={{
                            background: group?.cover && `url(${group?.cover}) 50% 50% / cover no-repeat`
                        }}
                    />
                    <div className="poll-cover-overlay">
                    </div>
                    <div className="poll-cover-info">
                        <div className="flex-fill py-2">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center pt-1">
                                        <div className="d-flex align-items-center">
                                            <Link to={`/group/${group.handle}`} className="mr-2">
                                                <h5 className="white p-0 m-0">{group.name}</h5>
                                            </Link>
                                        </div>
                                        {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                                        {/* <div className="ml-2 mt-n1">
                                                {group?.privacy === "private" ? (
                                                    <LockSVG />
                                                ) : group?.privacy === "public" ? (
                                                    <WorldSVG />
                                                ) : <LinkSVG />}
                                            </div> */}
                                    </div>
                                </div>
                                <GroupVisibilityPicker
                                    group={group}
                                />
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
}


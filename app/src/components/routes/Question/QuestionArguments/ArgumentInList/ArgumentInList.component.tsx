import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { timeAgo } from '@state/TimeAgo';
import GroupSvg from "@shared/Icons/Group.svg";

import './style.sass';

export const ArgumentInList: FunctionComponent<{ a: any }> = ({ a }) => {
    return (
        <>
            <div className="d-flex">
                <Link to={`/profile/${a.user?.handle}`}>
                    <div
                        className={`small-avatar bg`}
                        style={{
                            background: a.user?.avatar && `url(${a.user?.avatar}) 50% 50% / cover no-repeat`
                        }}
                    ></div>
                </Link>
                <div className="flex-fill">
                    <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                        <div className="w-75">
                            <Link to={`/profile/${a.user?.handle}`} className="d-block mb-n1">
                                <b className="mr-1">{a.user?.name}</b>
                            </Link>
                        </div>
                        <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                            <small className="text-right" data-tip="Voted on">
                                {timeAgo.format(new Date(Number(a?.lastEditOn)))}
                            </small>
                            {/* <div className="d-flex flex-wrap justify-content-end">
                                <div className="tiny-svg-wrapper"><GroupSvg /></div>
                                <Link
                                    to={`/group/${a.group?.handle}`}
                                    className="badge ml-1 mb-1 mt-1"
                                >
                                    {a.group?.name}
                                </Link>
                            </div> */}
                        </div>
                    </div>
                    <p className="mt-1 mb-0 white">
                        {a.argumentText}
                    </p>
                </div>
            </div>

            {/* <p className="mt-1 mb-0">
                {a.argumentText}
            </p> */}
            <hr />
        </>
    );
}


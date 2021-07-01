import React, { FunctionComponent, useMemo } from 'react';
import { Link } from "react-router-dom";

import Notification from '@shared/Notification';
import { VoteTimeline } from "@state/Mock/Notifications";

import './style.sass';

export const ProfileVotes: FunctionComponent<{ handle: string }> = ({ handle }) => {
    return (
        <>
            <ul className="nav d-flex justify-content-around mt-n3 mb-3 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link`} to={`/profile/${handle}/votes`}>
                        <b className="white forDirect px-1 rounded" >3</b> Same
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link`} to={`/profile/${handle}/votes`}>
                        <b className="white againstDirect px-1 rounded" >13</b> Different
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link active`} to={`/profile/${handle}/votes`}>
                        <b className="white forDirect px-1 rounded" >28</b> Other
                    </Link>
                </li>
            </ul>

            {/* <small>
                Voted the same as you in
                    {' '}<b className="white forDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                {' '}polls and different in
                    {' '}<b className="white againstDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
            </small> */}
            {VoteTimeline.map((l, i) => (
                <Notification key={l.poll+i} v={{
                    ...l,
                    who: {
                        name: "Dan Price",
                        avatarClass: 1,
                        representing: 12000,
                        representsYou: true,
                    }
                }} showChart={true} />
            ))}
        </>
    );
}


import React, { FunctionComponent, useMemo } from 'react';
import { Link } from "react-router-dom";

import GroupSmallSvg from "@shared/Icons/Group-small.svg";

import './style.sass';

export const PersonInList: FunctionComponent<{ person: any }> = ({ person }) => {

    const [isRepresenting, setIsRepresenting] = React.useState(false);

    return (
        <div className="d-flex relative border-bottom py-2">
            <Link to="/profile">
                <div
                    className="small-avatar bg"
                    style={{
                        background: person.avatar && `url(${person.avatar}) 50% 50% / cover no-repeat`
                    }}
                ></div>
            </Link>
            <div className="flex-fill">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <Link to={`/profile/${person.handle}`} className="d-flex flex-column mb-1">
                        <b>{person.name}</b>
                        <small className="mt-n1">@{person.handle}</small>
                    </Link>
                    {/* <div className="d-flex mb-1 ml-n1">
                        <div
                            // onClick={() => setIsRepresenting(!isRepresenting)}
                            className={`button_ small mb-0`}
                        >
                            Invite to Group 🧪
                        </div>
                        <div
                            onClick={() => setIsRepresenting(!isRepresenting)}
                            className={`button_ small mb-0 ml-1 ${isRepresenting ? "selected" : ""}`}
                        >
                            {isRepresenting ? "Represents You" : "Delegate Votes To"} (TODO)
                        </div>
                    </div> */}
                </div>
                <small className="d-flex mb-0">
                    {person.bio}
                </small>
                {!!person.representationGroups && (
                    <div
                        className="d-flex flex-wrap justify-content-start"
                    >
                        <div>
                            on:{' '}
                        </div>
                        {person.representationGroups?.map((el: any, i: any) => (
                            <Link
                                to={`/group/${el.handle}`}
                                key={'s-' + el.name}
                                className={`badge inverted ml-1 mb-1 mt-1`}
                            >{el.name}</Link>
                        ))}
                    </div>

                )}
                <small>
                    Voted the same as you in
                    {' '}<b className="white forDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                    {' '}polls and different in
                    {' '}<b className="white againstDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                    {' '}🧪
                </small>
            </div>
        </div>
    );
}


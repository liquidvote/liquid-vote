import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";

import Avatar from '@components/shared/Avatar';
import GroupInProfileListVotes from "@shared/GroupInProfileListVotes";

import './style.sass';

export const PersonInList: FunctionComponent<{
    person: any,
    groupHandle?: string,
    isShowingRepresentativeRelation?: boolean
}> = ({
    person,
    groupHandle,
    isShowingRepresentativeRelation
}) => {

    const [showVotes, setShowVotes] = useState(false);

    return (
        <div className="d-flex relative border-bottom py-2 mb-2">
            <Link to={`/profile/${person.handle}`}>
                <Avatar person={person} type="small" groupHandle={groupHandle} />
            </Link>
            <div className="flex-fill">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <Link to={`/profile/${person.handle}`} className="d-flex flex-column mb-1">
                        <b className="white">{person.name}</b>
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

                {!isShowingRepresentativeRelation ? (
                    <div className="d-flex mb-n1">
                        <small className="d-flex mb-0">
                            <b className='white mr-1'>{' '}{person?.stats?.directVotesMade || 0}</b> votes
                        </small>
                    </div>
                ) : null}

                {!!person?.stats?.directVotesMade && (
                    <small className='white'>
                        <a className='link white pointer' onClick={() => setShowVotes(!showVotes)}>{showVotes ? 'hide' : 'show'} votes</a>
                    </small>
                )}

                {showVotes && (
                    <GroupInProfileListVotes
                        userHandle={person.handle}
                        groupHandle={groupHandle}
                        // subsection={null}
                        // subsubsection={null}
                    />
                )}

                {/* <pre>{JSON.stringify(person, null, 2)}</pre> */}
                {(isShowingRepresentativeRelation && !!person.representationGroups) ? (
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

                ) : null}
                {/*
                <small>
                    Voted the same as you in
                    {' '}<b className="white forDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                    {' '}polls and different in
                    {' '}<b className="white againstDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                    {' '}🧪
                </small> */}
                {/* <pre>{JSON.stringify({
                    yourStats: person.yourStats,
                    'stats.directVotesMade': person.stats?.directVotesMade,
                }, null, 2)}</pre> */}

            </div>
        </div >
    );
}


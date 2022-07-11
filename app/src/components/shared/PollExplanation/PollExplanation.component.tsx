import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import Avatar from '@components/shared/Avatar';

import './style.sass';

export const PollExplanation: FunctionComponent<{ p: any }> = ({ p }) => {

    const usersToShow = [
        ...p?.yourStats?.votersYouFollow || []
    ]

    return usersToShow.length ?(
        <>
            <div className='d-flex align-items-center mt-3 mb-1'>
                {/* <div className="d-flex ml-1 mr-2">
                    {usersToShow?.slice(0, 3).map((v: any) => (
                        <div key={`pollExpalanation_avatar-${p?.questionText}-${p?.group?.handle}-${v.handle}`} className="ml-n1">
                            <Avatar
                                person={v}
                                groupHandle={p?.group?.handle}
                                type={'tiny'}
                            />
                        </div>
                    ))}
                </div> */}

                <small className='ml-0'>
                    {usersToShow.slice(0, 3).map((m: any, i) => (
                        <>
                            {' '}
                            <Link
                                key={`pollExpalanation_avatar-${p?.questionText}-${p?.group?.handle}-${m.handle}`}
                                to={`/profile/${m.handle}/cause/${p.group.handle}`}
                                title={`${m.name}`}
                            >{m.name}</Link>
                            {(i + 2) < p?.yourStats?.votersYouFollowCount ? ", " : ""}
                            {(i + 2) === p?.yourStats?.votersYouFollowCount ? " and " : ""}
                            {i === 2 && p?.yourStats?.votersYouFollowCount > 3 ? ` and ${p?.yourStats?.votersYouFollowCount - 3} other you follow ` : "" }
                        </>
                    ))}
                    {' '}
                    voted
                </small>


            </div>
        </>
    ): null;
}


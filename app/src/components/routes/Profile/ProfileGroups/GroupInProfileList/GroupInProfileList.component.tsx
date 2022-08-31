import React, { FunctionComponent, useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import env from '@env';
import useAuthUser from '@state/AuthUser/authUser.effect';
import LockSVG from "@shared/Icons/Lock-tiny.svg";
import ProfileSVG from "@shared/Icons/Profile-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
import GroupTiny from "@shared/Icons/Group-tiny.svg";
import LinkSVG from "@shared/Icons/Link-tiny.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";
import Avatar from '@components/shared/Avatar';
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";
import GroupInProfileListVotes from "@shared/GroupInProfileListVotes";
import useUser from '@state/User/user.effect';
import HandshakeSVG from "@shared/Icons/Handshake.svg";
import GroupVisibilityPicker from '@components/shared/GroupVisibilityPicker';
import GroupPollListCover from "@shared/GroupPollListCover";

import './style.sass';

export const GroupInProfileList: FunctionComponent<{
    group: any,
    alternativeButton?: any,
    user: any,
    isSelected: boolean
}> = ({
    group,
    alternativeButton,
    user,
    isSelected
}) => {

        let { section, subsection, subsubsection, handle, inviterHandle } = useParams<any>();

        const { liquidUser } = useAuthUser();

        const { user: userWithMoreData } = useUser({ userHandle: user.handle, groupHandle: group.handle });

        const [showVotes, setShowVotes] = useState(false);

        console.log({ user, userWithMoreData });

        const [editGroupMemberChannelRelation, {
            loading: editGroupMemberChannelRelation_loading,
            error: editGroupMemberChannelRelation_error,
            data: editGroupMemberChannelRelation_data,
        }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

        const [editUserRepresentativeGroupRelation, {
            loading: editUserRepresentativeGroupRelation_loading,
            error: editUserRepresentativeGroupRelation_error,
            data: editUserRepresentativeGroupRelation_data,
        }] = useMutation(EDIT_USER_REPRESENTATIVE_GROUP_RELATION);

        const { allSearchParams, updateParams } = useSearchParams();

        useEffect(() => {
            if (isSelected && !showVotes) {
                // document?.getElementById?.(group.handle)?.scrollIntoView({ behavior: 'smooth' });
                setShowVotes(true);
            }
        }, [isSelected]);

        const isMember =
            group?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember;

        return (
            <>
                <GroupPollListCover
                    group={group}
                />
                <div id={group.handle} className="relative border-bottom pb-3 mx-n3 px-3">
                    <div>
                        <div className='d-flex align-items-stretch mt-3 pb-3 mx-n1'>
                            <Link
                                replace
                                className="position-relative mt-n1 ml-3"
                                to={isSelected ? `/profile/${user.handle}/groups` : `/profile/${user.handle}/cause/${group.handle}`}
                            >
                                <Avatar
                                    person={{
                                        ...user,
                                        // yourStats: userWithMoreData.yourUserStats,
                                        // stats: userWithMoreData.userStats
                                    }}
                                    groupHandle={group?.handle}
                                    type="small"
                                />
                            </Link>
                            <div className='d-flex align-items-center'>
                                <div className='d-flex flex-column'>
                                    <Link
                                        replace
                                        className="d-flex flex-column text-decoration-none"
                                        to={isSelected ? `/profile/${user.handle}/groups` : `/profile/${user.handle}/cause/${group.handle}`}
                                    >
                                        {
                                            (userWithMoreData?.groupStats?.stats?.representedBy || userWithMoreData?.groupStats?.stats?.representing) ?
                                                <div className='d-flex align-items-center mb-1'>

                                                    <small className='primary-color d-flex'>
                                                        <>
                                                            {/* <div className="mr-1"><HandshakeSVG /></div> */}
                                                            <div className="d-flex flex-column">
                                                                <div className="d-flex flex-wrap">
                                                                    {userWithMoreData?.groupStats?.stats?.representedBy ? (
                                                                        <>

                                                                            <Link to={`/profile-people/${user.handle}/representedBy`} className="mr-1">
                                                                                represents{' '}<b className="white mr-1">{userWithMoreData?.groupStats?.stats?.representedBy}</b>
                                                                            </Link>
                                                                        </>
                                                                    ) : null}
                                                                    {/* {userWithMoreData?.groupStats?.stats?.representing ? (
                                                                        <>
                                                                            ・
                                                                            <Link to={`/profile-people/${user.handle}/representing`}>
                                                                                is represented by{' '}<b className="white ml-1">{userWithMoreData?.groupStats?.stats?.representing}</b>
                                                                            </Link>
                                                                        </>
                                                                    ) : null} */}
                                                                </div>
                                                            </div>
                                                        </>
                                                        {/* {group.representativeRelation?.isRepresentingYou && !group.youToHimRepresentativeRelation?.isRepresentingYou ? "represents you" : ""}
                                                        {!group.representativeRelation?.isRepresentingYou && group.youToHimRepresentativeRelation?.isRepresentingYou ? "represented by you" : ""}
                                                        {group.representativeRelation?.isRepresentingYou && group.youToHimRepresentativeRelation?.isRepresentingYou ? "you represent each other" : ""} */}
                                                    </small>

                                                    <div
                                                        className={`
                                                            d-flex align-items-center ${(group.youToHimRepresentativeRelation?.isRepresentingYou ||
                                                                group.representativeRelation?.isRepresentingYou
                                                            ) ? '' : 'd-none'}
                                                        `}
                                                    >
                                                        {group.representativeRelation?.isRepresentingYou &&
                                                            !group.youToHimRepresentativeRelation?.isRepresentingYou ?
                                                            (
                                                                <small
                                                                    className="badge inverted"
                                                                >represents you</small>
                                                            ) : ""}
                                                        {group.youToHimRepresentativeRelation?.isRepresentingYou &&
                                                            !group.representativeRelation?.isRepresentingYou ?
                                                            (
                                                                <small
                                                                    className="badge inverted"
                                                                >you represent him</small>
                                                            ) : ""}
                                                        {
                                                            group.youToHimRepresentativeRelation?.isRepresentingYou &&
                                                                group.representativeRelation?.isRepresentingYou ?
                                                                (
                                                                    <small
                                                                        className="badge inverted no-max-w"
                                                                    >you represent each other 🤝</small>
                                                                ) : ""
                                                        }
                                                    </div>
                                                </div>
                                                :
                                                <></>
                                        }

                                        <div className="d-flex align-items-center">
                                            <small className={`d-flex`}>
                                                <b className='white'>
                                                    {' '}{group?.userStats?.directVotesMade} votes
                                                    {/* {' '} */}
                                                    {/* {isSelected ? '⬆' : '⬇'} */}
                                                </b>
                                            </small>
                                            {!!userWithMoreData?.groupStats?.yourStats?.directVotesInCommon ? (
                                                <>
                                                    {/* ・
                                                    <small className="d-flex mb-0">
                                                        <b className='white mr-1'>{' '}{userWithMoreData?.groupStats?.yourStats?.directVotesInCommon}</b> in common
                                                    </small> */}
                                                    ・
                                                    <small className="d-flex align-items-center">
                                                        <b className='white mr-1 forDirect px-1 rounded'>{' '}{userWithMoreData?.groupStats?.yourStats?.directVotesInAgreement} </b> same
                                                    </small>
                                                    ・
                                                    <small className="d-flex align-items-center">
                                                        <b className='white mr-1 againstDirect px-1 rounded'>{' '}{userWithMoreData?.groupStats?.yourStats?.directVotesInDisagreement}</b> differ
                                                    </small>
                                                </>
                                            ) : <span className='opacity-0'>・</span>}
                                        </div>

                                    </Link>
                                </div>
                            </div>
                            {group?.allowRepresentation || liquidUser?.handle === user.handle ? (
                                <div className='d-flex align-items-center ml-auto'>
                                    <Popper
                                        rightOnSmall={true}
                                        button={
                                            <div>
                                                <ThreeDotsSmallSVG />
                                            </div>
                                        }
                                        oulineInstead={true}
                                        popperContent={
                                            <ul className="p-0 m-0 mx-2">

                                                {group?.allowRepresentation ? (
                                                    <li className="d-flex justify-content-center mb-2">
                                                        <button
                                                            onClick={
                                                                () => editUserRepresentativeGroupRelation({
                                                                    variables: {
                                                                        RepresenteeHandle: liquidUser?.handle,
                                                                        RepresentativeHandle: user?.handle,
                                                                        Group: group.handle,
                                                                        IsRepresentingYou: !group.representativeRelation?.isRepresentingYou
                                                                    }
                                                                })
                                                                    .then((r) => {
                                                                        // userGroups_refetch();
                                                                        updateParams({ paramsToAdd: { refetch: 'user' } })
                                                                    })
                                                            }
                                                            className={`
                                                                                button_ small ml-1 mb-0
                                                                                ${group.representativeRelation?.isRepresentingYou ? 'selected' : null}
                                                                            `}
                                                            disabled={!group.yourMemberRelation?.isMember}
                                                        >
                                                            {
                                                                group.representativeRelation?.isRepresentingYou ?
                                                                    `Represents you on ${group?.name}` :
                                                                    `Delegate your votes on ${group?.name} to ${user?.name}`
                                                            }
                                                        </button>
                                                    </li>
                                                ) : null}
                                                {liquidUser?.handle === user.handle && (
                                                    <li className="d-flex mt-2 justify-content-center">
                                                        <div
                                                            className="button_ small ml-2"
                                                            onClick={async () => {
                                                                updateParams({
                                                                    paramsToAdd: {
                                                                        modal: "InviteFor",
                                                                        modalData: JSON.stringify({
                                                                            InviteType: 'toGroup',
                                                                            groupHandle: group.handle,
                                                                            groupName: group.name
                                                                        })
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            Invite
                                                        </div>
                                                    </li>
                                                )}
                                            </ul>
                                        }
                                    />
                                </div>
                            ) : null}
                        </div>

                        {/* <pre>{JSON.stringify(group, null, 2)}</pre> */}
                        {/* <pre>{JSON.stringify(group.yourUserStats, null, 2)}</pre>
                        stats */}
                    </div>

                    {!showVotes && (
                        <div className='d-flex align-items-center justify-content-center mb-4 mt-2'>
                            <Link
                                replace
                                className="d-flex flex-column text-decoration-none"
                                to={isSelected ? `/profile/${user.handle}/groups` : `/profile/${user.handle}/cause/${group.handle}`}
                            >
                                <a className='button_ inverted small pointer'>show votes</a>
                            </Link>
                        </div>
                    )}

                    {showVotes && (
                        <GroupInProfileListVotes
                            userHandle={handle}
                            groupHandle={group.handle}
                            subsection={subsection}
                            subsubsection={subsubsection}
                            inviterHandle={inviterHandle}
                        />
                    )}
                </div>
            </>
        );
    }


import * as React from "react";
import { Link, useParams } from "react-router-dom";

import BackArrowSVG from "@shared/Icons/BackArrow.svg";
import LinkSVG from "@shared/Icons/Link.svg";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import LocationSVG from "@shared/Icons/Location.svg";
import AddNotificationSVG from "@shared/Icons/AddNotification.svg";
import DropSVG from "@shared/Icons/Drop.svg";
import Header from "@shared/Header";
import VoteGraph1 from "@shared/VoteGraph1";
import { profileVotes } from "@state/Mock/Votes";
import VoteWrapper from "@shared/VoteWrapper";
import { VoteTimeline } from "@state/Mock/Notifications";
import Notification from '@shared/Notification';
import GroupInList from "@shared/GroupInList";
import { groups } from "@state/Mock/Groups";

import './style.sass';

export default function Profile() {

    let { profileName, section } = useParams<any>();

    const [isRepresenting, setIsRepresenting] = React.useState(false);

    return (
        <>
            <Header title="Dan Price" />

            <div className="profile-top">
                <div className="cover" />
                <div className="profile-avatar bg"></div>
                <div className="profile-buttons-container">
                    {/* <div className="button_">
                        <AddNotificationSVG />
                    </div> */}
                    <div
                        onClick={() => setIsRepresenting(!isRepresenting)}
                        className={`button_ ${isRepresenting ? "selected" : ""}`}
                    >
                        {isRepresenting ? "Represents You" : "Delegate Votes To"}
                    </div>
                </div>
            </div>
            <h2 className="profile-name">Dan Price</h2>
            <p className="profile-handle">@DanPriceSeattle</p>
            <div className="profile-description">
                I cut my CEO pay by a million dollars so all workers could make at
                least $70,000 per year. <br />
                <br />
                Author of WORTH IT - buy it for your boss from a small bookstore
            </div>
            <div className="profile-icons-container d-flex">
                <div>
                    <LocationSVG />
                    <div>Seattle, WA</div>
                </div>
                <div>
                    <LinkSVG />
                    <a
                        href="//instagram.com/danpriceseattle"
                        target="_blank"
                        rel="noreferrer"
                    >
                        instagram.com/danpriceseattle
                    </a>
                </div>
                <div>
                    <CalendarSVG />
                    <div>Joined November 2013</div>
                </div>
            </div>
            <div className="profile-stats-container">
                <Link to="/profile-people/representing">
                    <b>1,063</b> Representing Dan
                </Link>
                <Link to="/profile-people/represented" className="ml-2">
                    <b>229.1K</b> Represented by Dan
                </Link>
            </div>

            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'votes') && 'active'}`} to={`/profile/${profileName}/votes`}>
                        <b>263</b> Votes
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className={`nav-link ${section === 'members' && 'active'}`} to={`/profile/${profileName}/members`}>
                        <b>1.3K</b> Members
                    </Link>
                </li> */}
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'groups' && 'active'}`} to={`/profile/${profileName}/groups`}>
                        <b>16</b> Groups
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className={`nav-link ${section === 'timeline' && 'active'}`} to={`/profile/${profileName}/timeline`}>
                        Timeline
                    </Link>
                </li> */}
            </ul>

            <hr />

            {/* <h3>{section}</h3> */}

            {(!section || section === 'votes') && VoteTimeline.map((l, i) => (
                <Notification v={{
                    ...l,
                    who: {
                        name: "Dan Price",
                        avatarClass: 1,
                        representing: 12000,
                        representsYou: true,
                    },
                }} showChart={true} />
            ))}

            {(section === 'groups') && groups.map((el, i) => (
                <GroupInList group={el} />
            ))}


            {/* <div>
                {profileVotes.map((l, i) => (
                    <VoteWrapper l={l} />
                ))}
            </div> */}
        </>
    );
}

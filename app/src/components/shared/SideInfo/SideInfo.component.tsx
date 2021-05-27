import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import {
    voteList
} from "@state/Mock/Votes";
import SearchSVG from "@shared/Icons/Search.svg";

import './style.sass';
import SideVote from "@shared/SideVote";


export const SideInfo: FunctionComponent<{}> = ({ }) => {
    return (
        <>
            <div className="d-flex flex-column">
                <div className="d-none d-md-block">
                    <div className="searchWrapper">
                        <SearchSVG />
                    </div>
                </div>
                <div className="sideInfo d-none d-md-block">
                    <h3>Trending</h3>

                    {[
                        // { name: "[Work Group]" },
                        // { name: "[Side Project Group]" },
                        // { name: "Nearby" },
                        { name: "Your Representatives" },
                        // { name: "People you Follow" },
                        // { name: "[Your Age Group]" },
                        // { name: "[Your Occupation]" },
                        // { name: "People who also voted ['For'] on ['Something']" },
                    ].map(({ name }, i) => (
                        <div>

                            <Link className="d-flex mt-4 mb-2" to={`/grouping/group/${name}`}>
                                {name}
                            </Link>

                            <div className="sideInfoSection">

                                <div className="bar-container-horizontal">
                                    {[
                                        ...voteList,
                                        ...voteList,
                                        ...voteList,
                                        ...voteList
                                    ].filter((_, i_) => i_ > i).filter((_, i_) => i_ < 3).map((l, i_) => (
                                        <SideVote
                                            l={l}
                                            i={i_}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}


import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import Header from "@shared/Header";
import { VoteTimeline } from "@state/Mock/Notifications";
import { defaults } from "@state/Mock/Votes";

import Notification from '@shared/Notification';
import DropAnimation from '@components/shared/DropAnimation';
import './style.sass';

export const Feed: FunctionComponent<{}> = ({ }) => {
    return (
        <>
            <Header title="Notifications" />

            <div className="p-4 text-center">
                🧪 Expect great things here soon
            </div>

            {/* <div className="d-flex justify-content-center mt-5">
                <DropAnimation />
            </div> */}


            {/* {VoteTimeline.map((l, i) => (
                <Notification v={{ ...defaults, ...l }} showChart={true} />
            ))} */}
        </>
    );
}


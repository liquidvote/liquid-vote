import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import Header from "@shared/Header";
import { VoteTimeline } from "@state/Mock/Notifications";
import { defaults } from "@state/Mock/Votes";

import Notification from '@shared/Notification';
import './style.sass';

export const Feed: FunctionComponent<{}> = ({ }) => {
    return (
        <>
            <Header title="Notifications" />

            <br />

            {VoteTimeline.map((l, i) => (
                <Notification v={{ ...defaults, ...l }} showChart={true} />
            ))}
        </>
    );
}


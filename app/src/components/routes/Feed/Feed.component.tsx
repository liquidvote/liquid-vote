import React, { FunctionComponent } from 'react';

import Header from "@shared/Header";

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


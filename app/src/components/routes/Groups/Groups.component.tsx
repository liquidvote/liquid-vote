import React, { FunctionComponent } from 'react';

import Header from "@shared/Header";
import GroupInList from "@shared/GroupInList";
import { groups } from "@state/Mock/Groups";

import './style.sass';

export const Groups: FunctionComponent<{}> = ({ }) => {
    return (
        <>
            <Header title="Your Groups" />

            <div>
                {groups.map((el, i) => (
                    <GroupInList group={el} />
                ))}
            </div>
        </>
    );
}


import React, { FunctionComponent } from 'react';

import VoteWrapper from "@shared/VoteWrapper";

import './style.sass';

export const Home: FunctionComponent<{}> = ({ }) => {
    return (
        <>
            {/* <Header title="Home" /> */}
            <br />
            <br />

            <h2>Welcome to <b className="white">Liquid Vote</b></h2>

            <p>The place for liquid voting.</p>

            <br />

            <h4>What is liquid voting?</h4>
            <p>
                A form of voting where you express your views by voting directly,
                or by delegating to people you trust to represent you.
            </p>

            <br />

            <h4>How do votes get delegated?</h4>
            <p>
                If you vote on an poll, your vote's weight is 100% on your choice,
                even when you have representatives.
                <br/>
                But when not voting, your vote's weight gets delegated to your representatives.
                Or to their representatives, if they themselves do not vote either.
            </p>

            <br />

            <div className="bar-container-horizontal">
                <VoteWrapper
                    l={{
                        name: 'Liquid Voting is Cool',
                        // showNameInside,
                        forDirectCount: 12000,
                        forCount: 35700,
                        againstDirectCount: 1430,
                        againstCount: 4500,
                        // forPercentageOnOther = null,
                        // userVote = null,
                        // userDelegatedVotes = null,
                        // group = null,
                        // showQuestionMarkInName = false
                        showQuestionMarkInName: true
                    }}
                    // i={0}
                    showIntroMessage={true}
                    introMessage="Do you Believe"
                    showColorLegend={true}
                />
            </div>
        </>
    );
}


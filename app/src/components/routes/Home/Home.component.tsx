import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";

import VoteWrapper from "@shared/VoteWrapper";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const Home: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();

    return (
        <>
            {/* <Header title="Home" /> */}
            <br />
            <br />

            <h2>Welcome to <b className="white">Liquid Vote</b></h2>

            <p>The place for scaleable and organic opinion tracing.</p>

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
                <br />
                But when not voting, your vote's weight gets delegated to your representatives.
                Or to their representatives, if they themselves do not vote either.
            </p>

            <br />

            <div className="bar-container-horizontal">
                <VoteWrapper
                    l={{
                        questionText: 'Liquid Voting is Cool',
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

            <br />

            <h4 className="mb-2 mt-3">Get started!</h4>
            <div className="d-flex">
                <div
                    className="button_ mr-3"
                    onClick={() => updateParams({
                        paramsToAdd: {
                            modal: 'EditGroup',
                            modalData: JSON.stringify({ groupHandle: 'new' })
                        }
                    })}
                >Create a Group</div>
                <Link
                    className="button_ mr-3"
                    to={`/groups`}
                >Explore Groups</Link>
                <a
                    className="button_ mr-3"
                    // Edit with this tool: https://mailto.vercel.app
                    href={`mailto:hello@liquid-vote.com?subject=I'd%20like%20to%20book%20a%20demo&body=Hi%20Pedro%2C%0AI'm%20free%20for%2030%20minutes%2C%20tomorrow%2C%2016pm%20London%20time%2C%20does%20that%20work%20for%20you%3F%0A%0ABest%20regards%2C%0AA%20curious%20person`}
                    target="_blank"
                >Request a Demo</a>
            </div>

            <br />
            <br />

            <hr />

            <ul className="d-flex">
                <li className="mr-3">
                    <Link to="//twitter.com/liquid_vote" target="_blank">Twitter</Link>
                </li>
                <li className="mr-3">
                    <Link to="//discord.gg/vbC5dJHZ" target="_blank">Discord</Link>
                </li>
                <li className="mr-3">
                    <Link to="//www.linkedin.com/company/liquid-vote/" target="_blank">LinkedIn</Link>
                </li>
            </ul>

            <br />
        </>
    );
}


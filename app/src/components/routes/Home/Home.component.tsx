import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";

import VoteWrapper from "@shared/VoteWrapper";
import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import Drop from "@shared/Icons/Drop.svg";

import './style.sass';

export const Home: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();

    return (
        <>
            {/* <Header title="Home" /> */}
            <br />
            <br />

            <h2>Welcome to <b className="white">Liquid Vote</b></h2>

            <p>The place for opinions</p>

            <br />

            {/* <h4>Who is it for?</h4>
            <p>
                From choosing the theme for a birthday party, to managing large condominiums. <br />
                Liquid Vote helps tiny and large organizations quickly gather a group's opinions.
            </p> */}

            <h3>What can I do here?</h3>

            <p> <Drop /> Learn where you and your friends <b className="forDirect white px-1 rounded">agree</b> and <b className="againstDirect white px-1 rounded">disagree</b>.</p>
            <p> <Drop /> Vote on important Causes.</p>
            <p> <Drop /> Delegate your voting power on specific causes.</p>

            <br />
            <br />

            <h4>Are my votes anonymous?</h4>
            <p>
                No.
                <br />
                But anonymity features are in development.
            </p>

            <br />

            <h4>How do votes get delegated?</h4>
            <p>
                If you vote on an poll, your vote's weight is 100% on your choice,
                even when you have representatives.
                <br />
                But when not voting, your vote's weight gets equally split among your representatives. Or, has no weight on the poll if you have no voting representatives.
            </p>

            {/* <br />

            <h4>Ok ok, but why is this any better than voting on social media?</h4>
            <p>
                This is quicker to gather everyone's input on <b>no matter how many questions</b> you need answered.<br />
                By delegating votes, people instantly add weight to whatever their chosen representatives voted on already.
            </p> */}

            <br />

            <h4>Why shouldn't I use this to directly run my new nation state?</h4>
            <p>
                Hey man, you do you, but: <br />
                1. This is still in early development <br />
                2. Such tools are great for gathering opinions, perhaps not for changing your nation state's laws in real time as people's minds change.
            </p>

            <br />

            <h4>Pricing</h4>
            <p>
                Free forever for 10 years for any active <b>Cause</b> created before we start charging profitable businesses.
            </p>

            <br />

            <h4 className="mb-2 mt-3">Get started!</h4>
            <div className="d-flex">
                <div
                    className="button_ mr-3"
                    onClick={() => !!liquidUser ? updateParams({
                        paramsToAdd: {
                            modal: 'EditGroup',
                            modalData: JSON.stringify({ groupHandle: 'new' })
                        }
                    }) : (
                        updateParams({
                            paramsToAdd: {
                                modal: "RegisterBefore",
                                modalData: JSON.stringify({
                                    toWhat: 'createGroup'
                                })
                            }
                        })
                    )}
                >Launch a Cause</div>
                <Link
                    className="button_ mr-3"
                    to={`/groups${!!liquidUser ? '/other' : ''}`}
                >Explore Causes</Link>
                <Link
                    className="button_ mr-3"
                    to={`/group/lvcritics`}
                >Give us feedback</Link>
                {/* <a
                    className="button_ mr-3"
                    // Edit with this tool: https://mailto.vercel.app
                    href={`mailto:hello@liquid-vote.com?subject=I'd%20like%20to%20book%20a%20demo&body=Hi%20Pedro%2C%0AI'm%20free%20for%2030%20minutes%2C%20tomorrow%2C%2016pm%20London%20time%2C%20does%20that%20work%20for%20you%3F%0A%0ABest%20regards%2C%0AA%20curious%20person`}
                    target="_blank"
                >Request a Demo</a> */}
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
                <li className="ml-auto">
                    <a
                        href={`mailto:hello@liquid-vote.com?subject=I'd%20like%20to%20get%20Free%20Stickers&body=Hi%20Pedro%2C%0A%0AThanks%20for%20the%20free%20stickers!%0A%0AMy%20address%20is%3A%20%5BYour%20Address%5D%0A%0ABest%2C%0AA%20loving%20supporter`}
                        target="_blank"
                    >Get Free Stickers!</a>
                </li>
            </ul>

            <br />
        </>
    );
}


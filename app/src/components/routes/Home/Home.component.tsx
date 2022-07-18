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
            
            <div className='d-flex align-items-center justify-content-between'>
                <p className='m-0 p-2 border-primary border rounded overflow-hidden shadow'>
                    We are in Beta 🧪, help us find bugs 🐛
                </p>
            </div>

            <br />

            {/* <h4>Who is it for?</h4>
            <p>
                From choosing the theme for a birthday party, to managing large condominiums. <br />
                Liquid Vote helps tiny and large organizations quickly gather a group's opinions.
            </p> */}

            <h3>What can I do here?</h3>

            <div className='d-flex pt-3 m mx-n3 text-center flex-column'>
                <div className='d-flex flex-row align-items-center flex-basis-100 px-3'>
                    <div
                        style={{ flex: '1' }}
                        className='d-flex align-items-center mb-4 border-primary border rounded overflow-hidden shadow'
                    >
                        <img style={{ width: '100%' }} src="//images.liquid-vote.com/system/circles.png" />
                    </div>
                    {/* <Drop /><br /><br /> */}
                    <p className='px-3' style={{ flex: '1' }}><b>

                        Learn where you and your friends <b className="forDirect white px-1 rounded">agree</b> and <b className="againstDirect white px-1 rounded">disagree</b>.
                    </b></p>
                </div>
                <div className='d-flex flex-row align-items-center flex-basis-100 px-3'>
                    <div
                        style={{ flex: '1' }}
                        className='d-flex align-items-center mb-4 border-primary border rounded overflow-hidden shadow'
                    >
                        <img style={{ width: '100%' }} src="//images.liquid-vote.com/system/yay_weed.png" />
                    </div>
                    <p className='px-3' style={{ flex: '1' }}><b>
                        {/* <Drop /><br /><br /> */}
                        Vote on important Causes.
                    </b></p>
                </div>
                <div className='d-flex flex-row align-items-center flex-basis-100 px-3'>
                    <div
                        style={{ flex: '1' }}
                        className='d-flex align-items-center mb-4 border-primary border rounded overflow-hidden shadow'
                    >
                        <img style={{ width: '100%' }} src="//images.liquid-vote.com/system/represented_yay.png" />
                    </div>
                    <p className='px-3' style={{ flex: '1' }}><b>
                        {/* <Drop /><br /><br /> */}
                        Delegate your voting power on specific causes.
                    </b></p>
                    {/* <img className='rounded px-3' src="data:image/jpeg;base64,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" /> */}
                </div>
            </div>

            <br />
            <br />

            <h4>Are my votes anonymous?</h4>
            <p>
                Optionally.
            </p>

            <br />

            <h4>What are the circles around User Avatars?</h4>
            <p>Try it and see:</p>
            <div className='d-flex align-items-center justify-content-center'>
                <div className='p-5'>
                    [TODO: Interactive Demo]
                </div>
            </div>

            <br />


            <h4>How do votes get delegated?</h4>
            <p>
                If you vote on an poll, your vote's weight is 100% on your choice,
                even when you have representatives.
                <br />
                But when not voting, your vote's weight gets equally split among your representatives. Or, has no weight on the poll if you have no voting representatives.
            </p>
            <div className='d-flex align-items-center justify-content-center'>
                <div className='p-5'>
                    [TODO: Interactive Demo]
                </div>
            </div>

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

            <h4>Our Mission</h4>
            <p>
                Liquid Vote is a Voting Social Network, aiming at eventually unleashing the power of Liquid Democracy.
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


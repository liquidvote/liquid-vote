import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';
import loadable from '@loadable/component';
import bg from '@assets/bg.jpeg';
import twitterIcon from '@assets/twitter.svg';

export default function App() {
    return (
        <div
            className='cover-holder d-flex justify-content-center align-items-center'
            style={{ background: `url(${bg}) no-repeat center center fixed` }}
        >
            <div className="content-box text-center m-3">
                <div className='row p-5'>
                    <div className='col-12'>
                        <h1>Liquid Vote</h1>
                        <p className="py-3">We are building the future of opinion tracing</p>
                        <div className="d-flex justify-content-center align-items-center">
                            <a
                                className="twitterButton d-flex justify-content-center align-items-center"
                                target="_blank"
                                href="https://twitter.com/liquid_vote"
                            >
                                <img className="img-fluid pr-3" src={twitterIcon} />
                                Follow us for updates
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

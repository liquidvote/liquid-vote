import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { VOTES } from "@state/Vote/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
// import { useFirebaseNotifications } from "@services/firebase";

import DropAnimation from '@components/shared/DropAnimation';
import CogSVG from "@shared/Icons/Cog.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const Notifications: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();
    const { liquidUser } = useAuthUser();


    // console.log({
    //     user_votes_data
    // });

    return (
        <>
            <Header
                title="Notifications"
                rightElement={() => (
                    <div onClick={() => updateParams({
                        paramsToAdd: {
                            modal: "NotificationSettings",
                            // modalData: JSON.stringify({
                            //     questionText,
                            //     choiceText,
                            //     groupHandle,
                            //     subsection: 'total',
                            //     // subsubsection: 'foryou'
                            // })
                        }
                    })} className="pointer">
                        <CogSVG />
                    </div>
                )}
            />

            <p className="text-center py-4">
                🏗 Ignore this for now please
            </p>

            {/* <div className='d-flex justify-content-center'>
                <button className='button_' onClick={getToken_}>allow notifications</button>
            </div> */}

            {/* <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${!section && 'active'}`} to={`/notifications`}>
                        Yours
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'representatives' && 'active'}`} to={`/notifications/representatives`}>
                        Representatives
                    </Link>
                </li>
            </ul> */}




            <br />
            {/* <pre>{ JSON.stringify(user_votes_data, null, 2) }</pre> */}


        </>
    );
}


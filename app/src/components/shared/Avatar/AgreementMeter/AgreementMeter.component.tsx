import React, { FunctionComponent } from 'react';

import './style.sass';

export const AgreementMeter: FunctionComponent<{
    type?: 'profile' | 'small' | 'vote', person?: any
}> = ({
    type = 'small', person
}) => {

        const circlePath = (cx: number, cy: number, r: number) => {
            return (
                `M ${cx} ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`
                // "M "+cx+" "+cy+" m -"+r+", 0 a "+r+","+r+" 0 1,0 "+r * 2+",0 a "+r+","+r+" 0 1,0 -"+r * 2+",0"
            );
        };
        const s = !person?.yourStats?.directVotesInCommon ? 0 : ((
            person?.yourStats?.directVotesInAgreement + 0.1
        ) / (
                person?.yourStats?.directVotesInCommon + 0.1
            )) * 100; //70;
        const nn = person?.stats?.directVotesMade > person?.yourStats?.directVotesInCommon
            ? ((
                person?.stats?.directVotesMade - person?.yourStats?.directVotesInCommon
            ) / person?.stats?.directVotesMade) * 60
            : 0  //0;
        const circle = 280;
        const path = circlePath(75, 75, 45);
        const agreement = circle - ((100 - s) / 100) * circle - 20 - nn;
        const disagreement = circle - agreement - 13 - nn * 3;

        return (
            <div className={`circles ${type}`}>
                {/* {s} - {nn} */}
                <svg viewBox="0 0 150 150">
                    {/* <path className="bg" d={path} fill="none" /> */}
                    {s > 10 && (
                        <path
                            className="agreement for-stroke"
                            d={path}
                            fill="none"
                            style={{
                                strokeDashoffset: `${(s - nn) > 90 ? 0 : circle - agreement}`,
                                transform: `rotate(${45 + agreement / 1.58}deg)`
                            }}
                        />

                    )}
                    {s > 1 && s < 100 && (
                        <path
                            className="disagreement against-stroke"
                            d={path}
                            fill="none"
                            style={{
                                strokeDashoffset: `${(s + nn) < 10 ? 0 : circle - disagreement}`,
                                transform: `rotate(${225 + disagreement / 1.58}deg)`
                            }}
                        />
                    )}
                </svg>
            </div>
        );
    }


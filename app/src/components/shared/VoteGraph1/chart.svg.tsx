import * as React from "react";
import { useHistory } from "react-router-dom";
import numeral from 'numeral';

import './style.sass';

export default function Chart({
    name,
    showNameInside,
    forDirectCount,
    forCount,
    againstDirectCount,
    againstCount,
    userVote = null,
    userDelegatedVotes = null
}: {
    name: string | null,
    showNameInside?: boolean,
    forDirectCount: number,
    forCount: number,
    againstDirectCount: number
    againstCount: number,
    userVote: boolean | null,
    userDelegatedVotes:
    | [
        {
            avatar: string;
            vote: boolean;
        }
    ]
    | null;
}) {

    const history = useHistory();

    const navigateTo = (to: any) => {
        history.push(`/poll/${to}`);
    };

    const forPercentage = (!forCount && !againstCount) ? 50 : (forCount / (forCount + againstCount)) * 100;
    const forDirectPercentage = (forDirectCount / (forCount + againstCount)) * 100 || 50;
    const againstPercentage = 100 - forPercentage;
    const againstDirectPercentage = (againstDirectCount / (forCount + againstCount)) * 100 || 50;

    return (
        <svg className={`chart1 ${name === null && 'main'}`} width="100%" height="100%">
            <defs>
                <pattern
                    id="image"
                    x="0%"
                    y="0%"
                    height="100%"
                    width="100%"
                    viewBox="0 0 30 30"
                >
                    <image
                        x="0%"
                        y="0%"
                        width="30"
                        height="30"
                        href="https://pbs.twimg.com/profile_images/1257731768569917440/DXgWC7tR_400x400.jpg"
                    ></image>
                </pattern>
            </defs>

            {/* recatangles */}
            <rect
                className="for"
                x="0%"
                width={forPercentage + "%"}
                height="100%"
            />
            <rect
                className="forDirect"
                x="0%"
                width={forDirectPercentage + "%"}
                height="100%"
            />
            <rect
                className="against"
                x={forPercentage + "%"}
                width={againstPercentage + "%"}
                height="100%"
            />
            <rect
                className="againstDirect"
                x={forPercentage + "%"}
                width={againstDirectPercentage + "%"}
                height="100%"
            />

            {showNameInside && (
                <svg x="0" y="0">
                    <text
                        y="12"
                        x="5"
                        className="svgText"
                        onClick={() => navigateTo(name)}
                    >
                        {name}
                    </text>
                </svg>
            )}
        </svg>
    );
}

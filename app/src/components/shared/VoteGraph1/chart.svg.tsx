import * as React from "react";
import { useNavigate } from "react-router-dom";
import numeral from 'numeral';

import './style.sass';

export default function Chart({
    name,
    showNameInside,
    forDirectCount,
    forCount,
    againstDirectCount,
    againstCount,
    userDelegatedVotes = null,
    inList,
}: {
    name: string | null,
    showNameInside?: boolean,
    forDirectCount: number,
    forCount: number,
    againstDirectCount: number
    againstCount: number,
    userDelegatedVotes:
    | [
        {
            avatar: string;
            vote: boolean;
        }
    ]
    | null,
    inList?: boolean
}) {

    const navigate = useNavigate();

    const navigateTo = (to: any) => {
        navigate(`/poll/${to}`);
    };

    const forPercentage = (!forCount && !againstCount) ? 50 : (forCount / (forCount + againstCount)) * 100;
    const forDirectPercentage = (forDirectCount / (forCount + againstCount)) * 100 || 50;
    const againstPercentage = 100 - forPercentage;
    const againstDirectPercentage = (againstDirectCount / (forCount + againstCount)) * 100 || 50;

    return (
        <svg className={`chart1 ${name === null && 'main'} ${inList && 'small'}`} width="100%" height="100%">
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
                x={forDirectPercentage + "%"}
                width={forPercentage - forDirectPercentage + "%"}
                height="100%"
                data-tip={`Delegated Yay`}
            />
            <rect
                className="forDirect"
                x="0%"
                width={forDirectPercentage + "%"}
                height="100%"
                data-tip={`Direct Yay`}
            />
            <rect
                className="against"
                x={forPercentage + againstDirectPercentage + "%"}
                width={againstPercentage - againstDirectPercentage + "%"}
                height="100%"
                data-tip={`Delegated Nay`}
            />
            <rect
                className="againstDirect"
                x={forPercentage + "%"}
                width={againstDirectPercentage + "%"}
                height="100%"
                data-tip={`Direct Nay`}
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

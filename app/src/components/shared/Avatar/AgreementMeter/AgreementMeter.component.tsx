import React, { FunctionComponent } from 'react';

import './style.sass';

export const AgreementMeter: FunctionComponent<{}> = ({ }) => {

    const circlePath = (cx: number, cy: number, r: number) => {
        return (
            `M ${cx} ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`
            // "M "+cx+" "+cy+" m -"+r+", 0 a "+r+","+r+" 0 1,0 "+r * 2+",0 a "+r+","+r+" 0 1,0 -"+r * 2+",0"
        );
    };
    const s = 70;
    const nn = 0;
    const circle = 280;
    const path = circlePath(75, 75, 45);
    const blue = circle - ((100 - s) / 100) * circle - 20 - nn;
    const red = circle - blue - 13 - nn * 3;

    return (
        <div className="circles">
            <svg viewBox="0 0 150 150">
                {/* <path className="bg" d={path} fill="none" /> */}
                <path
                    className="blue for-stroke"
                    d={path}
                    fill="none"
                    style={{
                        strokeDashoffset: `${circle - blue}`,
                        transform: `rotate(${45 + blue / 1.58}deg)`
                    }}
                />
                <path
                    className="red against-stroke"
                    d={path}
                    fill="none"
                    style={{
                        strokeDashoffset: `${circle - red}`,
                        transform: `rotate(${225 + red / 1.58}deg)`
                    }}
                />
            </svg>
        </div>
    );
}


import React, { FunctionComponent } from 'react';
import numeral from 'numeral';

import './style.sass';

export const YayNayBubbles: FunctionComponent<{
    parent: "yay" | "nay",
    forCount: number,
    againstCount: number,
    maxVoteCount?: number,
    inList?: string
}> = ({
    parent,
    forCount = 0,
    againstCount = 0,
    maxVoteCount,
    inList = false
}) => {
        return (
            <div className={`d-flex yayNayBubblesWrapper parent-${parent}`} >
                <div
                    className={`
                pointer text-decoration-none count for mr-n1 tiny-avatar
                ${forCount > againstCount && 'z-2'}
                bubble-text
            `}
                    style={{
                        ...(maxVoteCount) && {
                            'transform':
                                `scale(${((forCount | 0) / maxVoteCount) * 0.8 + 0.8})`
                        }
                    }}
                >
                    {numeral(forCount).format('0a[.]0')}
                </div>
                <div

                    className={`
                text-decoration-none count against ml-1
                ${inList ? 'tiny-avatar' : 'tiny-avatar'}
                ${forCount < againstCount && 'z-2'}
                bubble-text
            `}
                    style={{
                        ...(maxVoteCount) && {
                            'transform':
                                `scale(${((againstCount | 0) / maxVoteCount) * 0.8 + 0.8})`
                        }
                    }}
                >
                    {numeral(againstCount).format('0a[.]0')}
                </div>
            </div>
        );
    }


import React, { FunctionComponent, useState, useEffect } from 'react';

import Popper from "@shared/Popper";
import SortSmallSvg from "@shared/Icons/Sort-small.svg";

import './style.sass';

export const VoteSortPicker: FunctionComponent<{
    updateSortInParent: Function
}> = ({
    updateSortInParent
}) => {

        const [sortBy, setSortBy] = useState('weight');

        useEffect(() => {
            updateSortInParent(sortBy);
        }, [sortBy]);

        const sortHumanText = (sort: string) => ({
            'weight': 'representees',
            'time': 'vote date'
        })[sort];

        return (
            <Popper
                button={<div>
                    <SortSmallSvg />{' '}by {sortHumanText(sortBy)}
                </div>}
                popperContent={
                    <ul className="p-0 m-0">
                        <li className="pointer" onClick={() => setSortBy('weight')}>{sortHumanText('weight')}</li>
                        <li className="pointer" onClick={() => setSortBy('time')}>{sortHumanText('time')}</li>
                    </ul>
                }
            />
        );
    }


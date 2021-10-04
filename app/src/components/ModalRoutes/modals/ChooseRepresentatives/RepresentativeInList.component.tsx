import React, { FunctionComponent, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

// import './style.sass';

export const RepresentativeInList: FunctionComponent<{
    u: any,
    isRemoving?: boolean,
    isAdding?: boolean,
    buttonFunction?: MouseEventHandler<HTMLElement>,
    buttonText?: string
}> = ({ u, isRemoving, isAdding, buttonFunction, buttonText }) => {

    return (
        <li className="d-flex mb-2 position-relative">
            <Link className="d-flex" to={`/profile/${u.handle}`} target="_blank">
                <div>
                    <img className="vote-avatar" src={u.avatar} />
                </div>
                <div className="ml-2">
                    <p className="m-0">{u.name}</p>
                    <small>@{u.handle}</small>
                </div>
            </Link>
            <div className="ml-auto">
                {!!isRemoving ? (
                    <small
                        className="badge inverted"
                    >removing representation</small>
                ) : !!isAdding ? (
                    <small
                        className="badge inverted"
                    >giving representation</small>
                ) : !!buttonText ? (
                    <small
                        className="badge pointer"
                        style={{ maxWidth: 'none' }}
                        onClick={buttonFunction}
                    >{buttonText}</small>
                ) : null}
            </div>
        </li>
    );
}


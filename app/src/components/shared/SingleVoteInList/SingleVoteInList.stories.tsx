import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Router, Route } from 'react-router';
import { withRouter } from 'storybook-addon-react-router-v6';

import SingleVoteInList from '@components/shared/SingleVoteInList';
import { SingleVoteMock } from "@mocks/Votes.mock";

export default {
    title: 'Shared/SingleVoteInList',
    component: SingleVoteInList,
    parameters: {
        apolloClient: {},
        layout: 'fullscreen',
    },
    decorators: [withRouter],
} as ComponentMeta<typeof SingleVoteInList>;

const Template: ComponentStory<typeof SingleVoteInList> = (args) =>
    <div className='p-5 d-flex'>
        <div>
            <SingleVoteInList
                showGroupAndTime={args.showGroupAndTime}
                showChart={args.showChart}
                l={args.l}
                user={args.user}
                showIntroMessage={args.showIntroMessage}
            />
        </div>
    </div>;

export const SingleVoteInList_Default = Template.bind({})
SingleVoteInList_Default.args = {
    showGroupAndTime: false,
    showChart: true,
    showIntroMessage: false,
    l: SingleVoteMock.question,
    user: SingleVoteMock.user,
};
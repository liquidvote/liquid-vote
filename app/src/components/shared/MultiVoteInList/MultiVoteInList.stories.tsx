import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Router, Route } from 'react-router';
import { withRouter } from 'storybook-addon-react-router-v6';

import MultiVoteInList from '@components/shared/MultiVoteInList';
import { MultiVoteMock } from "@mocks/Votes.mock";

export default {
    title: 'Shared/MultiVoteInList',
    component: MultiVoteInList,
    parameters: {
        apolloClient: {},
        layout: 'fullscreen',
    },
    decorators: [withRouter],
} as ComponentMeta<typeof MultiVoteInList>;

const Template: ComponentStory<typeof MultiVoteInList> = (args) =>
    <div className='p-5 d-flex'>
        <div>
            <MultiVoteInList
                showGroupAndTime={args.showGroupAndTime}
                showChart={args.showChart}
                v={args.v}
                user={args.user}
            />
        </div>
    </div>;

export const MultiVoteInList_Default = Template.bind({})
MultiVoteInList_Default.args = {
    showGroupAndTime: false,
    showChart: true,
    v: MultiVoteMock.question,
    user: MultiVoteMock.user,
};
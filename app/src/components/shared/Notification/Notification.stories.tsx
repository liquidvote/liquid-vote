import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Router, Route } from 'react-router';
import { withRouter } from 'storybook-addon-react-router-v6';

import Notification from '@components/shared/Notification';
import { SingleVoteMock } from "@mocks/Votes.mock";

export default {
    title: 'Shared/Notification',
    component: Notification,
    parameters: {
        apolloClient: {},
        layout: 'fullscreen',
    },
    decorators: [withRouter],
} as ComponentMeta<typeof Notification>;

const Template: ComponentStory<typeof Notification> = (args) =>
    <div className='p-5 d-flex'>
        <div>
            <Notification
                v={args.v}
                showUser={args.showUser}
                showChart={args.showChart}
            />
        </div>
    </div>;

export const Notification_Default = Template.bind({})
Notification_Default.args = {
    showUser: true,
    showChart: true,
    v: SingleVoteMock,
};

export const Notification_ListVoters = Template.bind({})
Notification_ListVoters.args = {
    showUser: false,
    showChart: false,
    v: SingleVoteMock,
};

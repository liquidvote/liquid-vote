import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Router, Route } from 'react-router';
import { withRouter } from 'storybook-addon-react-router-v6';

import VotedExplanation from '@components/shared/VotedExplanation';
import { SingleVoteMock } from "@mocks/Votes.mock";

export default {
    title: 'Shared/VotedExplanation',
    component: VotedExplanation,
    parameters: {
        apolloClient: {},
        layout: 'fullscreen',
    },
    decorators: [withRouter],
} as ComponentMeta<typeof VotedExplanation>;

const Template: ComponentStory<typeof VotedExplanation> = (args) =>
    <div className='p-5 d-flex'>
        <div>
            <VotedExplanation
                position={args.position}
                representeeVotes={args.representeeVotes}
                representatives={args.representatives}
                user={args.user}
                groupHandle={args.groupHandle}
            />
        </div>
    </div>;

export const VotedExplanation_Default = Template.bind({})
VotedExplanation_Default.args = {
    position: SingleVoteMock.question.userVote.position,
    representeeVotes: SingleVoteMock.question.userVote.representeeVotes,
    representatives: SingleVoteMock.question.userVote.representatives,
    user: SingleVoteMock.user,
    groupHandle: SingleVoteMock.question.groupChannel.group
};
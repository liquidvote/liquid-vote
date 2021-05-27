export const VoteTimeline = [
    {
        type: "Voted",
        poll: 'Basic Income',
        position: "For",
        who: {
            name: "Elon Musk",
            avatarClass: 2,
            representing: 39000,
        },
        comment: "About time!"
    },
    {
        type: "Voted",
        poll: 'Carbon Tax',
        position: "For",
        who: {
            name: "Bill Gates",
            avatarClass: 3,
            representing: 25000,
            representsYou: true,
        },
        comment: "This is a very relevant issues and deserved the greatest response from everyone."
    },
    {
        type: "Changed Vote",
        poll: 'Equality',
        position: "For",
        who: {
            name: "Dan Price",
            avatarClass: 1,
            representing: 12000,
            representsYou: true,
        },
        comment: "Ups!"
    },
    {
        type: "Voted",
        poll: 'Equality',
        position: "Against",
        who: {
            name: "Dan Price",
            avatarClass: 1,
            representing: 12000,
            representsYou: true,
        }
    },
    {
        type: "Voted",
        poll: 'Equality',
        position: "Against",
        who: {
            name: "Donald Trump",
            avatarClass: 4,
            representing: 15000,
            youRepresent: true
        },
        comment: "🇺🇸cofvev"
    },
    {
        type: "Removed Vote",
        poll: 'Equality',
        position: "For",
        who: {
            name: "Joe Biden",
            avatarClass: 5,
            representing: 59000,
        },
        comment: "I will investigate this issue a bit deeper."
    },
    {
        type: "Voted",
        poll: 'Legalizing Marijuana',
        position: "Against",
        who: {
            name: "Joe Rogan",
            avatarClass: 6,
            representing: 73000,
            representsYou: true,
        },
        comment: "As much as I agree with this, I vote against so that those looking to do something illegal have a something safe to do."
    }
];
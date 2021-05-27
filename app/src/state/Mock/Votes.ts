export const defaults = {
    type: 'single',
    name: null,
    flexSize: 1,
    forDirectCount: 12550,
    forCount: 36550,
    againstDirectCount: 5370,
    againstCount: 13440,
    userVote: null,
    userDelegatedVotes: null,
    representativesFor: [1,2,3],
    representativesAgainst: [4],
};

export const byGroups = {
    yourGroup: [
        {
            ...defaults,
            name: "Curandeiros",
            flexSize: 5,
            forCount: 24550,
            againstCount: 8440,
        },
        {
            ...defaults,
            name: "Bairro dos Anjos",
            flexSize: 4,
            forCount: 10550,
            againstCount: 1440,
        },
        {
            ...defaults,
            name: "Bairro dos Anciões",
            // forPercentage: 50,
            flexSize: 1,
            forCount: 550,
            againstCount: 940,
        }
    ],
    yourRepresentatives: [
        {
            ...defaults,
            name: "Gil Penha Lopes",
            flexSize: 5,
            forCount: 24550,
            forDirectCount: 1,
            againstCount: 0,
            userVote: true,
        },
        {
            ...defaults,
            name: "Sara Rica",
            flexSize: 3,
            againstCount: 8550,
            againstDirectCount: 1,
            forCount: 0,
            userVote: true,
        },
        {
            ...defaults,
            name: "Sara Mercier",
            flexSize: 2,
            forCount: 6550,
            forDirectCount: 1,
            againstCount: 0,
            userVote: true,
        },
        {
            ...defaults,
            name: "Other",
            // forPercentage: 50,
            flexSize: 1,
            forCount: 550,
            againstCount: 940,
            userVote: true,
        }
    ],
    location: [
        {
            ...defaults,
            name: "Lisbon",
            flexSize: 5,
            forCount: 24550,
            againstCount: 8440,
        },
        {
            ...defaults,
            name: "London",
            flexSize: 4,
            forCount: 10550,
            againstCount: 1440,
        },
        {
            ...defaults,
            name: "Other",
            // forPercentage: 50,
            flexSize: 1,
            forCount: 550,
            againstCount: 940,
        }
    ],
    age: [
        // {
        //     ...defaults,
        //     name: "10-18",
        //     flexSize: 3,
        //     forCount: 7550,
        //     againstCount: 1040,
        // },
        {
            ...defaults,
            name: "20-39",
            flexSize: 4,
            forCount: 5550,
            againstCount: 1440,
        },
        {
            ...defaults,
            name: "40-59",
            // forPercentage: 70,
            flexSize: 3,
            forCount: 3550,
            againstCount: 440,
        },
        {
            ...defaults,
            name: "60-79",
            // forPercentage: 60,
            flexSize: 3,
            forCount: 1550,
            againstCount: 2440,
        },
        {
            ...defaults,
            name: "80+",
            // forPercentage: 50,
            flexSize: 1,
            forCount: 350,
            againstCount: 540,
        }
    ],
    occupation: [
        {
            ...defaults,
            name: "Student",
            flexSize: 5,
            // forPercentage: 90
        },
        {
            ...defaults,
            name: "Sales",
            flexSize: 4,
            // forPercentage: 50,
            userVote: null
        },
        {
            ...defaults,
            name: "Doctor",
            flexSize: 3,
            // forPercentage: 70,
            userVote: null
        },
        {
            ...defaults,
            name: "IT",
            flexSize: 3,
            // forPercentage: 90,
            userVote: null
        },
        {
            ...defaults,
            name: "Lobbyist",
            flexSize: 2,
            // forPercentage: 20,
            userVote: null
        },
        {
            ...defaults,
            name: "Other",
            // forPercentage: 50,
            flexSize: 1,
            userVote: null
        }
    ],
    approvalOnOtherTopics: [
        {
            ...defaults,
            name: "Equality",
            flexSize: 7,
            // forPercentage: 70,
            // forPercentageOnOther: 90,
            userVote: true
        },
        {
            ...defaults,
            name: "BLM",
            flexSize: 5,
            // forPercentage: 60,
            // forPercentageOnOther: 50,
            userVote: true
        },
        {
            ...defaults,
            name: "LGBT Rights",
            // forPercentage: 90,
            flexSize: 3,
            // forPercentageOnOther: 40,
            userVote: true
        },
        {
            ...defaults,
            name: "Other",
            // forPercentage: 50,
            flexSize: 1
        }
    ]
};

export const votesBy = [
    {
        ...defaults,
        name: "Direct",
        forDirectCount: 6550,
        forCount: 18550,
        againstDirectCount: 2170,
        againstCount: 6440,
        flexSize: 6,
        userVote: null
    },
    {
        ...defaults,
        name: "Gil Penha Lopes",
        flexSize: 3,
        forDirectCount: 8850,
        forCount: 8850,
        againstDirectCount: 0,
        againstCount: 0,
        userVote: null
    },
    {
        ...defaults,
        name: "Sara Rica",
        flexSize: 2,
        forDirectCount: 0,
        forCount: 0,
        againstDirectCount: 2840,
        againstCount: 2840,
        userVote: null
    },
    {
        ...defaults,
        name: "Sara Mercier",
        forDirectCount: 750,
        forCount: 750,
        againstDirectCount: 0,
        againstCount: 0,
        flexSize: 1,
        userVote: null
    }
];

export const onSubTopics = [
    {
        ...defaults,
        subname: "amoung Genders",
        flexSize: 8,
        // forPercentage: 90,
        // forPercentageOnOther: 70,
        userVote: true
    },
    {
        ...defaults,
        subname: "accross all Ages",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
    },
    {
        ...defaults,
        subname: "for rapists",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
    },
    {
        ...defaults,
        subname: "including demoniac ones",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
        userVote: true
    },
    {
        ...defaults,
        subname: "excluding demoniac ones",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
    }
];

export const valores = [
    {
        ...defaults,
        subname: "Sustentabilidade",
        flexSize: 8,
        // forPercentage: 90,
        // forPercentageOnOther: 70,
        userVote: true
    },
    {
        ...defaults,
        subname: "Flexibilidade",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
    },
    {
        ...defaults,
        subname: "Abertura",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
    },
    {
        ...defaults,
        subname: "Entusiasmo",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
        userVote: true
    },
    {
        ...defaults,
        subname: "Envolvimento",
        flexSize: 4,
        // forPercentage: 60,
        // forPercentageOnOther: 50,
    }
];

export const profileVotes = [
    {
        ...defaults,
        name: "Equality",
        flexSize: 7,
        forPercentage: 70,
        userVote: true
        // forPercentageOnOther: 90
    },
    {
        ...defaults,
        name: "BLM",
        flexSize: 5,
        forPercentage: 60,
        userVote: true
        // forPercentageOnOther: 50
    },
    {
        ...defaults,
        name: "LGBT Rights",
        forPercentage: 90,
        flexSize: 3,
        userVote: true
        // forPercentageOnOther: 40
    },
    {
        ...defaults,
        name: "Libertarianism",
        forPercentage: 40,
        flexSize: 1,
        userVote: false
    },
    {
        ...defaults,
        name: "Mercantilism",
        forPercentage: 30,
        flexSize: 1,
        userVote: false
    }
];

export const abrigadaVotes = [
    {
        ...defaults,
        type: "multi",
        name: "Valores",
        subgroup: "Geral",
        subvotes: [
            {
                ...defaults,
                name: "Sustainability",
                flexSize: 8,
                // forPercentage: 90,
                // forPercentageOnOther: 70,
                userVote: true
            },
            {
                ...defaults,
                name: "Flexibility",
                flexSize: 7,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Openness",
                flexSize: 4,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Eagerness",
                flexSize: 3,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
                userVote: true
            },
            {
                ...defaults,
                name: "Involvement",
                flexSize: 2,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            }
        ]
        // forPercentageOnOther: 90
    },
    {
        ...defaults,
        type: "multi",
        name: "Infra-Estruturas",
        subgroup: "Geral",
        subvotes: [
            {
                ...defaults,
                name: "Sustainability",
                flexSize: 8,
                // forPercentage: 90,
                // forPercentageOnOther: 70,
                userVote: true
            },
            {
                ...defaults,
                name: "Flexibility",
                flexSize: 7,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Openness",
                flexSize: 4,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Eagerness",
                flexSize: 3,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
                userVote: true
            },
            {
                ...defaults,
                name: "Involvement",
                flexSize: 2,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            }
        ]
    },
    {
        ...defaults,
        type: "multi",
        name: "Fornecedor de Internet",
        subgroup: "Geral",
        subvotes: [
            {
                ...defaults,
                name: "Vodafone @ 100MB & 30€/mês",
                flexSize: 8,
                // forPercentage: 90,
                // forPercentageOnOther: 70,
                userVote: true
            },
            {
                ...defaults,
                name: "Meo @ 100MB & 27.99€/mês",
                flexSize: 7,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Nos @ 100MB & 35€/mês",
                flexSize: 4,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Para quê internet?",
                flexSize: 1,
            },
        ]
    },
    {
        ...defaults,
        name: "Dia da reunião semanal",
        type: "multi",
        subgroup: "Geral",
        subvotes: [
            {
                ...defaults,
                name: "2a",
                flexSize: 8,
                // forPercentage: 90,
                // forPercentageOnOther: 70,
                userVote: true
            },
            {
                ...defaults,
                name: "4a",
                flexSize: 7,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Sab",
                flexSize: 4,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "Dom",
                flexSize: 1,
            },
        ]
    },
    {
        ...defaults,
        name: "Data do Festival de Abertura",
        type: "multi",
        subgroup: "Geral",
        subvotes: [
            {
                ...defaults,
                name: "30 Abril 2022",
                flexSize: 8,
                // forPercentage: 90,
                // forPercentageOnOther: 70,
                userVote: true
            },
            {
                ...defaults,
                name: "24 Maio 2022",
                flexSize: 7,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "18 Junho 2022",
                flexSize: 4,
                // forPercentage: 60,
                // forPercentageOnOther: 50,
            },
            {
                ...defaults,
                name: "15 Janeiro 2023",
                flexSize: 1,
            },
        ]
    },
];

export const feedNotificationVotes = [
    {
        ...defaults,
        who: {
            name: 'Dan Price',
            handle: '@DanPriceSeattle',
            avatar: '',
            representsYou: true
        },
        message: "Voted 'For' on",
        name: "Equality",
    },
    {
        ...defaults,

        name: "BLM",
        who: {
            name: 'Dan Price',
            handle: '@DanPriceSeattle',
            avatar: '',
            representsYou: false
        },
        message: "Launched Opinion Poll and Voted 'For' on",
    },
    {
        ...defaults,
        name: "LGBT Rights",
        forPercentage: 90,
        flexSize: 3,
        who: {
            name: 'Dan Price',
            handle: '@DanPriceSeattle',
            avatar: '',
            representsYou: true
        },
        message: "Voted 'For' on",
    },
    {
        ...defaults,
        name: "Libertarianism",
        forPercentage: 40,
        who: {
            name: 'Dan Price',
            handle: '@DanPriceSeattle',
            avatar: '',
            representsYou: false
        },
        message: "Voted 'Against' on",
    },
    {
        ...defaults,
        name: "Mercantilism",
        who: {
            name: 'Dan Price',
            handle: '@DanPriceSeattle',
            avatar: '',
            representsYou: true
        },
        message: "Voted 'Against' on",
    }
];

export const voteList = [
    {
        ...defaults,
        name: "Legalizing Marijuana",
    },
    {
        ...defaults,
        name: "Reducing Covid Measures",
        userVote: true
    },
    {
        ...defaults,
        name: "Basic Income",
        userVote: true
    },
    {
        ...defaults,
        name: "Facilitating Immigration",
    },
    {
        ...defaults,
        name: "No Taxes for Independent Restaurants",
    },
];
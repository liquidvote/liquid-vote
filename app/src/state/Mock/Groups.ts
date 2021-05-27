import { defaults as voteDefaults } from "./Votes";

export const defaults = {
    name: 'default group name',
    userCount: 15,
    youAreAdmin: false,
    about: 'A community of locals and expats. That own flats in Algarve. For personal use, Airbnb, long term renting or whatever.',
    private: false,
    subGroups: [
        {
            ...defaults,
            name: "Geral",
            avatarClass: 0,
        },
        {
            ...defaults,
            name: "Bairro dos Anjos",
            avatarClass: 2,
            private: true
        },
        {
            ...defaults,
            name: "Bairro dos Anciões",
            avatarClass: 3,
            private: true
        },
        {
            ...defaults,
            name: "Bairro dos Astros",
            avatarClass: 4,
        },
        {
            ...defaults,
            name: "Permacultores",
            avatarClass: 5,
            private: true
        },
        {
            ...defaults,
            name: "Artistas",
            avatarClass: 6,
        },
        {
            ...defaults,
            name: "Construtores",
            avatarClass: 6,
        },
        {
            ...defaults,
            name: "Curandeiros",
            avatarClass: 6,
        },
    ],
    votes: [
        {
            ...voteDefaults,
            type: "single",
            name: "Usamos o Liquid Vote",
            subgroups: ["Geral"],
        },
        {
            ...voteDefaults,
            type: "multi",
            name: "Valores",
            subgroups: ["Geral", "Bairro dos Anjos"],
            subvotes: [
                {
                    ...voteDefaults,
                    name: "Sustentabilidade",
                    flexSize: 8,
                    // forPercentage: 90,
                    // forPercentageOnOther: 70,
                    userVote: true
                },
                {
                    ...voteDefaults,
                    name: "Flexibilidade",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "Abertura",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "Entusiasmo",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                    userVote: true
                },
                {
                    ...voteDefaults,
                    name: "Envolvimento",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                }
            ]
        },
        {
            ...voteDefaults,
            type: "multi",
            name: "Infra-Estruturas",
            subgroups: ["Geral", "Construtores"],
            subvotes: [
                {
                    ...voteDefaults,
                    name: "Horta Colectiva",
                    flexSize: 1,
                    representativesFor: [],
                    representativesAgainst: [],
                },
                {
                    ...voteDefaults,
                    name: "Lago",
                    flexSize: 1,
                    representativesFor: [],
                    representativesAgainst: [],
                },
                {
                    ...voteDefaults,
                    name: "Cinema",
                    flexSize: 1,
                    representativesFor: [],
                    representativesAgainst: [],
                },
                {
                    ...voteDefaults,
                    name: "Piscina",
                    flexSize: 1,
                    representativesFor: [],
                    representativesAgainst: [],
                },
                {
                    ...voteDefaults,
                    name: "Campo de Tennis",
                    flexSize: 1,
                    representativesFor: [],
                    representativesAgainst: [],
                },
            ]
        },
        {
            ...voteDefaults,
            type: "multi",
            name: "Fornecedor de Internet",
            subgroups: ["Geral"],
            subvotes: [
                {
                    ...voteDefaults,
                    name: "Vodafone @ 100MB & 30€/mês",
                    flexSize: 8,
                    // forPercentage: 90,
                    // forPercentageOnOther: 70,
                    userVote: true
                },
                {
                    ...voteDefaults,
                    name: "Meo @ 100MB & 27.99€/mês",
                    flexSize: 7,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "Nos @ 100MB & 35€/mês",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "Para quê internet?",
                    flexSize: 1,
                },
            ]
        },
        {
            ...voteDefaults,
            name: "Dia da reunião semanal Geral",
            type: "multi",
            subgroups: ["Geral"],
            subvotes: [
                {
                    ...voteDefaults,
                    name: "2a",
                    flexSize: 8,
                    // forPercentage: 90,
                    // forPercentageOnOther: 70,
                    userVote: true
                },
                {
                    ...voteDefaults,
                    name: "4a",
                    flexSize: 7,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "Sab",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "Dom",
                    flexSize: 1,
                },
            ]
        },
        {
            ...voteDefaults,
            name: "Data do Festival de Abertura",
            type: "multi",
            subgroups: ["Geral"],
            subvotes: [
                {
                    ...voteDefaults,
                    name: "30 Abril 2022",
                    flexSize: 8,
                    // forPercentage: 90,
                    // forPercentageOnOther: 70,
                    userVote: true
                },
                {
                    ...voteDefaults,
                    name: "24 Maio 2022",
                    flexSize: 7,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "18 Junho 2022",
                    flexSize: 4,
                    // forPercentage: 60,
                    // forPercentageOnOther: 50,
                },
                {
                    ...voteDefaults,
                    name: "15 Janeiro 2023",
                    flexSize: 1,
                },
            ]
        }
    ]
};

export const groups = [
    {
        ...defaults,
        name: "Aldeia d'Abrigada",
        avatarClass: 0,
        about: "Projecto de Eco-Aldeia no Freguesia da Abrigada",
        subGroups: [
            {
                ...defaults,
                name: "Geral",
                avatarClass: 0,
            },
            {
                ...defaults,
                name: "Bairro dos Anjos",
                avatarClass: 2,
                private: true
            },
            {
                ...defaults,
                name: "Bairro dos Anciões",
                avatarClass: 3,
                private: true
            },
            {
                ...defaults,
                name: "Bairro dos Astros",
                avatarClass: 4,
            },
            {
                ...defaults,
                name: "Permacultores",
                avatarClass: 5,
                private: true
            },
            {
                ...defaults,
                name: "Artistas",
                avatarClass: 6,
            },
            {
                ...defaults,
                name: "Construtores",
                avatarClass: 6,
            },
            {
                ...defaults,
                name: "Curandeiros",
                avatarClass: 6,
            },
        ],
        votes: [
            {
                ...voteDefaults,
                type: "single",
                name: "Usamos o Liquid Vote",
                subgroups: ["Geral"],
            },
            {
                ...voteDefaults,
                type: "multi",
                name: "Valores",
                subgroups: ["Geral", "Bairro dos Anjos"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "Sustentabilidade",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "Flexibilidade",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Abertura",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Entusiasmo",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "Envolvimento",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    }
                ]
            },
            {
                ...voteDefaults,
                type: "multi",
                name: "Infra-Estruturas",
                subgroups: ["Geral", "Construtores"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "Horta Colectiva",
                        flexSize: 1,
                        representativesFor: [],
                        representativesAgainst: [],
                    },
                    {
                        ...voteDefaults,
                        name: "Lago",
                        flexSize: 1,
                        representativesFor: [],
                        representativesAgainst: [],
                    },
                    {
                        ...voteDefaults,
                        name: "Cinema",
                        flexSize: 1,
                        representativesFor: [],
                        representativesAgainst: [],
                    },
                    {
                        ...voteDefaults,
                        name: "Piscina",
                        flexSize: 1,
                        representativesFor: [],
                        representativesAgainst: [],
                    },
                    {
                        ...voteDefaults,
                        name: "Campo de Tennis",
                        flexSize: 1,
                        representativesFor: [],
                        representativesAgainst: [],
                    },
                ]
            },
            {
                ...voteDefaults,
                type: "multi",
                name: "Fornecedor de Internet",
                subgroups: ["Geral"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "Vodafone @ 100MB & 30€/mês",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "Meo @ 100MB & 27.99€/mês",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Nos @ 100MB & 35€/mês",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Para quê internet?",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Dia da reunião semanal",
                type: "multi",
                subgroups: ["Geral"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "2a",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "4a",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Sab",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Dom",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Data do Festival de Abertura",
                type: "multi",
                subgroups: ["Geral"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "30 Abril 2022",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "24 Maio 2022",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "18 Junho 2022",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "15 Janeiro 2023",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Dia da reunião semanal Bairro dos Anjos",
                type: "multi",
                subgroups: ["Bairro dos Anjos"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "2a",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "4a",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Sab",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Dom",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Dia da reunião semanal Bairro dos Anciões",
                type: "multi",
                subgroups: ["Bairro dos Anciões"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "2a",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "4a",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Sab",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Dom",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Dia da reunião semanal Bairro dos Astros",
                type: "multi",
                subgroups: ["Bairro dos Astros"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "2a",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "4a",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Sab",
                        flexSize: 4,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Dom",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Que frutos cerscemos?",
                type: "multi",
                subgroups: ["Geral", "Permacultores", "Bairro dos Astros", "Bairro dos Anciões", "Bairro dos Anjos"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "Amora",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "Maça",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Pêra",
                        flexSize: 6,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Laranja",
                        flexSize: 4,
                    },
                    {
                        ...voteDefaults,
                        name: "Morango",
                        flexSize: 3,
                    },
                    {
                        ...voteDefaults,
                        name: "Limão",
                        flexSize: 3,
                    },
                    {
                        ...voteDefaults,
                        name: "Banana",
                        flexSize: 3,
                    },
                    {
                        ...voteDefaults,
                        name: "Abacate",
                        flexSize: 2,
                    },
                    {
                        ...voteDefaults,
                        name: "Manga",
                        flexSize: 2,
                    },
                    {
                        ...voteDefaults,
                        name: "Jaca",
                        flexSize: 1,
                    },
                    {
                        ...voteDefaults,
                        name: "Guarana",
                        flexSize: 1,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Quem gere a Jam em Junho?",
                type: "multi",
                subgroups: ["Artistas"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "Claudio",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "Edgar",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Sara",
                        flexSize: 6,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "Yuri",
                        flexSize: 4,
                    },
                ]
            },
            {
                ...voteDefaults,
                name: "Data da Cerimônia de São Pedro",
                type: "multi",
                subgroups: ["Curandeiros", "Geral"],
                subvotes: [
                    {
                        ...voteDefaults,
                        name: "18 Maio",
                        flexSize: 8,
                        // forPercentage: 90,
                        // forPercentageOnOther: 70,
                        userVote: true
                    },
                    {
                        ...voteDefaults,
                        name: "5 de Junho",
                        flexSize: 7,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "23 de Junho",
                        flexSize: 6,
                        // forPercentage: 60,
                        // forPercentageOnOther: 50,
                    },
                    {
                        ...voteDefaults,
                        name: "7 de Julho",
                        flexSize: 4,
                    },
                ]
            },
        ]
    },
    {
        ...defaults,
        name: "Algarve Flats",
        avatarClass: 1,
    },
    {
        ...defaults,
        name: "Deloitte Deserters",
        avatarClass: 2,
        private: true
    },
    {
        ...defaults,
        name: "💩s",
        avatarClass: 3,
        private: true
    },
    {
        ...defaults,
        name: "Shoreditch Neighborhood",
        avatarClass: 4,
    },
    {
        ...defaults,
        name: "Camping Krew",
        avatarClass: 5,
        private: true
    },
    {
        ...defaults,
        name: "Moon Investors",
        avatarClass: 6,
    },
];

export const subGroups = [
    {
        ...defaults,
        name: "Geral",
        avatarClass: 0,
    },
    {
        ...defaults,
        name: "Bairro dos Anjos",
        avatarClass: 2,
        private: true
    },
    {
        ...defaults,
        name: "Bairro dos Anciões",
        avatarClass: 3,
        private: true
    },
    {
        ...defaults,
        name: "Bairro dos Astros",
        avatarClass: 4,
    },
    {
        ...defaults,
        name: "Permacultores",
        avatarClass: 5,
        private: true
    },
    {
        ...defaults,
        name: "Artistas",
        avatarClass: 6,
    },
    {
        ...defaults,
        name: "Construtores",
        avatarClass: 6,
    },
    {
        ...defaults,
        name: "Curandeiros",
        avatarClass: 6,
    },
];


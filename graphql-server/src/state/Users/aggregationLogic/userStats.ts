export const userStatsAgg = () => [
    {
        '$lookup': {
            'as': 'stats_representing',
            'from': 'UserRepresentations',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$representeeId', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isRepresentingYou', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$group': {
                        '_id': {
                            'representativeId': '$representativeId'
                        }
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_representedBy',
            'from': 'UserRepresentations',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$representativeId', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isRepresentingYou', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$group': {
                        '_id': {
                            'representeeId': '$representeeId'
                        }
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_groupsJoined',
            'from': 'GroupMembers',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$userId', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isMember', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_directVotesMade',
            'from': 'Votes',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isDirect', true
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$ne': [
                                        '$position', null
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$sort': {
                        'lastEditOn': -1
                    }
                }, {
                    '$group': {
                        '_id': null,
                        'count': {
                            '$sum': 1
                        },
                        'lastEditOn': {
                            '$last': '$lastEditOn'
                        }
                    }
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_indirectVotesMadeByUser',
            'from': 'Votes',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        {
                                            '$size': {
                                                '$filter': {
                                                    'input': '$representatives',
                                                    'as': 'r',
                                                    'cond': {
                                                        '$eq': [
                                                            '$$r.representativeId', '$$userId'
                                                        ]
                                                    }
                                                }
                                            }
                                        }, 1
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isDirect', true
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$ne': [
                                        '$position', null
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_indirectVotesMadeForUser',
            'from': 'Votes',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isDirect', false
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$ne': [
                                        '$position', null
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_pollsCreated',
            'from': 'Questions',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$createdBy', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$ne': [
                                        '$status', 'deleted'
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_following',
            'from': 'UserFollows',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$followingId', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isFollowing', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$lookup': {
            'as': 'stats_followedBy',
            'from': 'UserFollows',
            'let': {
                'userId': '$_id'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$followedId', {
                                            '$toObjectId': '$$userId'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isFollowing', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$count': 'count'
                }
            ]
        }
    }, {
        '$addFields': {
            'stats.lastDirectVoteOn': {
                '$first': '$stats_directVotesMade.lastEditOn'
            },
            'stats.representing': {
                '$first': '$stats_representing.count'
            },
            'stats.representedBy': {
                '$first': '$stats_representedBy.count'
            },
            'stats.groupsJoined': {
                '$first': '$stats_groupsJoined.count'
            },
            'stats.directVotesMade': {
                '$first': '$stats_directVotesMade.count'
            },
            'stats.indirectVotesMadeByUser': {
                '$first': '$stats_indirectVotesMadeByUser.count'
            },
            'stats.indirectVotesMadeForUser': {
                '$first': '$stats_indirectVotesMadeForUser.count'
            },
            'stats.pollsCreated': {
                '$first': '$stats_pollsCreated.count'
            },
            'stats.following': {
                '$first': '$stats_following.count'
            },
            'stats.followedBy': {
                '$first': '$stats_followedBy.count'
            }
        }
    }
];
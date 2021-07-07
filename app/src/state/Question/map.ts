export const voteStatsMap = ({
    forCount,
    againstCount,
    forDirectCount,
    againstDirectCount
}: {
    forCount: number,
    againstCount: number,
    forDirectCount: number,
    againstDirectCount: number
}) => {
    const forPercentage = ((forCount / (forCount + againstCount)) * 100);
    const forDirectPercentage = (forDirectCount / (forCount + againstCount)) * 100;
    const forDelegatedPercentage = ((forCount - forDirectCount) / (forCount + againstCount)) * 100;
    const againstPercentage = 100 - forPercentage;
    const againstDirectPercentage = (againstDirectCount / (forCount + againstCount)) * 100;
    const againstDelegatedPercentage = ((againstCount - againstDirectCount) / (forCount + againstCount)) * 100;

    return {
        forDelegatedPercentage,
        forDirectPercentage,
        againstDelegatedPercentage,
        againstDirectPercentage,

        forCount,
        againstCount,
        forDirectCount,
        againstDirectCount
    }
};
/*
 * A work's vouch score (0–10) grows with the combined weight of its vouches and levels off
 * towards 10, so every vouch raises it, and a vouch from someone with a strong profile raises
 * it more than a peer's.
 */
const K = 25;

export const scoreFrom = (weightSum: number) => Math.round(100 * (1 - Math.exp(-weightSum / K))) / 10;

/** The combined weight that produces `score`. Used to size the seed data. */
export const weightSumFor = (score: number) => -K * Math.log(1 - score / 10);

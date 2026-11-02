/**
 * Selected public copy for the Frozen USD launch website.
 * Edit wording here; layout lives in src/components/.
 * Conditional launch labels (Buy, Copy, Explorer) live with the components
 * that decide whether they may render.
 */

export const nav = [
  { label: 'The idea', href: '#idea' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'The cold facts', href: '#token' },
  { label: 'Memes', href: '#memes' },
] as const;

export const hero = {
  eyebrow: 'Frozen USD · $FUSD',
  identity: 'MEMECOIN PARODY',
  title: 'The dollar that trades frozen.',
  support: ['Transfer it.', 'Trade it.', 'No thawing required.'],
  signature: 'Frozen. Still moving.',
  contractUnavailable: 'Contract address not available yet.',
  art: {
    label: 'Concept illustration',
    location: 'Location: updated',
    temperature: 'Temperature: unchanged',
    alt: 'Concept illustration: the Frozen USD coin, sealed inside a clear block of ice, travels between two abstract wallets. Location: updated. Temperature: unchanged.',
  },
};

export const idea = {
  eyebrow: 'A NEW STANDARD IN FROZEN FINANCE',
  title: 'We gave frozen dollars somewhere to go.',
  lead: ['The industry proved digital dollars can freeze.', 'We wondered why that had to be the end of the transaction.'],
  progression: ['Stablecoins made the dollar stable.', 'We made it solid.', 'Then we let it circulate.'],
  closing: 'Hot wallet. Cold dollars.',
};

export const product = {
  title: 'Change hands. Keep your temperature.',
  stages: [
    { title: 'Start frozen.', text: 'The dollar has already committed to the concept.' },
    { title: 'Change wallets.', text: 'A new address. Same winter.' },
    { title: 'Keep it cold.', text: 'The owner changes. The premise stays intact.' },
  ],
  under: 'No thawing required.',
  proof: [
    { term: 'Departure', value: 'frozen.' },
    { term: 'Arrival', value: 'frozen.' },
    { term: 'Ownership', value: 'changed.' },
  ],
  proofLabel: 'Fictional Proof of Cold.',
};

export const benefits = {
  title: 'Keep the cold. Keep the movement.',
  items: [
    { title: 'Frozen from the start.', text: 'Why wait for a headline to discover the temperature setting?', art: 'start' },
    { title: 'No thawing required.', text: 'A change of wallet does not require a change of state.', art: 'transfer' },
    {
      title: 'Self-custodied. Centrally refrigerated.',
      text: 'You manage the keys. Our fictional institution remains deeply invested in the temperature.',
      art: 'custody',
    },
  ],
} as const;

export const satire = {
  title: 'Decentralized until further notice.',
  body: ['The network is open.', 'The wallet is yours.', 'The token may still have an issuer with instructions.'],
  coda: 'Frozen USD takes that contradiction and gives it a product launch.',
  closing: 'Your keys. Our freezer.',
  note: {
    label: 'OCTOBER 2026',
    dateTime: '2026-10-30',
    title: 'The industry found the freezer.',
    text: "Binance's October 30, 2026 update reported approximately $3 billion in affected assets frozen after the hack.",
    aside: ['They demonstrated the cold part.', 'Our fictional research department would like to discuss the movement part.'],
    linkLabel: "Read Binance's dated update",
    href: 'https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751',
  },
};

export const token = {
  title: 'The cold facts.',
  body: 'Frozen USD is a memecoin parody. No dollar peg. No dollar redemption. The frozen-dollar technology is the joke.',
  networkPending: 'To be announced',
  contractPending: 'Not available yet',
  statusLabels: { prelaunch: 'Pre-launch', live: 'Live' },
  prelaunchNote: 'Official token links will appear here when available.',
};

export const memes = {
  title: ['Some people hold dollars.', 'Some people hold opinions about dollars.'],
  body: ['$FUSD is for the second group.', 'Make the image. Pass the line around. Keep it cold.'],
  posters: [
    { slug: 'frozen-still-moving', line: 'FROZEN. STILL MOVING.' },
    { slug: 'your-keys-our-freezer', line: 'YOUR KEYS. OUR FREEZER.' },
    { slug: 'no-thawing-required', line: 'NO THAWING REQUIRED.' },
  ],
  below: 'Hold the meme. Question the money.',
} as const;

export const faq = [
  {
    q: 'Is Frozen USD a stablecoin?',
    a: ['It has the brochure confidence of one. $FUSD is a memecoin with no dollar peg or redemption promise.'],
  },
  {
    q: 'How can it be frozen and still move?',
    a: ['That is our fictional breakthrough. We put the cold in the metaphor and left the movement in the story.'],
  },
  {
    q: 'Does frozen mean locked?',
    a: ['It describes the joke. Actual token permissions and trading conditions belong in the verified token details above.'],
  },
  {
    q: 'Can this unlock frozen USDT or USDC?',
    a: ["No. We do not have access to another issuer's controls or provide an unfreezing service."],
  },
  {
    q: 'Why hold $FUSD?',
    a: ['Because you enjoy the premise and want to take part in it. No financial return or dollar safety is attached to the punchline.'],
  },
  {
    q: 'What backs it?',
    a: ['Creatively: cold hard memes.', 'Financially: there is no dollar-backing or redemption claim.'],
  },
];

export const closing = {
  title: 'Put a cold idea into circulation.',
  signature: 'Frozen. Still moving.',
  signOff: 'Keep it cold.',
};

export const footer = {
  tagline: 'Frozen USD — Frozen. Still moving.',
  disclaimer:
    'Independent memecoin parody. No dollar peg or redemption. No affiliation with Tether, Circle or Binance. Cryptoassets can lose all their value.',
};

export const notFound = {
  title: "This dollar moved. The page didn't.",
  body: "We couldn't find that page. The homepage is still available.",
  action: 'Back to Frozen USD',
};

export const seo = {
  title: 'Frozen USD — Frozen. Still moving.',
  description:
    'The dollar that trades frozen. Transfer it. Trade it. No thawing required. $FUSD is a memecoin parody of stablecoins and the freeze button.',
};

export const actions = {
  explore: 'Explore frozen finance',
  tokenDetails: 'Token details',
  buy: 'Buy $FUSD',
  coldFacts: 'The cold facts',
  followX: 'Follow on X',
  community: 'Join the community',
  copy: 'Copy',
  explorer: 'Explorer',
  trade: 'Trade',
};

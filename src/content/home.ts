/**
 * Selected public copy for the Frozen USD launch website.
 * Edit wording here; layout lives in src/components/.
 * Conditional launch labels (Buy, Copy, Explorer) live with the components
 * that decide whether they may render.
 */

export const nav = [
  { label: 'The idea', href: '#idea' },
  { label: 'Reserves', href: '#reserves' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'The cold facts', href: '#token' },
  { label: 'Memes', href: '#memes' },
] as const;

export const hero = {
  ticker: '$USDFU',
  title: 'The dollar that trades frozen.',
  support: ['Transfer it.', 'Trade it.', 'No thawing required.'],
  bridge: 'Some digital dollars have an issuer freeze switch. Our freezer is reserved for ice.',
  signature: 'Frozen. Still moving.',
  contractUnavailable: 'Contract address not available yet.',
  art: {
    alt: 'Frozen USD tokens circulate while remaining frozen.',
  },
};

export const reserves = {
  eyebrow: 'THE COLD STANDARD',
  title: '100% backed by cold, hard reserves.',
  body: 'Every USDFU is pegged 1:1 to an institutional-grade ice cube, held in our Strategic Ice Reserve in Antarctica. Our reserves are maintained in solid form. Unlike conventional financial institutions, we consider liquidity a temperature problem.',
  facts: [
    { value: '1:1', label: 'Ice-cube peg', line: 'One USDFU. One ice cube.' },
    { value: '100%', label: 'Cold, hard backing', line: 'Fully reserved. Deeply refrigerated.' },
    { value: 'Antarctica', label: 'Reserve location', line: 'Cold storage. Literally.' },
  ],
  subtitle: 'Fully backed. Mostly transparent.',
  text: 'Transparency is central to our operation. Unfortunately, so is frost.',
  small: 'Reserve visibility may vary depending on frost conditions.',
};

export const idea = {
  eyebrow: 'A NEW STANDARD IN FROZEN FINANCE',
  title: 'We froze the reserves. Not the transfers.',
  lead: [
    'Some digital dollars move on open networks while their issuers retain the power to stop them.',
    'Our freezer has a narrower mandate: keep the reserves cold.',
  ],
  progression: ['The dollar went on-chain.', 'The issuer kept a switch.', 'We kept the ice.'],
  closing: 'Hot wallet. Cold dollars.',
};

export const product = {
  title: 'Change hands. Keep your temperature.',
  stages: [
    { title: 'Start frozen.', text: 'The reserve has already committed to the temperature.' },
    { title: 'Change wallets.', text: 'A new address. Same winter.' },
    { title: 'Keep it cold.', text: 'The reserve stays cold. Ownership changes.' },
  ],
  under: 'No thawing required.',
  proof: [
    { term: 'Departure', value: 'frozen.' },
    { term: 'Arrival', value: 'frozen.' },
    { term: 'Ownership', value: 'changed.' },
  ],
  proofLabel: 'Proof of Cold.',
};

export const benefits = {
  title: 'Keep the cold. Keep the movement.',
  items: [
    { title: 'Frozen from the start.', text: 'The reserve entered service below zero.', art: 'start' },
    { title: 'No thawing required.', text: 'A change of wallet does not require a change of state.', art: 'transfer' },
    {
      title: 'Self-custodied. Centrally refrigerated.',
      text: 'In your wallet, you manage the keys. We manage the temperature.',
      art: 'custody',
    },
  ],
} as const;

export const satire = {
  title: 'Decentralized until further notice.',
  body: ['The network is open.', 'The wallet is yours.', 'The token may still have an issuer with instructions.'],
  closing: 'Your keys. Our freezer.',
  /** Shown after the closing line: an issuer switch versus the reserve. */
  contrast: [
    'Some digital dollars have a freeze authority.',
    'We have a Strategic Ice Reserve.',
    'Only one of those can stop a transfer.',
  ],
  /** Dated evidence note, kept subordinate to the section. Each fact links to its source. */
  note: {
    label: 'OCTOBER 2026',
    dateTime: '2026-10',
    title: 'The switch in plain sight.',
    facts: [
      {
        text: 'Following the October 2026 Binance hack, Binance reported approximately $3 billion in affected assets frozen on-chain through coordination with law enforcement, asset issuers and industry partners.',
        href: 'https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751',
        source: 'Binance announcement',
      },
      {
        text: 'Circle later said it froze approximately $1.1 billion in USDC connected to the incident.',
        href: 'https://www.circle.com/blog/the-binance-incident-collective-defense-must-move-at-machine-speed',
        source: 'Circle blog post',
      },
    ],
    closing: 'In this case, freezing was part of a theft response. It also showed that an issuer can stop movement of the asset it issues.',
  },
};

export const token = {
  title: 'The cold facts.',
  /** The site's single memecoin notice. */
  notice:
    'Independent memecoin parody. No dollar peg, dollar backing or redemption. Not affiliated with Tether, Circle or Binance. Cryptoassets can lose all their value.',
  networkPending: 'To be announced',
  contractPending: 'Not available yet',
  freezeAuthority: {
    label: 'Freeze authority',
    /** Before launch: there is no contract to check yet. */
    planned: 'Planned: none; not yet verifiable',
    /** Live, but the deployed token's permissions have not been checked yet. */
    pending: 'Planned: none; verification pending',
    /** Live and checked on-chain (freeze authority and token extensions). */
    verified: 'None',
  },
  statusLabels: { prelaunch: 'Pre-launch', live: 'Live' },
  prelaunchNote: 'Official token links will appear here when available.',
};

export const memes = {
  title: ['Some people hold dollars.', 'Some people hold opinions about dollars.'],
  body: ['$USDFU is for the second group.', 'Make the image. Pass the line around. Keep it cold.'],
  posters: [
    { slug: 'frozen-still-moving', line: 'FROZEN. STILL MOVING.' },
    { slug: 'your-keys-our-freezer', line: 'YOUR KEYS. OUR FREEZER.' },
    { slug: 'no-thawing-required', line: 'NO THAWING REQUIRED.' },
  ],
  below: 'Hold the meme. Question the money.',
} as const;

/**
 * FAQ. An answer may be a list of paragraphs, or `byLaunchState` with the
 * pre-launch / unverified wording and the wording for a verified live token.
 * "The cold facts" inside an answer links to that section.
 */
export interface FaqItem {
  q: string;
  a?: readonly string[];
  byLaunchState?: { designed: readonly string[]; verified: readonly string[] };
}

export const faq: readonly FaqItem[] = [
  {
    q: 'Is Frozen USD a stablecoin?',
    a: ['Only if stability is measured in degrees Celsius. For the token’s monetary details, see The cold facts.'],
  },
  {
    q: 'How can it be frozen and still move?',
    a: ['The reserve stays frozen. $USDFU changes wallets. The freezer has no vote in the transfer.'],
  },
  {
    q: 'Does frozen mean locked?',
    a: ['No. Frozen describes the reserve, not a lock on the holder’s token account.'],
  },
  {
    q: 'Can the issuer freeze my $USDFU?',
    byLaunchState: {
      designed: [
        '$USDFU is designed without an issuer freeze authority. The live contract and its permissions will be linked in The cold facts.',
      ],
      verified: ['The mint has no issuer freeze authority. Check the linked contract and permissions in The cold facts.'],
    },
  },
  {
    q: 'What if tokens are stolen?',
    a: ['No issuer freeze switch also means no issuer rescue switch. Protect your keys.'],
  },
  {
    q: 'Why hold $USDFU?',
    a: ['Because some opinions about money deserve their own ticker.'],
  },
  {
    q: 'What is USDFU pegged to?',
    a: ['One USDFU. One institutional-grade ice cube. The ratio has been reviewed by the refrigeration department.'],
  },
  {
    q: 'What backs it?',
    a: ['Our Strategic Ice Reserve in Antarctica. We maintain it in solid form.'],
  },
];

export const closing = {
  title: 'Put a cold idea into circulation.',
  signature: 'Frozen. Still moving.',
  signOff: 'Keep it cold.',
};

export const footer = {
  tagline: 'Frozen USD — Frozen. Still moving.',
};

export const notFound = {
  title: "This dollar moved. The page didn't.",
  body: "We couldn't find that page. The homepage is still available.",
  action: 'Back to Frozen USD',
};

export const seo = {
  /** Browser tab title. */
  title: 'USDFU - Frozen USD',
  /** Title used when the page is shared (Open Graph / X), unchanged. */
  shareTitle: 'Frozen USD — Frozen. Still moving.',
  /** Page and share description: "designed to" until the live token is verified. */
  description: {
    designed:
      'Frozen USD ($USDFU) is a memecoin parody of issuer-controlled digital dollars. The reserves are ice. The token is designed to move without an issuer freeze authority. Frozen. Still moving.',
    verified:
      'Frozen USD ($USDFU) is a memecoin parody of issuer-controlled digital dollars. The reserves are ice. The token moves without an issuer freeze authority. Frozen. Still moving.',
  },
};

export const actions = {
  explore: 'Explore frozen finance',
  tokenDetails: 'Token details',
  buy: 'Buy $USDFU',
  /** Hero purchase button (live only). */
  buyOnPump: 'Buy on pump.fun',
  coldFacts: 'The cold facts',
  followX: 'Follow on X',
  community: 'Join the community',
  copy: 'Copy',
  explorer: 'Explorer',
  trade: 'Trade',
};

# Launch checklist

The website ships in pre-launch mode. Switching to live is one file and one deploy.

## Before you edit anything

Verify these yourself on-chain and on the trading platform. The website cannot check them for you.

- [ ] The token is created and the **mint/contract address** is final.
- [ ] The **trading page URL** (e.g. the pump.fun coin page) is for that exact address.
- [ ] The **explorer URL** (e.g. Solscan) is for that exact address.
- [ ] Any **X** or **community** links are the official accounts.
- [ ] `frozenusd.com` is attached to the Vercel project and resolves (Vercel → Project → Settings → Domains).

## Edit `src/config/site.ts`

| Field | Pre-launch (committed) | Live |
|---|---|---|
| `token.status` | `'prelaunch'` | `'live'` |
| `token.network` | `null` | `'solana'` (pump.fun) or another key from `NETWORKS` in `src/config/schema.ts` |
| `token.contractAddress` | `null` | the real address, exactly as shown on the explorer |
| `token.tradeUrl` | `null` | `https://…` trading page |
| `token.explorerUrl` | `null` | `https://…` explorer page containing the address |
| `social.xUrl` | `null` | `https://x.com/…` or keep `null` |
| `social.communityUrl` | `null` | `https://…` or keep `null` |
| `canonicalOrigin` | `'https://frozenusd.com'` | keep (already the purchased domain) |

Leave every unknown value as `null`. Never type a placeholder.

## Check, then deploy

1. Optional local check: `npm run build`. An invalid live configuration fails with a list of the problems.
2. Commit and push (or open a pull request). Vercel builds a preview; open it and confirm:
   - the header and hero say **Buy $FUSD** and link to the trading page;
   - the hero and **The cold facts** show the full address, and **Copy** puts that exact address on the clipboard;
   - **Explorer** opens the correct token page;
   - **Follow on X** appears only if you set `xUrl`.
3. Merge to the production branch. Vercel redeploys production. **The site is static: nothing changes until this new deployment finishes.**

## What changes in live mode

- Header action: *Buy $FUSD* now opens the trading page instead of the token facts.
- Hero actions: *Buy $FUSD* + *Explore frozen finance*.
- Contract strip and token facts: real address with Copy and Explorer.
- Token facts: network label, status *Live*, Buy action.
- Closing action: *Buy $FUSD*.
- Footer: Trade and Explorer links (and X/community when set).
- Indexing: only when `status` is `'live'`, `canonicalOrigin` is set, and the deployment is Vercel production. Then the page gets `index, follow`, a canonical URL, and `sitemap.xml`.

## Rolling back

Set `token.status` back to `'prelaunch'` and the launch fields back to `null`, then redeploy. Or use Vercel's **Instant Rollback** to the previous deployment.

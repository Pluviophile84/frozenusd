# Design references

## Selected references

| Reference | Role | Aspects intended to inform the design |
|---|---|---|
| https://www.usdc.com/ | Primary | Standalone digital-dollar product site: product promise first, calm confidence, one clear action beside the explanation |
| https://tether.to/en/ | Secondary | Token-focused issuer presentation; facts and token details presented as plain, verifiable information |
| https://www.circle.com/usdc | Supporting | Business-product page rhythm: editorial headline scale, generous whitespace, fine rules between modules |

Nothing was copied from these sites: no identity, branding, source code, partner logos, testimonials, imagery or text. The USDC sponsorship campaign was not used.

## Limitation

During this build, the sandbox's network policy refused connections to all three domains (HTTP 403 at the egress proxy), so **their rendered desktop and mobile layouts were not visually inspected**. The design follows the explicit art direction in the build prompt, together with general familiarity with how stablecoin issuers present products. Before relying on the references for later refinements, review them in a browser.

## How the art direction was applied

- **Bright, composed surfaces:** white and frost backgrounds, deep-ink type, cyan used for emphasis, marks and the product only. One dark-ink section carries the satire.
- **Issuer-grade hierarchy:** one large H1, controlled H2 scale, Manrope only, mono reserved for addresses and diagram labels.
- **Varied composition, few cards:** hero split (copy left, product right), idea split (object left, text right), product demonstration on a shared route, three-part benefits divided by fine rules, monumental dark satire, specification-sheet token facts, posters, FAQ list, centred close.
- **Humour in the product details:** "Location: updated / Temperature: unchanged", the travelling block, "In transit", and the Fictional Proof of Cold receipt carry the joke while the interface stays serious.
- **Motion:** one understated 14-second loop inside the artwork (travel, hop, shadow), a native-checkbox pause switch, automatic pause off-screen, no motion for reduced-motion users.

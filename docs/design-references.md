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

- **Bright, composed surfaces:** white and frost backgrounds, deep-ink type, cyan used for emphasis, marks and the product only. Two dark-ink sections, Reserves and the satire, are separated by light sections.
- **Issuer-grade hierarchy:** one large H1, controlled H2 scale, Manrope only, mono reserved for addresses and diagram labels.
- **Varied composition, few cards:** hero split (copy left, orbit right), dark Reserves statement with a ruled three-part fact row, idea split (object left, text right), product demonstration on a shared route, three-part benefits divided by fine rules, monumental dark satire, specification-sheet token facts, posters, FAQ list, centred close.
- **Humour in the product details:** the ice-cube peg and Strategic Ice Reserve, "In transit", and the Fictional Proof of Cold receipt carry the joke while the interface stays serious.
- **Motion:** the hero orbit uses a Tether-inspired mechanism implemented locally (no Tether graphics or code): a stationary centre cube, three cubes orbiting clockwise and eight counter-clockwise, 100 s per revolution, linear. Each cube rides a rotating carrier with an exactly opposite counter-rotation so it stays upright. Dashed guides: outer and inner rings plus three offset lobes (radius = half the outer radius) meeting at the centre. One native-checkbox pause switch; automatic pause off-screen and in hidden tabs without overriding a user pause; a static composition for reduced motion.

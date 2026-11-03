Frozen USD — approved ice cube (refined, chat-supplied revision)

frozen-usd-ice-cube-as-received.webp
  The image exactly as attached by the owner: 1254 x 1254, RGBA. Translucent
  ice (about 63% of pixels partially transparent), opaque cyan coin with the
  emblem, transparent exterior (edge alpha 0–8 of 255).

frozen-usd-ice-cube-master.png
  Lossless PNG decode of exactly those pixels and alpha. Master for all exports.

public/media/cube/frozen-usd-ice-cube-{128,256,512,1024}.webp
  Downscaled from the master by `npm run assets` (sharp, Lanczos, alpha kept,
  never upscaled).

Use at normal opacity with contain; never crop, recolour, fade or overlay it.
SHA256SUMS.txt records all of the above; tests/brand.test.mjs verifies it.

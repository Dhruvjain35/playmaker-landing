FONTS SHIPPED WITH PLAYMAKR
===========================

hanken-grotesk-latin.woff2      Hanken Grotesk, variable weight 400..700, latin subset
hanken-grotesk-latin-ext.woff2  Hanken Grotesk, variable weight 400..700, latin-ext subset
jetbrains-mono-latin.woff2      JetBrains Mono, variable weight 400..500, latin subset
jetbrains-mono-latin-ext.woff2  JetBrains Mono, variable weight 400..500, latin-ext subset

Both families are licensed under the SIL Open Font License 1.1, which permits
self-hosting and redistribution as part of this site.

  Hanken Grotesk  Copyright (c) Alfredo Marco Pradil. OFL-1.1.
                  https://github.com/marcologous/hanken-grotesk
  JetBrains Mono  Copyright (c) JetBrains. OFL-1.1.
                  https://github.com/JetBrains/JetBrainsMono

SWAPPING IN ABC REPRO
---------------------
ABC Repro is proprietary and is NOT in this repo and must never be committed here.
If a license is ever bought, the display face swaps in with a one file change:
drop the woff2 into this folder, add one @font-face block named 'Repro' at the top
of styles.css, and change the single --font-display line in :root to lead with it.
Nothing else in the codebase names a display font.

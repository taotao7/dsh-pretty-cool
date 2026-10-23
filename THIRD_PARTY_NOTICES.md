# Third-party notices

## oh-my-pi design reference

The 1.2.1 prompt panel, integrated status placement and thinking-level cycle are informed by [oh-my-pi](https://github.com/can1357/oh-my-pi) and its [custom editor](https://github.com/can1357/oh-my-pi/blob/main/packages/tui/src/prompt/custom-editor.ts). The DSH controls are an original implementation using native DSH services; no OMP runtime or source code is bundled. DSH’s omitted provider default is used for Auto, rather than OMP’s prompt-classification behavior.

## ReactBits Pro

Visual primitives adapted from the user's authorized installed sources:

- `../src/components/blocks/app-shell-1.tsx`: compact navigation row geometry, restrained surfaces, type scale, keyboard focus treatment.
- `../src/components/blocks/prompt-input-1.tsx`: ghost/secondary control treatment, 120 ms easing and press feedback.

The source was previously installed through the user's licensed ReactBits registry. This package uses scoped CSS and Motion in place of the demo's Tailwind classes and demo state. No freight records, chat responses, fake streaming or sample metrics are included. Premium source remains subject to the user's ReactBits license; this private integration grants no separate resale or redistribution rights. No registry credentials are included.

## Pixel-Perfect

Selected-panel indicator in `src/sidebar.tsx` is adapted from `TabBackgroundAnimation` at commit `49f74881cd5baa87ee1a2fd666bc8a7638a24fbb`:
https://github.com/vansh-nagar/Pixel-Perfect/blob/49f74881cd5baa87ee1a2fd666bc8a7638a24fbb/public/r/tab-background-animation.json

Changes: actual DSH panel selection replaces demo hover state; scoped LayoutGroup isolates occurrences; neutral alias tokens replace hardcoded colors; disabled transform animation under reduced motion; no scale overshoot.

MIT License

Copyright (c) 2026 Vansh Nagar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Motion

Motion 14.6.0, Framer Motion, motion-dom and motion-utils are used for brief interaction feedback. The following MIT terms cover these bundled packages.

The MIT License (MIT)

Copyright (c) 2024 Motion B.V.
Copyright (c) 2018 Framer B.V.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

React and ReactDOM are provided by DeepSeek Harness, not duplicated in this bundle. The bundle icon and simple control glyphs are original artwork created for this integration.

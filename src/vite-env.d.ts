/// <reference types="vite/client" />

// The installed vite-imagetools version (^9.0.3, pinned down from latest because
// vite-imagetools@10+ requires vite@>=7 and this project pins vite@^6) does not ship
// a `vite-imagetools/client` type-declarations subpath (verified: no `client.d.ts`
// and no matching entry in its package.json `exports` map across 5.x-10.x). Declaring
// the module shape for the `?w=...&format=webp` imagetools query directives directly
// here is the working substitute for that reference.
declare module '*&format=webp' {
  const src: string;
  export default src;
}

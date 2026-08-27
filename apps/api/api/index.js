// Vercel serverless entrypoint. vercel.json rewrites every request here;
// the Express app still does its own internal routing based on the original
// req.url that Vercel preserves through the rewrite.
//
// This is deliberately plain .js, not .ts: @vercel/node runs its own
// TypeScript type-check on any .ts file under /api regardless of what it
// imports, and this codebase has pre-existing type errors that local dev
// already tolerates via ts-node-dev's --transpile-only. Requiring the
// tsc-compiled output (dist/, built by the Vercel "Build Command") from a
// .js file sidesteps that check entirely.
module.exports = require('../dist/index').default

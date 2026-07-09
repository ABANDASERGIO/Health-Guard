# ES Module import compatibility refactor (backend-api)

## Steps
- [ ] Update `backend-api/tsconfig.json` to use `module: NodeNext` and `moduleResolution: NodeNext`.
- [ ] Update all relative imports in `backend-api/src/**/*.ts` to include `.js` extension.
  - Includes: server.ts, routes/*, controllers/*, services/*, middleware/*, any helpers/utils.
- [ ] Run `npm run build` in `backend-api/` and fix any TypeScript/module errors.
- [ ] Sanity-check compiled output by running `node dist/server.js` locally (if possible).


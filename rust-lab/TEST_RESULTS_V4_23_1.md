# Open IPTV Pro v4.23.1 — Test Plan / Results

- `npm test` runs all Node.js unit/integration tests.
- Smart Discovery added tests for Check All >1,000 channels, concurrency ≤ configured workers, explicit import and safe cancellation.
- Catalog URL allowlist, invalid playlist rejection, and older Full Desktop tests remain enabled.
- A green unit test does not mean packaged DMG/EXE or thousands of remote streams were verified on hardware.

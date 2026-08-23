# How to release?

1. Update version in `package.json`
2. `git commit -m "vX.Y.Z"` & `git tag -a "vX.Y.Z" -m "vX.Y.Z"`
3. `git push && git push --tags`
4. `pnpm build`
5. Optionally `npm package` to verify which files would be part of the package.
6. `npm publish`

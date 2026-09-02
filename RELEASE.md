# How to release?

1. Update version in `package.json`
2. Update CHANGELOG 
3. `git commit -m "vX.Y.Z"` & `git tag -a "vX.Y.Z" -m "vX.Y.Z"`
4. `git push && git push --tags`
5. `pnpm build`
6. Optionally `npm package` to verify which files would be part of the package.
7. `npm publish`

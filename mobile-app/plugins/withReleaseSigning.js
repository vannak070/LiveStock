/**
 * Wires our release keystore into android/app/build.gradle every time
 * `expo prebuild` regenerates it. That whole `android/` folder is
 * gitignored and rebuilt from scratch on every prebuild, so a hand edit to
 * build.gradle (e.g. pointing `release` at a real signing config instead of
 * the debug keystore) would otherwise be silently lost the next time
 * someone runs `expo prebuild --clean`.
 *
 * Credentials are read from keystore/keystore.properties at prebuild time
 * (both gitignored, never committed) rather than being baked into this
 * file or app.json.
 *
 * If no keystore.properties exists yet, this is a no-op — release builds
 * fall back to Expo's default (debug-signed) behavior instead of failing.
 */
const { withAppBuildGradle } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function loadKeystoreProps(projectRoot) {
  const propsPath = path.join(projectRoot, 'keystore', 'keystore.properties');
  if (!fs.existsSync(propsPath)) return null;
  const raw = fs.readFileSync(propsPath, 'utf8');
  const props = {};
  raw.split('\n').forEach(line => {
    const m = line.match(/^([A-Za-z]+)\s*=\s*(.*)$/);
    if (m) props[m[1]] = m[2].trim();
  });
  return props.storeFile && props.storePassword && props.keyAlias && props.keyPassword ? props : null;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, cfg => {
    const props = loadKeystoreProps(cfg.modRequest.projectRoot);
    if (!props) {
      console.log('[withReleaseSigning] No keystore/keystore.properties found — leaving release build debug-signed.');
      return cfg;
    }

    let contents = cfg.modResults.contents;
    const relativeStorePath = path.posix.join('..', '..', 'keystore', props.storeFile);

    const releaseSigningBlock = `        release {
            storeFile file('${relativeStorePath}')
            storePassword '${props.storePassword}'
            keyAlias '${props.keyAlias}'
            keyPassword '${props.keyPassword}'
        }
`;

    if (!contents.includes(`storeFile file('${relativeStorePath}')`)) {
      const anchor = /signingConfigs\s*\{\n/;
      if (!anchor.test(contents)) {
        console.warn('[withReleaseSigning] Could not find `signingConfigs {` in build.gradle — skipping (template may have changed).');
        return cfg;
      }
      contents = contents.replace(anchor, match => `${match}${releaseSigningBlock}`);
    }

    // Point the release buildType at our new `release` signingConfig
    // instead of the debug keystore Expo's template defaults to. Anchored
    // on the two comment lines above it (unique to the release block) so
    // this never touches the debug buildType's own (correct) debug signing.
    const releaseBlockAnchor = /(\/\/ Caution! In production, you need to generate your own keystore file\.\s*\n\s*\/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\s*\n\s*)signingConfig signingConfigs\.debug/;
    if (releaseBlockAnchor.test(contents)) {
      contents = contents.replace(releaseBlockAnchor, (_match, prefix) => `${prefix}signingConfig signingConfigs.release`);
    } else if (!contents.includes('signingConfig signingConfigs.release')) {
      console.warn('[withReleaseSigning] Could not find the release buildType\'s debug signingConfig line — release build may still be debug-signed.');
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
};

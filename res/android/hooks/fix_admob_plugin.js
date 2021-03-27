console.log('================================');
console.log('RUNNING SCRIPT fix_admob_plugin');

var fs = require('fs');
var path = require('path');
var rootDir = process.argv[2];

var eventsFile = path.join(
  rootDir,
  '../res/android/hooks/files/admob/Events.java',
);
var eventsFileEndPoint = path.join(
  rootDir,
  '../platforms/android/app/src/main/java/admob/plugin/Events.java',
);
var rewardedVideoAdFile = path.join(
  rootDir,
  '../res/android/hooks/files/admob/RewardedVideoAd.java',
);
var rewardedVideoAdFileEndPoint = path.join(
  rootDir,
  '../platforms/android/app/src/main/java/admob/plugin/ads/RewardedVideoAd.java',
);

try {
  fs.copyFileSync(eventsFile, eventsFileEndPoint, () => {
    console.log('Events.java copied');
  });
  fs.copyFileSync(rewardedVideoAdFile, rewardedVideoAdFileEndPoint, () => {
    console.log('RewardedVideoAd.java copied');
  });
  console.log('AdMob plugin fixed');
} catch (e) {
  console.log(e);
}

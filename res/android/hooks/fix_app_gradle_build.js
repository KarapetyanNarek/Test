console.log('================================');
console.log('RUNNING SCRIPT fix_app_gradle_build');

var fs = require('fs');
var path = require('path');
var rootDir = process.argv[2];
var buildScript = path.join(rootDir, '../platforms/android/app/build.gradle');
var wrongVersion = "'com.android.tools.build:gradle:3.3.0'";
var targetVersion = "'com.android.tools.build:gradle:3.2.1'";

var referencePoint =
  'implementation "com.google.android.gms:play-services-ads:+"';
var newImplementations = [
  "implementation 'com.google.android.gms:play-services-location:11.+'",
  "implementation 'com.google.android.gms:play-services-base:+'",
  "implementation 'com.android.support:multidex:1.0.3'",
];

try {
  fs.readFile(buildScript, 'utf8', function(err, data) {
    if (err) return console.log(err);
    var result = data;
    result = result.replace(wrongVersion, targetVersion);
    var referencePointIndex =
      result.indexOf(referencePoint) + referencePoint.length;
    for (var i = 0; i < newImplementations.length; i++) {
      result = [
        result.slice(0, referencePointIndex),
        newImplementations[i],
        result.slice(referencePointIndex),
      ].join('\n');
    }
    fs.writeFile(buildScript, result, 'utf8', () => {
      console.log('app gradle build fixed');
    });
  });
} catch (e) {
  console.log(e);
}

console.log('================================');
console.log('RUNNING SCRIPT migrate_to_androidX');

var fs = require('fs');
var path = require('path');
var rootDir = process.argv[2];
var propertiesFile = path.join(
  rootDir,
  '../platforms/android/gradle.properties',
);

try {
  fs.readFile(propertiesFile, 'utf8', function(err, data) {
    if (err) return console.log(err);
    var result = data;
    result += '\nandroid.useAndroidX=true\nandroid.enableJetifier=true';

    fs.writeFile(propertiesFile, result, 'utf8', () => {
      console.log('app migrated to AndroidX');
    });
  });
} catch (e) {
  console.log(e);
}

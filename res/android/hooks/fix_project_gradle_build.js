console.log('================================');
console.log('RUNNING SCRIPT fix_gradle_build');

var fs = require('fs');
var path = require('path');
var rootDir = process.argv[2];
var projectBuildScript = path.join(
  rootDir,
  '../platforms/android/build.gradle',
);

var javaVersionVariable = 'ext.java_version= JavaVersion.VERSION_1_8';
var affectedVersion = "'com.android.tools.build:gradle:3.3.0'";
var targetVersion = "'com.android.tools.build:gradle:3.2.1'";
var googleServicesDependency =
  "classpath 'com.google.gms:google-services:4.2.0'";

// fixing project build script
try {
  fs.readFile(projectBuildScript, 'utf8', function(err, data) {
    if (err) return console.log(err);
    var result = data;
    result = result.replace(
      affectedVersion,
      targetVersion +
        '\n' +
        googleServicesDependency +
        '\n' +
        javaVersionVariable,
    );

    fs.writeFile(projectBuildScript, result, 'utf8', () => {
      console.log('project build.gradle fixed');
    });
  });
} catch (e) {
  console.log(e);
}

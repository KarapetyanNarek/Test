console.log('================================');
console.log('RUNNING SCRIPT fix_ionic_webViewEngine');

var fs = require('fs');
var path = require('path');
var rootDir = process.argv[2];
var gradeFilePath = path.join(
  rootDir,
  '../platforms/android/app/src/main/java/com/ionicframework/cordova/webview/IonicWebViewEngine.java',
);

var targetImport = 'import android.support.annotation.RequiresApi;';
var fixedImport = 'import androidx.annotation.RequiresApi;';
try {
  fs.readFile(gradeFilePath, 'utf8', function(err, data) {
    if (err) return console.log(err);
    var result = data;
    result = result.replace(targetImport, fixedImport);
    fs.writeFile(gradeFilePath, result, 'utf8', () => {
      console.log('ionic webViewEngine imports fixed');
    });
  });
} catch (e) {
  console.log(e);
}

console.log('================================');
console.log('RUNNING SCRIPT addWebViewChecker');

var fs = require('fs');
var path = require('path');
var rootDir = process.argv[2];
var mainActivityFile = path.join(
  rootDir,
  '../platforms/android/app/src/main/java/com/kingsofdurak/candywings/MainActivity.java',
);
var webViewCheckerFile = path.join(
  rootDir,
  '../res/android/hooks/files/webViewChecker/WebViewChecker.java',
);
var webViewCheckerFileEndPoint = path.join(
  rootDir,
  '../platforms/android/app/src/main/java/com/kingsofdurak/candywings/WebViewChecker.java',
);

var mainActivityAdditionalCode =
  'WebViewChecker checker = new WebViewChecker(this);\nif(!checker.check()){\n    loadUrl(launchUrl);\n};';
try {
  fs.readFile(mainActivityFile, 'utf8', function(err, data) {
    if (err) return console.log(err);
    var result = data;
    result = result.replace('loadUrl(launchUrl);', mainActivityAdditionalCode);
    fs.writeFile(mainActivityFile, result, 'utf8', () => {});
  });
  fs.copyFile(webViewCheckerFile, webViewCheckerFileEndPoint, () => {
    console.log('WebViewChecker implemented');
  });
} catch (e) {
  console.log(e);
}

console.log('================================');
console.log('RUNNING SCRIPT remove_unsupported_plugins');

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var rootDir = process.argv[2];
var cordovaPluginsFile = path.join(
  rootDir,
  '../platforms/browser/www/cordova_plugins.js',
);
var cordovaPluginsFolder = path.join(
  rootDir,
  '../platforms/browser/www/plugins',
);

var unsupportedPlugins = ['heyzap', 'insomnia', 'fullscreen', 'statusbar'];

try {
  fs.readFile(cordovaPluginsFile, 'utf8', function(err, data) {
    if (err) return console.log(err);
    var result = data;
    result = removeFromMetadata(result);
    result = removeFromExports(result);
    fs.writeFile(cordovaPluginsFile, result, 'utf8', () => {
      removeFiles();
    });
  });
} catch (e) {
  console.log(e);
}

function removeFromExports(result) {
  var start = result.indexOf('[');
  var end = result.lastIndexOf(']') + 1;
  var exportsString = result.substring(start, end);
  var exportsObject = JSON.parse(exportsString);
  var keys = Object.keys(exportsObject);
  for (let i = keys.length - 1; i >= 0; i--) {
    var exportObejct = exportsObject[keys[i]];
    for (var ii = 0; ii < unsupportedPlugins.length; ii++) {
      if (exportObejct.file.indexOf(unsupportedPlugins[ii]) !== -1) {
        delete exportsObject[keys[i]];
        break;
      }
    }
  }
  var resultArray = [];
  for (let i = 0; i < exportsObject.length; i++) {
    !!exportsObject[i] && resultArray.push(exportsObject[i]);
  }
  var resultArrayString = JSON.stringify(resultArray);
  var newResult = result.replace(exportsString, resultArrayString);
  return newResult;
}

function removeFromMetadata(result) {
  var metadataStartIndex = result.lastIndexOf('{');
  var metadataObjectString = result.substring(
    metadataStartIndex,
    result.length,
  );
  var metadataEndIndex = metadataObjectString.indexOf('}');
  metadataObjectString = result.substring(
    metadataStartIndex,
    metadataStartIndex + metadataEndIndex + 1,
  );
  try {
    var object = JSON.parse(metadataObjectString);
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
      for (var ii = 0; ii < unsupportedPlugins.length; ii++) {
        if (keys[i].indexOf(unsupportedPlugins[ii]) !== -1) {
          delete object[keys[i]];
          break;
        }
      }
    }

    var newMetadata = JSON.stringify(object);
    var newResult = result.replace(metadataObjectString, newMetadata);
    return newResult;
  } catch (error) {
    return result;
  }
}

function removeFiles() {
  fs.readdir(cordovaPluginsFolder, 'utf-8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    for (var i = 0; i < data.length; i++) {
      for (var ii = 0; ii < unsupportedPlugins.length; ii++) {
        if (data[i].indexOf(unsupportedPlugins[ii]) !== -1) {
          const dir = path.join(
            rootDir,
            '../platforms/browser/www/plugins/' + data[i],
          );
          rimraf.sync(dir);
        }
      }
    }
    console.log('unsupported plugins removed from browser platform');
  });
}

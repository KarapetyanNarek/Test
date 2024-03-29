const dirTree = require('directory-tree');
const shell = require('shelljs');
const fs = require('fs');

const assetsClassFile = 'src/assets.ts';

tree = dirTree('./assets/', {
  normalizePath: true,
  extensions: /\.json|xml|png|jpg|cur|jpeg|mp3|ogg|ttf|json$/,
});

const toCamelCase = string => {
  return string
    .replace(/[^A-Za-z0-9]/g, ' ')
    .replace(/^\w|[A-Z]|\b\w|\s+/g, (match, index) => {
      if (match === ' ' || match === '-' || match === '.') {
        return '';
      }
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

const toPascalCase = string => {
  const camelCase = toCamelCase(string);
  return camelCase[0].toUpperCase() + camelCase.substr(1);
};

const handleAssetTree = (node, extension, extensionPair) => {
  if (node.type === 'directory') {
    if (node.children.length === 0) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Warning!!!\nEmpty directory ${node.path}`,
      );
    } else {
      shell
        .ShellString(`\nexport namespace  ${toPascalCase(node.name)} {`)
        .toEnd(assetsClassFile);

      node.children.forEach(childNode =>
        handleAssetTree(childNode, extension, extensionPair),
      );

      shell.ShellString(`\n}`).toEnd(assetsClassFile);
    }
  } else {
    if (node.extension === `.${extension}`) {
      const name = node.name.substring(0, node.name.indexOf('.'));
      shell
        .ShellString('\nexport class ' + toPascalCase(name) + ' {')
        .toEnd(assetsClassFile);
      shell
        .ShellString(`\npublic static Name: string =  '${name}'`)
        .toEnd(assetsClassFile);

      shell
        .ShellString(
          `\npublic static ${toPascalCase(extension + 'URL')}: string =  '${
            node.path
          }'`,
        )
        .toEnd(assetsClassFile);

      const pairPath = node.path.replace(extension, extensionPair);

      if (fs.existsSync(pairPath)) {
        shell
          .ShellString(
            `\npublic static ${toPascalCase(
              extensionPair + 'URL',
            )}: string =  '${pairPath}'`,
          )
          .toEnd(assetsClassFile);
      } else {
        shell.ShellString(`\n/* missing source pair */`).toEnd(assetsClassFile);
        shell
          .ShellString(
            `\n/* public static ${toPascalCase(
              extensionPair + 'URL',
            )}: string =  '${pairPath}'*/`,
          )
          .toEnd(assetsClassFile);
        !!extensionPair &&
          console.warn(
            '\x1b[33m%s\x1b[0m',
            `Warning!!!\nFile pair ${name}.${extensionPair} for  ${name}.${extension} is missing`,
          );
      }
      shell.ShellString(`\n}`).toEnd(assetsClassFile);
    }
  }
};

const handleAtlasesTree = node => {
  if (node.type === 'directory') {
    if (node.children.length === 0) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Warning!!!\nEmpty directory ${node.path}`,
      );
    } else {
      shell
        .ShellString(`\nexport namespace  ${toPascalCase(node.name)} {`)
        .toEnd(assetsClassFile);
      node.children.forEach(childNode => handleAtlasesTree(childNode));
      shell.ShellString(`\n}`).toEnd(assetsClassFile);
    }
  } else {
    if (node.extension === '.json') {
      try {
        const fileData = fs.readFileSync(node.path, 'ascii');
        const json = JSON.parse(fileData);

        const name = node.name.substring(0, node.name.indexOf('.'));

        shell
          .ShellString(`\nexport namespace  ${toPascalCase(name)} {`)
          .toEnd(assetsClassFile);
        shell
          .ShellString('\nexport class ' + toPascalCase('atlas') + ' {')
          .toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static Name: string =  '${name}'`)
          .toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static AtlasURL: string =  '${node.path}'`)
          .toEnd(assetsClassFile);
        if (json.textures) {
          shell
            .ShellString(
              `\npublic static TextureURL: string =  '${node.path.replace(
                '.json',
                '.png',
              )}'`,
            )
            .toEnd(assetsClassFile);
        } else {
          shell
            .ShellString(
              `\npublic static TextureURL: string =  '${node.path.replace(
                'json',
                'png',
              )}'`,
            )
            .toEnd(assetsClassFile);
        }

        shell.ShellString(`\n}`).toEnd(assetsClassFile);

        shell.ShellString(`\nexport namespace  Atlas {`).toEnd(assetsClassFile);
        shell.ShellString(`\nexport enum Frames {`).toEnd(assetsClassFile);
        if (json.textures) {
          for (const texture of json.textures) {
            for (let frame in texture.frames) {
              frameFull = `${texture.frames[frame].filename}`;
              indexOfExtension = frameFull.lastIndexOf('.');
              frame =
                indexOfExtension === -1
                  ? frameFull
                  : frameFull.substring(0, indexOfExtension);
              shell
                .ShellString(`\n ${toPascalCase(frame)} = '${frameFull + ''}',`)
                .toEnd(assetsClassFile);
            }
          }
        } else {
          for (let frame in json['frames']) {
            frameFull = json['frames'][frame]['filename'];
            indexOfExtension = frameFull.lastIndexOf('.');
            frame =
              indexOfExtension === -1
                ? frameFull
                : frameFull.substring(0, indexOfExtension);
            shell
              .ShellString(`\n ${toPascalCase(frame)} = '${frameFull}',`)
              .toEnd(assetsClassFile);
          }
        }
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Atlas Data File Error: ${e}`);
      }
    }
  }
};

const handleMultiAtlasesTree = node => {
  if (node.type === 'directory') {
    if (node.children.length === 0) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Warning!!!\nEmpty directory ${node.path}`,
      );
    } else {
      shell
        .ShellString(`\nexport namespace  ${toPascalCase(node.name)} {`)
        .toEnd(assetsClassFile);
      node.children.forEach(childNode => handleMultiAtlasesTree(childNode));
      shell.ShellString(`\n}`).toEnd(assetsClassFile);
    }
  } else {
    if (node.extension === '.json') {
      try {
        const fileData = fs.readFileSync(node.path, 'ascii');
        const json = JSON.parse(fileData);
        const name = node.name.substring(0, node.name.indexOf('.'));

        shell
          .ShellString(`\nexport namespace  ${toPascalCase(name)} {`)
          .toEnd(assetsClassFile);
        shell
          .ShellString('\nexport class ' + toPascalCase('atlas') + ' {')
          .toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static Name: string =  '${name}'`)
          .toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static AtlasURL: string =  '${node.path}'`)
          .toEnd(assetsClassFile);
        shell
          .ShellString(
            `\npublic static TextureURL: string =  '${node.path.replace(
              node.name,
              '',
            )}'`,
          )
          .toEnd(assetsClassFile);

        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\nexport namespace  Atlas {`).toEnd(assetsClassFile);
        shell.ShellString(`\nexport enum Frames {`).toEnd(assetsClassFile);
        if (json.textures) {
          for (const texture of json.textures) {
            for (let frame in texture.frames) {
              frameFull = `${texture.frames[frame].filename}`;
              indexOfExtension = frameFull.lastIndexOf('.');
              frame =
                indexOfExtension === -1
                  ? frameFull
                  : frameFull.substring(0, indexOfExtension);
              shell
                .ShellString(`\n ${toPascalCase(frame)} = '${frameFull + ''}',`)
                .toEnd(assetsClassFile);
            }
          }
        } else {
          for (let frame in json['frames']) {
            frameFull = json['frames'][frame]['filename'];
            indexOfExtension = frameFull.lastIndexOf('.');
            frame =
              indexOfExtension === -1
                ? frameFull
                : frameFull.substring(0, indexOfExtension);
            shell
              .ShellString(`\n ${toPascalCase(frame)} = '${frameFull}',`)
              .toEnd(assetsClassFile);
          }
        }
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Atlas Data File Error: ${e}`);
      }
    }
  }
};

const loopTree = node => {
  if (node.children !== void 0) {
    switch (node.name.toLowerCase()) {
      case 'atlases':
        handleAtlasesTree(node);
        break;
      case 'multiatlases':
        handleMultiAtlasesTree(node);
        break;
      case 'bitmap-fonts':
        handleAssetTree(node, 'xml', 'png');
        break;
      case 'audios':
        handleAssetTree(node, 'mp3', 'ogg');
        break;
      case 'spines':
        handleSpineTree(node, 'mp3', 'ogg');
        break;
      case 'fonts':
        handleAssetTree(node, 'ttf');
        break;
      default:
        shell
          .ShellString(`\nexport namespace ${toPascalCase(node.name)} {`)
          .toEnd(assetsClassFile);
        node.children.forEach(child => loopTree(child));
        shell.ShellString('\n}').toEnd(assetsClassFile);
        break;
    }
  } else {
    const name = node.name.substring(0, node.name.indexOf('.'));
    shell
      .ShellString('\nexport class ' + toPascalCase(name) + ' {')
      .toEnd(assetsClassFile);
    shell
      .ShellString(`\npublic static Name: string =  '${name}'`)
      .toEnd(assetsClassFile);
    shell
      .ShellString(`\npublic static FileURL: string =  '${node.path}'`)
      .toEnd(assetsClassFile);
    shell
      .ShellString(`\npublic static Extension: string =  '${node.extension}'`)
      .toEnd(assetsClassFile);
    shell
      .ShellString(`\npublic static Size: string =  '${node.size}'`)
      .toEnd(assetsClassFile);
    shell.ShellString('\n}').toEnd(assetsClassFile);
  }
};

const handleSpineTree = node => {
  if (node.type === 'directory') {
    if (node.children.length === 0) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Warning!!!\nEmpty directory ${node.path}`,
      );
    } else {
      shell
        .ShellString(`\nexport namespace  ${toPascalCase(node.name)} {`)
        .toEnd(assetsClassFile);
      node.children.forEach(childNode => handleSpineTree(childNode));
      shell.ShellString(`\n}`).toEnd(assetsClassFile);
    }
  } else {
    if (node.extension === '.json') {
      try {
        const fileData = fs.readFileSync(node.path, 'ascii');
        const json = JSON.parse(fileData);

        let name = node.name.substring(0, node.name.indexOf('.'));
        let path = node.path;
        if (name.endsWith('-sd')) {
          return;
        } else if (name.endsWith('-hd')) {
          name = name.replace('-hd', '');
          path = path.replace('-hd', '');
        }
        shell
          .ShellString(`\nexport namespace  ${toPascalCase(name)} {`)
          .toEnd(assetsClassFile);
        shell.ShellString('\nexport class Spine {').toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static Name: string =  '${name}'`)
          .toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static SkeletonURL: string =  '${path}'`)
          .toEnd(assetsClassFile);
        shell
          .ShellString(
            `\npublic static AtlasURL: string =  '${path.replace(
              'json',
              'atlas',
            )}'`,
          )
          .toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);

        shell.ShellString(`\nexport namespace  Spine {`).toEnd(assetsClassFile);
        shell.ShellString(`\nexport enum Animations {`).toEnd(assetsClassFile);
        for (let animation in json['animations']) {
          shell
            .ShellString(`\n ${toPascalCase(animation)} = '${animation}',`)
            .toEnd(assetsClassFile);
        }
        shell.ShellString(`\n}`).toEnd(assetsClassFile);

        shell.ShellString(`\nexport enum Skins {`).toEnd(assetsClassFile);
        for (let skin in json['skins']) {
          shell
            .ShellString(`\n ${toPascalCase('skin' + skin)} = '${skin}',`)
            .toEnd(assetsClassFile);
        }
        shell.ShellString(`\n}`).toEnd(assetsClassFile);

        shell.ShellString(`\nexport enum Skeleton {`).toEnd(assetsClassFile);
        shell
          .ShellString(`\nWidth =  ${json['skeleton']['width']},`)
          .toEnd(assetsClassFile);
        shell
          .ShellString(`\Height =  ${json['skeleton']['height']},`)
          .toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);

        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Skeleton Data File Error: ${e}`);
      }
    }
  }
};

const handleFontTree = node => {
  if (node.type === 'directory') {
    if (node.children.length === 0) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Warning!!!\nEmpty directory ${node.path}`,
      );
    } else {
      shell
        .ShellString(`\nexport namespace  ${toPascalCase(node.name)} {`)
        .toEnd(assetsClassFile);
      node.children.forEach(childNode => handleFontTree(childNode));
      shell.ShellString(`\n}`).toEnd(assetsClassFile);
    }
  } else {
    if (node.extension === '.ttf') {
      try {
        let name = node.name.substring(0, node.name.indexOf('.'));
        let path = node.path;
        if (name.endsWith('-sd')) {
          return;
        } else if (name.endsWith('-hd')) {
          name = name.replace('-hd', '');
          path = path.replace('-hd', '');
        }
        shell
          .ShellString(`\nexport namespace  ${toPascalCase(name)} {`)
          .toEnd(assetsClassFile);
        shell.ShellString('\nexport class Font {').toEnd(assetsClassFile);
        shell
          .ShellString(`\npublic static Name: string =  '${name}'`)
          .toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
        shell.ShellString(`\n}`).toEnd(assetsClassFile);
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Data File Error: ${e}`);
      }
    }
  }
};

shell
  .ShellString('/* AUTO GENERATED FILE. DO NOT MODIFY !!! */\n\n')
  .to(assetsClassFile);
tree.children.forEach(child => loopTree(child));

shell.exec(' tslint --fix src/assets.ts');

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/features');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.controller.js')) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });
  return arrayOfFiles;
}

const jsFiles = getAllFiles(srcDir);

jsFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;

  // Regex for async methods in classes:
  // async getAll(req, res, next) { try { ... } catch (error) { next(error); } }
  
  const classMethodRegex = /async\s+(\w+)\s*\(([^)]+)\)\s*\{\s*try\s*\{([\s\S]*?)\}\s*catch\s*\(\w+\)\s*\{\s*next\(\w+\);\s*\}\s*\}/g;

  content = content.replace(classMethodRegex, (match, funcName, params, innerContent) => {
    hasChanges = true;
    const cleanedInner = innerContent.replace(/^\s+|\s+$/g, '');
    return `${funcName} = asyncHandler(async (${params}) => {\n    ${cleanedInner}\n  });`;
  });

  if (hasChanges) {
    // ALWAYS Add import statement at the top if not exists (in the newly replaced content)
    if (!content.includes('asyncHandler')) {
      const importRegex = /import\s+.*?;/g;
      let lastImportIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const importStatement = `\nimport { asyncHandler } from "../../utils/asyncHandler.js";`;
      
      if (lastImportIndex > 0) {
        content = content.slice(0, lastImportIndex) + importStatement + content.slice(lastImportIndex);
      } else {
        content = importStatement.trim() + "\n\n" + content;
      }
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored class methods in ${file}`);
  }
});

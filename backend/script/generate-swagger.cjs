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
      if (file.endsWith('.routes.js')) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

const jsFiles = getAllFiles(srcDir);

// Mapping method names to their standard summary text
const methodSummary = {
  get: 'Retrieve',
  post: 'Create',
  put: 'Update',
  patch: 'Modify',
  delete: 'Delete'
};

jsFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  const featureName = path.basename(path.dirname(file));
  const TagName = featureName.charAt(0).toUpperCase() + featureName.slice(1);
  const routePrefix = `/api/v1/${featureName}`; // default assumption

  // We are going to find lines like: router.get("/:id", ...), router.post("/", ...)
  // But we need to handle cases where it spans multiple lines.
  // A simple regex approach that looks for router.(get|post|put|patch|delete)("path"
  
  const routeRegex = /router\.(get|post|put|patch|delete)\(\s*(['"])(.*?)\2/g;
  
  // We will build a new string since replacing directly while modifying offsets is tricky without a loop that rebuilds.
  // Actually, string.replace can work if we are careful, but what if there's already JSDoc?
  // Let's only inject if the previous line doesn't have `*/`.
  
  let offset = 0;
  let newContent = "";
  
  // To correctly insert BEFORE the matched regex, we loop through matches.
  const matches = [...content.matchAll(routeRegex)];
  
  if (matches.length > 0) {
    let lastIndex = 0;
    for (const match of matches) {
      const matchIndex = match.index;
      const method = match[1];
      const routePathRaw = match[3];
      
      // Convert express path parameters like :id to swagger format {id}
      const swaggerPath = routePathRaw.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
      
      // Determine if there are path parameters
      const pathParams = [...routePathRaw.matchAll(/:([a-zA-Z0-9_]+)/g)].map(m => m[1]);
      
      // Check if there is already a swagger comment right before this (search backwards)
      // Just check the preceding 50 characters for `*/` or `@openapi`
      const precedingText = content.substring(Math.max(0, matchIndex - 100), matchIndex);
      if (precedingText.includes('@openapi') || precedingText.includes('*/')) {
        // Skip, already documented
        continue;
      }
      
      hasChanges = true;
      
      let paramsYaml = '';
      if (pathParams.length > 0) {
        paramsYaml = `\n *     parameters:`;
        pathParams.forEach(p => {
          paramsYaml += `\n *       - in: path\n *         name: ${p}\n *         required: true\n *         schema:\n *           type: string`;
        });
      }

      // Check for auth. If the router uses requireAuth globally or on this specific route, we'll just assume security.
      // We can just boldly apply BearerAuth to everything except auth login/register.
      let securityYaml = '';
      if (featureName !== 'auth') {
        securityYaml = `\n *     security:\n *       - BearerAuth: []`;
      }
      
      const summary = `${methodSummary[method]} ${featureName} entry`;

      let swaggerBlock = `
/**
 * @openapi
 * ${routePrefix}${swaggerPath === '/' ? '' : swaggerPath}:
 *   ${method}:
 *     summary: ${summary}
 *     tags: [${TagName}]${securityYaml}${paramsYaml}
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
`;
      // Append the text before this match + the swagger block
      newContent += content.substring(lastIndex, matchIndex) + swaggerBlock;
      lastIndex = matchIndex;
    }
    newContent += content.substring(lastIndex);
    
    if (hasChanges) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Injected Swagger JSDoc into ${file}`);
    }
  }
});

// Also inject a Tag definition at the top of the file if needed. But tags are created automatically by Swagger UI if used.
console.log("Automated Swagger Injection Complete!");

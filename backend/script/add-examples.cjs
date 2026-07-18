const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/features');

const examples = {
  auth: {
    login: { email: "admin@example.com", password: "Password123!" },
    refresh: { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5c..." },
    logout: { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5c..." },
    'reset-password-request': { email: "admin@example.com" },
    'reset-password': { token: "123456", newPassword: "NewPassword123!" }
  },
  users: {
    default: { first_name: "John", last_name: "Doe", email: "john@example.com", role_id: 2, department_id: 1 }
  },
  vehicles: {
    default: {
      registration_number: "ABC-123",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      capacity_kg: 500,
      status: "active"
    }
  },
  drivers: {
    default: {
      user_id: 1,
      license_number: "LIC12345678",
      license_category: "C",
      license_expiry: "2028-01-01"
    }
  },
  trips: {
    default: {
      vehicle_id: 1,
      driver_id: 2,
      source: "New York",
      destination: "Boston",
      planned_distance: 350,
      cargo_weight: 400
    }
  },
  maintenance: {
    default: {
      vehicle_id: 1,
      maintenance_type: "repair",
      description: "Engine oil replacement",
      cost: 150.00
    }
  },
  fuel: {
    default: {
      vehicle_id: 1,
      liters: 50.5,
      cost: 75.25,
      fuel_station: "Shell",
      odometer: 15200
    }
  },
  expenses: {
    default: {
      vehicle_id: 1,
      expense_type: "toll",
      amount: 15.00,
      description: "Highway toll"
    }
  },
  departments: {
    default: {
      name: "Logistics",
      description: "Handles all fleet operations"
    }
  },
  roles: {
    default: {
      name: "Manager",
      description: "Management role"
    }
  },
  settings: {
    default: {
      theme: "dark",
      language: "en"
    }
  },
  notifications: {
    default: {
      title: "Alert",
      message: "System update required"
    }
  }
};

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

jsFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  const featureName = path.basename(path.dirname(file));
  const featureExamples = examples[featureName] || { default: { data: "example" } };

  // Match existing swagger blocks
  // /**\n * @openapi\n * /api/v1/auth/login:\n *   post:\n ... \n */
  // We want to insert `requestBody` right before `responses:`
  
  // Regex to find:
  // *   post:
  // *     summary: Create auth entry
  // *     tags: [Auth]
  // *     responses:
  
  const blockRegex = /\*\s+([a-z]+):\s*\n\s*\*\s+summary:[^\n]+\n\s*\*\s+tags:.*?(\n.*?)*?\s*\*\s+responses:/g;

  content = content.replace(blockRegex, (...args) => {
    const match = args[0];
    const method = args[1]; // First capture group
    const str = args[args.length - 1]; // Last arg is the string
    const offset = args[args.length - 2]; // Second to last is the offset
    // Only inject for POST, PUT, PATCH
    if (!['post', 'put', 'patch'].includes(method)) {
      return match;
    }
    
    // Attempt to guess the specific route name from the preceding line, e.g. /api/v1/auth/login:
    // We can just extract the path by looking backwards from the match.
    const precedingText = str.substring(Math.max(0, offset - 100), offset);
    const pathMatch = precedingText.match(/\/api\/v1\/[a-z]+\/([a-zA-Z0-9_-]+):/);
    const subRoute = pathMatch ? pathMatch[1] : 'default';

    const exampleData = featureExamples[subRoute] || featureExamples.default || { default: "example payload" };

    const reqBodyYaml = `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: ${JSON.stringify(exampleData)}`;
    
    hasChanges = true;
    
    // Inject right before "responses:"
    return match.replace('\n *     responses:', reqBodyYaml + '\n *     responses:');
  });

  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Added requestBody examples to ${file}`);
  }
});

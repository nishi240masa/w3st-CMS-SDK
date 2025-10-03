#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const command = process.argv[2];

if (command === 'pull') {
  console.log('Pulling types from w3st CMS...');

  const baseURL = process.env.W3ST_BASE_URL || 'http://localhost:8080';
  const token = process.env.W3ST_TOKEN;

  if (!token) {
    console.error('Please set W3ST_TOKEN environment variable');
    process.exit(1);
  }

  const client = axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  async function pullTypes() {
    try {
      // Get collections
      const collectionsRes = await client.get('/collections');
      const collections = collectionsRes.data;

      const collectionIds = {};
      const interfaces = [];

      for (const collection of collections) {
        collectionIds[collection.name] = collection.id;

        // Get fields
        const fieldsRes = await client.get(`/collections/${collection.id}/fields`);
        const fields = fieldsRes.data;

        const interfaceProps = fields.map(field => {
          let type;
          switch (field.field_type) {
            case 'text':
              type = 'string';
              break;
            case 'number':
              type = 'number';
              break;
            case 'boolean':
              type = 'boolean';
              break;
            case 'select':
            case 'dropdown':
              type = 'string';
              break;
            case 'relation':
              type = 'number'; // ID
              break;
            default:
              type = 'any';
          }
          const optional = field.is_required ? '' : '?';
          return `  ${field.field_id}${optional}: ${type};`;
        }).join('\n');

        interfaces.push(`export interface ${capitalize(collection.name)} extends BaseEntity {\n${interfaceProps}\n}`);
      }

      const typesContent = `
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

${interfaces.join('\n\n')}
`;

      const typesPath = path.join(process.cwd(), 'src', 'w3st-types.ts');
      fs.writeFileSync(typesPath, typesContent);
      console.log(`Types generated at ${typesPath}`);

      // Update COLLECTION_IDS in types.ts
      const typesTsPath = path.join(process.cwd(), 'src', 'types.ts');
      let typesTsContent = fs.readFileSync(typesTsPath, 'utf-8');
      const idsStr = JSON.stringify(collectionIds, null, 2);
      typesTsContent = typesTsContent.replace(/export const COLLECTION_IDS: Record<string, number> = \{\};/, `export const COLLECTION_IDS: Record<string, number> = ${idsStr};`);
      fs.writeFileSync(typesTsPath, typesTsContent);
      console.log(`COLLECTION_IDS updated in ${typesTsPath}`);

    } catch (error) {
      console.error('Error pulling types:', error.message);
      process.exit(1);
    }
  }

  pullTypes();
} else {
  console.log('Usage: w3st-cli pull');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
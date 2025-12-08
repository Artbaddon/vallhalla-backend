import path from 'node:path'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import postmanToOpenApi from 'postman-to-openapi'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const collectionPath = path.resolve(__dirname, '../postman_collection.json')
const tempDir = path.resolve(__dirname, '../.tmp')
const tempCollectionPath = path.join(tempDir, 'postman_collection.resolved.json')
const outputPath = path.resolve(__dirname, '../../docs/openapi.yaml')
const BASE_URL = process.env.SWAGGER_BASE_URL ?? 'http://localhost:3000/api'
const ROOT_URL = process.env.SWAGGER_ROOT_URL ?? 'http://localhost:3000'

async function resolveCollectionVariables() {
  await mkdir(tempDir, { recursive: true })
  const raw = await readFile(collectionPath, 'utf8')
  const sanitized = raw
    .replace(/{{\s*baseUrl\s*}}/g, BASE_URL)
    .replace(/{{\s*rootUrl\s*}}/g, ROOT_URL)
  await writeFile(tempCollectionPath, sanitized, 'utf8')
  return tempCollectionPath
}

async function cleanupTempArtifacts() {
  try {
    await rm(tempDir, { force: true, recursive: true })
  } catch {
    // Ignore cleanup errors
  }
}

async function generateSpec() {
  try {
    const resolvedCollection = await resolveCollectionVariables()
    await postmanToOpenApi(resolvedCollection, outputPath, {
      info: {
        title: 'Vallhalla API',
        description: 'OpenAPI documentation generated automatically from the Postman collection.',
        version: '1.0.0'
      },
      servers: [
        { url: BASE_URL, description: 'Local development server' }
      ],
      auth: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      folders: {
        separator: ' / '
      }
    })
    console.log(`OpenAPI spec written to ${outputPath}`)
  } catch (error) {
    console.error('Failed to generate OpenAPI spec:', error)
    process.exit(1)
  } finally {
    await cleanupTempArtifacts()
  }
}

generateSpec()

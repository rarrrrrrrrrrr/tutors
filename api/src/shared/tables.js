'use strict';

const { TableClient, odata } = require('@azure/data-tables');

const TUTORS_TABLE = 'Tutors';
const STUDENTS_TABLE = 'Students';
const USERS_TABLE = 'Users';

function getConnectionString() {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage;
  if (!cs) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING (or AzureWebJobsStorage) is not configured.');
  }
  return cs;
}

function getClient(tableName) {
  return TableClient.fromConnectionString(getConnectionString(), tableName, {
    allowInsecureConnection: false,
  });
}

// Azure Tables don't support arrays directly. We serialize complex fields to JSON strings.
const JSON_FIELDS = ['topics'];

function toEntity(partitionKey, rowKey, profile) {
  const entity = { partitionKey, rowKey };
  for (const [key, value] of Object.entries(profile)) {
    if (key === 'id' || key === 'partitionKey' || key === 'rowKey' || key === 'etag') continue;
    if (JSON_FIELDS.includes(key)) {
      entity[key + 'Json'] = JSON.stringify(value ?? []);
    } else if (value === undefined || value === null) {
      entity[key] = '';
    } else if (typeof value === 'object') {
      entity[key] = JSON.stringify(value);
    } else {
      entity[key] = value;
    }
  }
  return entity;
}

function fromEntity(entity) {
  if (!entity) return null;
  const profile = { id: entity.rowKey };
  for (const [key, value] of Object.entries(entity)) {
    if (key === 'partitionKey' || key === 'rowKey' || key === 'etag' || key.startsWith('odata.') || key === 'timestamp') continue;
    if (key.endsWith('Json')) {
      const baseKey = key.slice(0, -4);
      try {
        profile[baseKey] = JSON.parse(value);
      } catch {
        profile[baseKey] = [];
      }
    } else {
      profile[key] = value;
    }
  }
  return profile;
}

async function listEntities(tableName, partitionKey) {
  const client = getClient(tableName);
  const results = [];
  const iterator = client.listEntities({
    queryOptions: { filter: odata`PartitionKey eq ${partitionKey}` },
  });
  for await (const entity of iterator) {
    results.push(fromEntity(entity));
  }
  return results;
}

async function getEntity(tableName, partitionKey, rowKey) {
  const client = getClient(tableName);
  try {
    const entity = await client.getEntity(partitionKey, rowKey);
    return fromEntity(entity);
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

async function upsertEntity(tableName, partitionKey, rowKey, profile) {
  const client = getClient(tableName);
  const entity = toEntity(partitionKey, rowKey, profile);
  await client.upsertEntity(entity, 'Replace');
  return { ...profile, id: rowKey };
}

async function deleteEntity(tableName, partitionKey, rowKey) {
  const client = getClient(tableName);
  try {
    await client.deleteEntity(partitionKey, rowKey);
    return true;
  } catch (err) {
    if (err.statusCode === 404) return false;
    throw err;
  }
}

function jsonResponse(status, body) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: body,
  };
}

module.exports = {
  TUTORS_TABLE,
  STUDENTS_TABLE,
  USERS_TABLE,
  listEntities,
  getEntity,
  upsertEntity,
  deleteEntity,
  jsonResponse,
};

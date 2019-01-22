'use strict'

const { BigQuery } = require('@google-cloud/bigquery')
const { Storage } = require('@google-cloud/storage')

async function gcsbq (file, context) {
  const _schema = require(process.env.SCHEMA)

  const datasetId = process.env.DATASET
  const tableId = process.env.TABLE

  const bigquery = new BigQuery()

  const storage = new Storage()

  console.log(`Starting job for ${file.name}`)

  const filename = storage.bucket(file.bucket).file(file.name)

  /* Configure the load job and ignore values undefined in schema */
  const metadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    schema: {
      fields: _schema
    },
    // Set the write disposition to overwrite existing table data.
    writeDisposition: 'WRITE_TRUNCATE',
    ignoreUnknownValues: true
  }

  // Load JSON from Google Cloud Storage file into the table
  const [job] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(filename, metadata)

  console.log(`Job ${job.id} completed.`)

  const errors = job.status.errors
  if (errors && errors.length > 0) {
    throw errors
  }
}

exports.gcsbq = gcsbq

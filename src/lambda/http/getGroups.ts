import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support';
import * as AWS from 'aws-sdk';


const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
  }
  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  const items = result.Items

  console.log('Result: ', result)

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}

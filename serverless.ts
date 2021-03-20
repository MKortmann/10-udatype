// import { DynamoDB } from 'aws-sdk';
// import { table } from 'console';

import { readFileSync } from 'fs';
import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'udatype',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    documentation: {
      api: {
        info: {
          version: 'v1.0.0',
          title: 'Udagram API',
          description: 'Serverless application for images sharing'
        }
      },
      models: {
        name: 'GroupRequest',
        contentType: 'application/json',
        schema: '${file(models/create-group-request.json)}'
      }
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-reqvalidator-plugin', 'serverless-aws-documentation'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: '${opt:region, "eu-central-1"}',
    stage: '${opt:stage, "dev"}',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      GROUPS_TABLE: 'Groups-${self:provider.stage}'
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [ "dynamodb:Scan", "dynamodb:PutItem"],
        Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}"
      }
    ]
  },
  functions: {
    GetGroups: {
      handler: 'src/lambda/http/getGroups.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'groups',
            cors: true
          }
        }
      ]
    },
    createGroup: {
      handler: 'src/lambda/http/createGroup.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'groups',
            cors: true,
            request: {
              schema: {
                'applicaton/json': '${file(models/create-group-request.json)}'
              }
            },
            documentation: {
              summary: 'Create a new group',
              description: 'Create a new group',
              requestModels: {
                'application/json': 'GroupRequest'
              }
            }
          }
        }
      ]
    },
  },
  resources: {
    Resources: {
      RequestBodyValidator: {
        Type: 'AWS::ApiGateway::RequestValidator',
        Properties: {
          Name: 'request-body-validator',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          },
          ValidateRequestBody: true,
          ValidateRequestParameters: false
        }
      },
      GroupsDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
            AttributeDefinitions: [
              {
                  "AttributeName": "id",
                  "AttributeType": "S"
              }
            ],
            KeySchema: [
              {
                  "AttributeName": "id",
                  "KeyType": "HASH"
              }
            ],
            BillingMode: "PAY_PER_REQUEST",
            TableName: "${self:provider.environment.GROUPS_TABLE}"
        }
      }
    }
 }
}

module.exports = serverlessConfiguration;

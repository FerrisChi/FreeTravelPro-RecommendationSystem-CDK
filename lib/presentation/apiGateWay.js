const {RestApi, LambdaIntegration, AwsIntegration, PassthroughBehavior, Model} = require("aws-cdk-lib/aws-apigateway");
const {NodejsFunction} = require("aws-cdk-lib/aws-lambda-nodejs");
const path = require("path");
const {StartingPosition} = require("aws-cdk-lib/aws-lambda");
const {KinesisEventSource} = require("aws-cdk-lib/aws-lambda-event-sources")
const {Role, ServicePrincipal, Effect, PolicyStatement, Policy} = require("aws-cdk-lib/aws-iam");
const {Stream} = require("aws-cdk-lib/aws-kinesis")
const {Bucket} = require("aws-cdk-lib/aws-s3");
const {CfnDeliveryStream} = require("aws-cdk-lib/aws-kinesisfirehose")
const {CfnParameter, CfnResource} = require("aws-cdk-lib");
const createPresentationLayer = (scope, entry, props) => {

    const region = new CfnParameter(scope, 'solutionRegion', {
        type: 'String',
        description: 'Region where the solution is deployed',
    });

    const api = new RestApi(scope, 'PersonalizeApiGateway', {
        restApiName: 'amazon-personalize-presentation-layer',

    });

    const createCampaign = new NodejsFunction(scope, 'personalizeLambda-createCampaign', {
        entry: path.resolve(__dirname, './app/createCampaign.js'),
        handler: 'handler',
        functionName: 'createCampaign',
        environment: {
            'REGION': region,
        }
    })

    createCampaign.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:CreateCampaign'],
            resources: ['*'],
        })
    )

    const createEventTracker = new NodejsFunction(scope, 'personalizeLambda-createEventTracker', {
        entry: path.resolve(__dirname, './app/createEventTracker.js'),
        handler: 'handler',
        functionName: 'createEventTracker',
        environment: {
            'REGION': region,
        }
    })

    createEventTracker.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:CreateEventTracker'],
            resources: ['*'],
        })
    )

    const createSolutionVersion = new NodejsFunction(scope, 'personalizeLambda-createSolutionVersion', {
        entry: path.resolve(__dirname, './app/createSolutionVersion.js'),
        handler: 'handler',
        functionName: 'createSolutionVersion',
        environment: {
            'REGION': region,
        }

    })
    createSolutionVersion.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:CreateSolutionVersion'],
            resources: ['*'],
        }))

    const putEvents = new NodejsFunction(scope, 'personalizeLambda-putEvents', {
        entry: path.resolve(__dirname, './app/putEvents.js'),
        handler: 'handler',
        functionName: 'putEvents',
        environment: {
            'REGION': region,
        }


    })
    putEvents.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:PutEvents'],
            resources: ['*'],
    }))

    const getRecommendations = new NodejsFunction(scope, 'personalizeLambda-getRecommendations', {
        entry: path.resolve(__dirname, './app/getRecommendations.js'),
        handler: 'handler',
        functionName: 'getRecommendations',
        environment: {
            'REGION': region,
        }

    })
    getRecommendations.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:GetRecommendations'],
            resources: ['*'],
        }))

    const deleteResources = new NodejsFunction(scope, 'deleteResources', {
        entry: path.resolve(__dirname, './app/deleteResources.js'),
        handler: 'handler',
        functionName: 'deleteResources',
        environment: {
            'REGION': region,
        }
    })

    deleteResources.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:DeleteEventTracker', 'personalize:DeleteCampaign'],
            resources: ['*'],
        }))

    const describeSolutionVersion = new NodejsFunction(scope, 'describeSolutionVersion', {
        entry: path.resolve(__dirname, './app/describeSolutionVersion.js'),
        handler: 'handler',
        functionName: 'describeSolutionVersion',
        environment: {
            'REGION': region,
        }
    })

    describeSolutionVersion.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:DescribeSolutionVersion'],
            resources: ['*'],
        }))

    const describeCampaign = new NodejsFunction(scope, 'describeCampaign', {
        entry: path.resolve(__dirname, './app/describeCampaign.js'),
        handler: 'handler',
        functionName: 'describeCampaign',
        environment: {
            'REGION': region,
        }
    })

    describeCampaign.role.addToPrincipalPolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['personalize:DescribeCampaign'],
            resources: ['*'],
        }))
    const createCampaignIntegration = new LambdaIntegration(createCampaign, {
        allowTestInvoke: false
    });
    const createEventTrackerIntegration = new LambdaIntegration(createEventTracker, {
        allowTestInvoke: false,
    });
    const createSolutionVersionIntegration = new LambdaIntegration(createSolutionVersion, {
        allowTestInvoke: false
    });
    const putEventsIntegration = new LambdaIntegration(putEvents, {
        allowTestInvoke: false
    });

    const getRecommendationsIntegration = new LambdaIntegration(getRecommendations, {
        allowTestInvoke: false
    });

    const deleteResourcesIntegration = new LambdaIntegration(deleteResources, {
        allowTestInvoke: false
    });

    const describeSolutionVersionIntegration = new LambdaIntegration(describeSolutionVersion, {
        allowTestInvoke: false
    });

    const describeCampaignIntegration = new LambdaIntegration(describeCampaign, {
        allowTestInvoke: false
    });

    const resourceCampaign = api.root.addResource('campaign');
    resourceCampaign.addMethod('POST', createCampaignIntegration);

    const resourceEventTracker = api.root.addResource('eventTracker');
    resourceEventTracker.addMethod('POST', createEventTrackerIntegration);

    const resourceSolutionVersion = api.root.addResource('solutionVersion');
    resourceSolutionVersion.addMethod('POST', createSolutionVersionIntegration);

    const resourcePutEvents = api.root.addResource('putEvents');
    resourcePutEvents.addMethod('POST', putEventsIntegration);

    const resourceGetRecommendations = api.root.addResource('getRecommendations');
    resourceGetRecommendations.addMethod('GET', getRecommendationsIntegration);

    const resourceDeleteResources = api.root.addResource('deleteResources');
    resourceDeleteResources.addMethod('DELETE', deleteResourcesIntegration);

    const describeSolutionVersionResources = api.root.addResource('describeSolutionVersion');
    describeSolutionVersionResources.addMethod('POST', describeSolutionVersionIntegration);

    const describeCampaignResources = api.root.addResource('describeCampaign');
    describeCampaignResources.addMethod('POST', describeCampaignIntegration);

    const kinesisStream = new Stream(scope, 'MyFirstStream', {
        streamName: 'my-stream',
    });
    const apiRole = new Role(scope, 'my-api-gw-role',{
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
        roleName: 'my-apigateway-role'
    })


    apiRole.addToPolicy(new PolicyStatement({
        actions: [     "kinesis:PutRecord"],
        resources: [
            kinesisStream.streamArn
        ],
        effect: Effect.ALLOW
    }))
    const putRecordMethodOptions = {
        requestParameters: {
            ['method.request.header.Content-Type']: true,
        },
    };
    const kinesisDataStreamIntegration = new AwsIntegration({
        allowTestInvoke: false,
        service: 'kinesis',
        action: 'PutRecord',
        integrationHttpMethod: "POST",
        options: {
            requestTemplates: {
                'application/json': "{\"StreamName\": \"$input.path(\'$.stream-name\')\",\"Data\": \"$util.base64Encode($input.json(\'$.Data\'))\",\n\"PartitionKey\": \"$input.path(\'$.PartitionKey\')\"}"
            },
            credentialsRole:apiRole,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
            integrationResponses: [
                {
                    statusCode: "200",
                    responseTemplates: {
                        'application/json': "{\"Message\": \"Event sent successfully\", \"data\": $input.body}"
                    }
                }
            ]
        }
    });
    const methodOps = {
        methodResponses: [
            {
                statusCode: '200',
                responseModels: {
                    "application/json": Model.EMPTY_MODEL
                },
            }
        ]
    }
    const resourceKinesisData = api.root.addResource('data');
    resourceKinesisData.addMethod('POST', kinesisDataStreamIntegration, methodOps);

    const myBucket = new Bucket(scope, 'MyBucketForKinesis');

    // Create a Firehose role
    const firehoseRole = new Role(scope, 'FirehoseDeliveryRole', {
        assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
        description: 'Role for Firehose to access resources',
    });

    // Add a policy to the role to allow Firehose to write to the S3 bucket
    firehoseRole.addToPolicy(new PolicyStatement({
        actions: [
            's3:AbortMultipartUpload',
            's3:GetBucketLocation',
            's3:GetObject',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
            's3:PutObject'
        ],
        resources: [myBucket.bucketArn, `${myBucket.bucketArn}/*`],
        effect: Effect.ALLOW
    }));
    // firehoseRole.addToPolicy(new PolicyStatement({
    //     actions: [
    //         'kinesis:DescribeStream',
    //         'kinesis:GetShardIterator',
    //         'kinesis:GetRecords',
    //         'kinesis:ListShards',
    //     ],
    //     resources: [kinesisStream.streamArn],
    //     effect: Effect.ALLOW
    // }));
    const firehosePolicy = new Policy(scope, 'FirehosePolicy', {
        roles: [firehoseRole],
        statements: [
            new PolicyStatement({
                actions: [
                    'kinesis:DescribeStream',
                    'kinesis:GetShardIterator',
                    'kinesis:GetRecords',
                    'kinesis:ListShards',
                ],
                resources: [kinesisStream.streamArn],
                effect: Effect.ALLOW
            }),
        ]
    });
    
    // console.log('kinesisStream', kinesisStream.streamArn)
    // console.log('myBucket', myBucket.bucketArn)
    // console.log('firehoseRole', firehoseRole.roleArn)

    const deliveryStream = new CfnDeliveryStream(scope, 'MyDeliveryStream', {
        deliveryStreamType: 'KinesisStreamAsSource',
        kinesisStreamSourceConfiguration: {
            kinesisStreamArn: kinesisStream.streamArn,
            roleArn: firehoseRole.roleArn,
        },
        s3DestinationConfiguration: {
            bucketArn: myBucket.bucketArn,
            roleArn: firehoseRole.roleArn,
        },
        // sourceStream: kinesis
    });

    deliveryStream.addDependency(firehosePolicy.node.defaultChild)

    const eventSource = new KinesisEventSource( kinesisStream, {
        startingPosition: StartingPosition.TRIM_HORIZON,

    } );
    putEvents.addEventSource(eventSource)

}

module.exports = {createPresentationLayer}
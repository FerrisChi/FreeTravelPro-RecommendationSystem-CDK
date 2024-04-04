const personalize = require('aws-cdk-lib/aws-personalize');

const createSchemaUser =  (scope,name) => {
    const schema =  new personalize.CfnSchema(scope, 'MyCfnUserSchema', {
        name: name,
        schema: JSON.stringify(
            {

                "type": "record",
                "name": "Users",
                "namespace": "com.amazonaws.personalize.schema",
                "fields": [
                    {
                        "name": "USER_ID",
                        "type": "string"
                    },
                    {
                        "name": "AGE",
                        "type": "int"
                    }
                ],
                "version": "1.0"
            }
        )
    });
    return {
        arn : schema.attrSchemaArn
    }
}

module.exports = {createSchemaUser}
const { Stack} = require('aws-cdk-lib');
const { createDatasetGroup} = require("./datasetGroup/datasetGroup");
const {createDataset} = require("./dataset/createDataset");
const {createSchema} = require("./schemas/createSchema");
const {createSolution} = require("./solution/createSolution");

const {createPresentationLayer} = require("./presentation/apiGateWay");
const {createSchemaItem} = require("./schemas/createSchemaItems");
const {createSchemaUser} = require("./schemas/createSchemaUsers");

class CreateDatasetGroupStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const datasetGroup = createDatasetGroup(this, 'my-dsg-1')

    const schema = createSchema(this, 'my-schema')
    const itemSchema = createSchemaItem(this, 'my-item-schema')
    const userSchema = createSchemaUser(this, 'my-user-schema')


    const dataset = createDataset(this,datasetGroup.arn, schema.arn, itemSchema.arn, userSchema.arn)

    const solution = createSolution(this,'my-sol-from-cdk', datasetGroup.arn, dataset.ds )


    const apigw = createPresentationLayer(this, 'personalize-apigw');

  }
}

module.exports = { CreateDatasetGroupStack }

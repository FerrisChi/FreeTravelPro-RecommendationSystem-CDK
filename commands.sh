export bucketARN="arn:aws:s3:::free-travel-pro-bucket" \
export bucketObjectsARN="arn:aws:s3:::free-travel-pro-bucket/*" \
export interactionDataLocation="s3://free-travel-pro-bucket/event_data.csv" \
export itemDataLocation="s3://free-travel-pro-bucket/item_data.csv" \
export userDataLocation="s3://free-travel-pro-bucket/user_data.csv" \
export solutionRegion="us-east-1"

# deploy
cdk deploy --parameters bucketARN=$bucketARN \
   --parameters bucketObjectsARN=$bucketObjectsARN \
   --parameters interactionDataLocation=$interactionDataLocation \
   --parameters itemDataLocation=$itemDataLocation \
   --parameters solutionRegion=$solutionRegion \
   --parameters userDataLocation=$userDataLocation

# get the solution version
curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/solutionVersion' \
--header 'Content-Type: application/json' \
--data '{
    "solutionArn" : "arn:aws:personalize:us-east-1:552821832600:solution/my-sol-from-cdk",
    "version": "v0"
}'

# check if Solution Version is in active

curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/describeSolutionVersion' \
--header 'Content-Type: application/json' \
--data '{
    "solutionVersionArn": "arn:aws:personalize:us-east-1:552821832600:solution/my-sol-from-cdk/v0"
}'

# create the campaign

curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/campaign' \
--header 'Content-Type: application/json' \
--data '{
    "solutionVersionArn" : "arn:aws:personalize:us-east-1:552821832600:solution/my-sol-from-cdk/v0",
    "name": "my-campaign"
}'

# check if Campaign is in active

curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/describeCampaign' \
--header 'Content-Type: application/json' \
--data '{
    "campaignArn": "arn:aws:personalize:us-east-1:552821832600:campaign/my-campaign"
}'

# create the event trackers for datagroup

curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/eventTracker' \
--header 'Content-Type: application/json' \
--data '{
    "name" : "interactions-tracker",
    "datasetGroupArn": "arn:aws:personalize:us-east-1:552821832600:dataset-group/my-dsg-1"
}'


# get recommendations
curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/getRecommendations?campaignArn=arn%3Aaws%3Apersonalize%3Aus-east-1%3A552821832600%3Acampaign%2Fmy-campaign&userId=1&numResults=5'

# putEvent (ingest interactions)
curl --location 'https://w2dzzzwtxh.execute-api.us-east-1.amazonaws.com/prod/data' \
--header 'Content-Type: application/json' \
--data '{
    "stream-name": "my-stream",
    "Data": {
        "userId" : "430",
        "interactions": 3,
        "itemId": "185",
        "trackingId" : "2e0eae16-4f22-4583-a804-98c7e1f32bab",
        "eventType": "click",
        "dateFrom" : "2022-01-01",
        "dateTo" : "2023-04-05",
    },
    "PartitionKey": "430",
}'

# clean up resources
curl --location --request DELETE 'https://{your-api-id}.execute-api.{your-region}.amazonaws.com/prod/deleteResources' \
--header 'Content-Type: application/json' \
--data '{
    "campaignArn" : "{your-campaign-arn}",
    "eventTrackerArn": "{your-eventTracker-arn}"
}'
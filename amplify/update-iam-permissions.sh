#!/bin/bash

# Script to create and attach Amplify IAM policy
# Run this with AWS CLI configured with administrator privileges

POLICY_NAME="AmplifyDeveloperAccess"
USER_NAME="awsdev"
POLICY_FILE="amplify-policy.json"

echo "Creating IAM policy: $POLICY_NAME"
POLICY_ARN=$(aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document file://"$POLICY_FILE" \
    --description "Policy for AWS Amplify development operations" \
    --query 'Policy.Arn' \
    --output text)

if [ $? -eq 0 ]; then
    echo "Policy created successfully: $POLICY_ARN"
    
    echo "Attaching policy to user: $USER_NAME"
    aws iam attach-user-policy \
        --user-name "$USER_NAME" \
        --policy-arn "$POLICY_ARN"
    
    if [ $? -eq 0 ]; then
        echo "Policy attached successfully!"
        echo "You should now be able to run 'amplify status' and other Amplify commands."
    else
        echo "Failed to attach policy to user."
        exit 1
    fi
else
    echo "Failed to create policy. Check if policy already exists:"
    aws iam get-policy --policy-arn "arn:aws:iam::354423725718:policy/$POLICY_NAME" 2>/dev/null
    if [ $? -eq 0 ]; then
        POLICY_ARN="arn:aws:iam::354423725718:policy/$POLICY_NAME"
        echo "Policy already exists. Attaching to user..."
        aws iam attach-user-policy \
            --user-name "$USER_NAME" \
            --policy-arn "$POLICY_ARN"
    fi
fi
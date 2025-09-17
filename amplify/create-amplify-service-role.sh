#!/bin/bash

# Script to create Amplify service role
# Run this with AWS CLI configured with administrator privileges

ROLE_NAME="AmplifyServiceRole"
POLICY_NAME="AmplifyServiceRolePolicy"
TRUST_POLICY_FILE="amplify-service-role-trust-policy.json"
POLICY_FILE="amplify-service-role-policy.json"

echo "Creating Amplify service role: $ROLE_NAME"

# Create the role
aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file://"$TRUST_POLICY_FILE" \
    --description "Service role for AWS Amplify applications"

if [ $? -eq 0 ]; then
    echo "Service role created successfully!"
else
    echo "Failed to create service role. It might already exist."
    echo "Checking if role exists..."
    aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Role doesn't exist and creation failed. Please check permissions."
        exit 1
    fi
    echo "Role already exists, proceeding..."
fi

echo "Creating inline policy: $POLICY_NAME"
aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "$POLICY_NAME" \
    --policy-document file://"$POLICY_FILE"

if [ $? -eq 0 ]; then
    echo "Policy attached successfully!"
    
    # Get the role ARN
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
    echo ""
    echo "✅ Amplify service role created successfully!"
    echo "Role ARN: $ROLE_ARN"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to the AWS Amplify Console"
    echo "2. Navigate to your app settings"
    echo "3. Go to 'General' > 'App settings'"
    echo "4. In the 'Service role' section, paste this ARN:"
    echo "   $ROLE_ARN"
    echo "5. Save the settings"
    echo ""
else
    echo "Failed to attach policy to role."
    exit 1
fi
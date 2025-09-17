// AWS configuration that works for both Vercel and AWS Amplify
export const awsConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION || "eu-west-3",
  // Add more AWS config as needed for your deployment
};

export default awsConfig;
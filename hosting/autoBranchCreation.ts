import { AutoBranchCreation } from "@aws-cdk/aws-amplify-alpha";

export const autoBranchCreation: AutoBranchCreation = {
  autoBuild: true,
  patterns: ["feature/*"],
  pullRequestPreview: true,
};

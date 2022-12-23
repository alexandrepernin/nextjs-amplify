import * as cdk from "aws-cdk-lib";

import { AmplifyStack } from "./stack";

const app = new cdk.App();

new AmplifyStack(app, "NextJSSampleApp", {
  description: "Cloudformation stack containing the Amplify configuration",
});

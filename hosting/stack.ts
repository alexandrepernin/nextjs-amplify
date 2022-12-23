import { App } from "@aws-cdk/aws-amplify-alpha";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";

import { buildSpec } from "./buildSpec";
import { autoBranchCreation } from "./autoBranchCreation";
import { environmentVariables } from "./environmentVariables";

import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

import { GitHubSourceCodeProvider } from "@aws-cdk/aws-amplify-alpha/lib/source-code-providers";
import { SecretValue } from "aws-cdk-lib";

export class AmplifyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const sourceCodeProvider = new GitHubSourceCodeProvider({
      oauthToken: SecretValue.unsafePlainText(process.env.GITHUB_TOKEN!),
      owner: "alexandrepernin",
      repository: "nextjs-amplify",
    });

    const role = new Role(this, "AmplifyRoleWebApp", {
      assumedBy: new ServicePrincipal("amplify.amazonaws.com"),
      description: "Custom role permitting resources creation from Amplify",
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess-Amplify"),
      ],
    });

    // Define Amplify app
    const amplifyApp = new App(this, "AmplifyAppResource", {
      appName: "NextJS app",
      description: "My NextJS APP deployed with Amplify",

      // ⬇️ configuration items to be defined ⬇️
      role,
      sourceCodeProvider,
      buildSpec,
      autoBranchCreation,
      autoBranchDeletion: true,
      environmentVariables,
      // ⬆️ end of configuration ⬆️
    });

    // Attach your main branch and define the branch settings (see below)
    amplifyApp.addBranch("main", {
      autoBuild: true,
      stage: "PRODUCTION",
      performanceMode: false,
    });

    new CfnOutput(this, "appId", {
      value: amplifyApp.appId,
    });

    new AwsCustomResource(this, "aws-custom", {
      onCreate: {
        service: "Amplify",
        action: "updateApp",
        parameters: {
          appId: amplifyApp.appId,
          platform: "WEB_COMPUTE",
        },
        physicalResourceId: PhysicalResourceId.of(
          "test-amplify-custom-resource"
        ),
      },

      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [amplifyApp.arn],
      }),
    });

    const webhookCustomResource = new AwsCustomResource(
      this,
      "aws-custom-webhook",
      {
        onCreate: {
          service: "Amplify",
          action: "createWebhook",
          parameters: {
            appId: amplifyApp.appId,
            branchName: "main",
          },
          physicalResourceId: PhysicalResourceId.of(
            "test-amplify-custom-resource-webhook"
          ),
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: [`${amplifyApp.arn}/webhooks/*`],
        }),
      }
    );

    new CfnOutput(this, "webhookUrl", {
      value: webhookCustomResource.getResponseField("webhook.webhookUrl"),
    });
  }
}

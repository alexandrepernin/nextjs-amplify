import { BuildSpec } from "aws-cdk-lib/aws-codebuild";

import { environmentVariables } from "./environmentVariables";

export const buildSpec = BuildSpec.fromObjectToYaml({
  version: "1.0",
  applications: [
    {
      frontend: {
        phases: {
          preBuild: {
            commands: [
              // Install the correct Node version, defined in .nvmrc
              "nvm install",
              "nvm use",
              // Install pnpm
              "corepack enable",
              "corepack prepare pnpm@latest --activate",
              // Avoid memory issues with node
              "export NODE_OPTIONS=--max-old-space-size=8192",
              // Ensure node_modules are correctly included in the build artifacts
              "pnpm install",
            ],
          },
          build: {
            commands: [
              // Allow Next.js to access environment variables
              // See https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html
              `env | grep -E '${Object.keys(environmentVariables).join(
                "|"
              )}' >> .env.production`,
              // Build Next.js app
              "pnpm next build --no-lint",
            ],
          },
        },
        artifacts: {
          baseDirectory: ".next",
          files: ["**/*"],
        },
      },
    },
  ],
});

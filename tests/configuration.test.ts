import validConfiguration from "./__mocks__/configurations/default-configuration.json";
import customConfigurationDecoded from "./__mocks__/configurations/custom-configuration-decoded.json";

describe("Configuration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });
  it("should match the valid configuration", async () => {
    jest.mock("@actions/github", () => ({
      context: {
        runId: "1",
        payload: {
          repository: {
            html_url: "https://github.com/ubiquity-os/conversation-rewards",
          },
          inputs: {
            stateId: "12345",
            eventName: "issues.closed",
            authToken: "<PASSWORD>",
            ref: "main",
            eventPayload: JSON.stringify({}),
            settings: JSON.stringify({
              evmPrivateEncrypted: "1234",
              incentives: {
                contentEvaluator: {},
                dataPurge: {},
                formattingEvaluator: {},
                githubComment: {},
                permitGeneration: {},
                requirePriceLabel: true,
                userExtractor: {},
              },
            }),
          },
        },
        sha: "1234",
      },
    }));
    const configuration = await import("../src/configuration/config-reader");
    expect(configuration).toEqual(validConfiguration);
  });
  it("should match the custom configuration", async () => {
    jest.mock("@actions/github", () => {
      const cfg = require("./__mocks__/configurations/custom-configuration.json");
      return {
        context: {
          runId: "1",
          payload: {
            repository: {
              html_url: "https://github.com/ubiquity-os/conversation-rewards",
            },
            inputs: {
              stateId: "12345",
              eventName: "issues.closed",
              authToken: "<PASSWORD>",
              ref: "main",
              eventPayload: JSON.stringify({}),
              settings: JSON.stringify(cfg),
            },
          },
          sha: "1234",
        },
      };
    });
    const configuration = await import("../src/configuration/config-reader");
    expect(configuration).toEqual(customConfigurationDecoded);
  });
});

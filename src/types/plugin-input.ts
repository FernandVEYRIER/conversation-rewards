import { StaticDecode, Type as T } from "@sinclair/typebox";
import { LOG_LEVEL } from "@ubiquity-os/ubiquity-os-logger";
import { StandardValidator } from "typebox-validators";
import { contentEvaluatorConfigurationType } from "../configuration/content-evaluator-config";
import { dataCollectionConfigurationType } from "../configuration/data-collection-config";
import { dataPurgeConfigurationType } from "../configuration/data-purge-config";
import { formattingEvaluatorConfigurationType } from "../configuration/formatting-evaluator-config";
import { githubCommentConfigurationType } from "../configuration/github-comment-config";
import { permitGenerationConfigurationType } from "../configuration/permit-generation-configuration";
import { userExtractorConfigurationType } from "../configuration/user-extractor-config";
import {
  EmitterWebhookEvent as WebhookEvent,
  EmitterWebhookEventName as WebhookEventName,
} from "@octokit/webhooks/dist-types/types";
import { Context } from "@ubiquity-os/ubiquity-os-kernel";
import { EnvConfigType } from "./env-type";

export type SupportedEvents = "issues.closed";

export interface PluginInputs<T extends WebhookEventName = SupportedEvents> {
  stateId: string;
  eventName: T;
  eventPayload: WebhookEvent<T>["payload"];
  settings: string;
  authToken: string;
  ref: string;
}

export type PluginContext = Context<PluginSettings, EnvConfigType, SupportedEvents>;

export const pluginSettingsSchema = T.Object(
  {
    logLevel: T.Enum(LOG_LEVEL, { default: LOG_LEVEL.INFO }),
    /**
     * Network ID to run in, default to 100
     */
    evmNetworkId: T.Number({ default: 100 }),
    /**
     * The encrypted key to use for permit generation
     */
    evmPrivateEncrypted: T.String(),
    /**
     * Reward token for ERC20 permits, default WXDAI for gnosis chain
     */
    erc20RewardToken: T.String({ default: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d" }),
    incentives: T.Object(
      {
        /**
         * Optionally specify a file to write the results in
         */
        file: T.Optional(T.String()),
        /**
         * If set to false, the plugin runs even if the price label is missing, and will evaluate comments.
         */
        requirePriceLabel: T.Boolean({ default: true }),
        contentEvaluator: T.Union([contentEvaluatorConfigurationType, T.Null()], { default: null }),
        userExtractor: T.Union([userExtractorConfigurationType, T.Null()], { default: null }),
        dataPurge: T.Union([dataPurgeConfigurationType, T.Null()], { default: null }),
        formattingEvaluator: T.Union([formattingEvaluatorConfigurationType, T.Null()], { default: null }),
        permitGeneration: T.Union([permitGenerationConfigurationType, T.Null()], { default: null }),
        githubComment: T.Union([githubCommentConfigurationType, T.Null()], { default: null }),
      },
      { default: {} }
    ),
    dataCollection: dataCollectionConfigurationType,
  },
  { default: {} }
);

export const pluginSettingsValidator = new StandardValidator(pluginSettingsSchema);

export type PluginSettings = StaticDecode<typeof pluginSettingsSchema>;

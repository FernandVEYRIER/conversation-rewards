import * as github from "@actions/github";
import { config } from "dotenv";
import { PluginInputs } from "../types/plugin-input";

config();

const webhookPayload = github.context.payload.inputs;
const program: PluginInputs = {
  stateId: webhookPayload.stateId,
  eventName: webhookPayload.eventName,
  authToken: webhookPayload.authToken,
  ref: webhookPayload.ref,
  eventPayload: JSON.parse(webhookPayload.eventPayload),
  settings: webhookPayload.settings,
};

export default program;

import { createPlugin } from "@ubiquity-os/ubiquity-os-kernel";
import manifest from "../manifest.json";
import { serve } from "@hono/node-server";
import { run } from "./run";
import { PluginSettings, pluginSettingsSchema, SupportedEvents } from "./types/plugin-input";
import envConfigSchema, { EnvConfigType } from "./types/env-type";

createPlugin<PluginSettings, EnvConfigType, SupportedEvents>(
  async (context) => {
    console.log("here", context.payload);
    return JSON.parse(await run(context));
  },
  manifest,
  { envSchema: envConfigSchema, settingsSchema: pluginSettingsSchema }
)
  .then((o) => serve(o))
  .catch(console.error);

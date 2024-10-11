import configuration from "./configuration/config-reader";
import { collectLinkedMergedPulls } from "./data-collection/collect-linked-pulls";
import { GITHUB_PAYLOAD_LIMIT } from "./helpers/constants";
import githubCommentModuleInstance from "./helpers/github-comment-module-instance";
import { getSortedPrices } from "./helpers/label-price-extractor";
import { IssueActivity } from "./issue-activity";
import { getOctokitInstance } from "./octokit";
import { Processor, Result } from "./parser/processor";
import { parseGitHubUrl } from "./start";
import { PluginContext } from "./types/plugin-input";

export async function run(context: PluginContext) {
  const { payload, eventName, logger } = context;
  if (eventName === "issues.closed") {
    if (payload.issue.state_reason !== "completed") {
      return logger.info("Issue was not closed as completed. Skipping.").logMessage.raw;
    }
    if (!(await preCheck(context))) {
      const result = logger.error("All linked pull requests must be closed to generate rewards.");
      await githubCommentModuleInstance.postComment(result.logMessage.diff);
      return result.logMessage.raw;
    }
    await githubCommentModuleInstance.postComment(logger.ok("Evaluating results. Please wait...").logMessage.diff);
    const issue = parseGitHubUrl(payload.issue.html_url);
    const activity = new IssueActivity(issue);
    await activity.init();
    if (configuration.incentives.requirePriceLabel && !getSortedPrices(activity.self?.labels).length) {
      const result = logger.error("No price label has been set. Skipping permit generation.");
      await githubCommentModuleInstance.postComment(result.logMessage.diff);
      return result.logMessage.raw;
    }
    const processor = new Processor();
    await processor.run(activity);
    let result = processor.dump();
    if (result.length > GITHUB_PAYLOAD_LIMIT) {
      const resultObject = JSON.parse(result) as Result;
      for (const [key, value] of Object.entries(resultObject)) {
        resultObject[key] = {
          userId: value.userId,
          task: value.task,
          permitUrl: value.permitUrl,
          total: value.total,
        };
      }
      result = JSON.stringify(resultObject);
    }
    // await returnDataToKernel(process.env.GITHUB_TOKEN, stateId, { result });
    return result;
  } else {
    return logger.error(`${eventName} is not supported, skipping.`).logMessage.raw;
  }
}

async function preCheck(context: PluginContext) {
  const { payload, logger } = context;

  const issue = parseGitHubUrl(payload.issue.html_url);
  const linkedPulls = await collectLinkedMergedPulls(issue);
  logger.debug("Checking open linked pull-requests for", {
    issue,
    linkedPulls,
  });
  if (linkedPulls.some((linkedPull) => linkedPull.state === "OPEN")) {
    await getOctokitInstance().rest.issues.update({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.issue_number,
      state: "open",
    });
    return false;
  }
  return true;
}

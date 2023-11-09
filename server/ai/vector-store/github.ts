import fs from "fs";
import path from "path";

import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Octokit } from "@octokit/rest";

import { run } from "../../utils/index.js";
import { absRootPath, SERVER_ROOT } from "../../paths.js";

export type IssuesResponse =
  RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"][0];

export type PullsResponse =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][0];

export type ReviewsResponse =
  RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"][0];

export type CommentsResponse =
  RestEndpointMethodTypes["issues"]["listComments"]["response"]["data"][0];

export type ReviewCommentsResponse =
  RestEndpointMethodTypes["pulls"]["listReviewCommentsForRepo"]["response"]["data"][0];

export type IssueEventsResponse =
  RestEndpointMethodTypes["issues"]["listEventsForRepo"]["response"]["data"][0];

export type SimplifiedIssue = {
  state: string;
  number: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  events: SimplifiedIssueEvent[];
  comments: SimplifiedIssueComment[];
};

export type SimplifiedIssueComment = {
  createdAt: string;
  updatedAt: string;
  user: string;
  comment: string;
};

export type SimplifiedPR = {
  base: string;
  head: string;
  state: string;
  number: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  locked: boolean;
  mergedAt: string;
  comments: SimplifiedIssueComment[];
  events: SimplifiedIssueEvent[];
  reviews: SimplifiedReview[];
};

export type SimplifiedReview = {
  state: string;
  user: string;
  body: string;
  submittedAt: string;
  commitId: string;
  comments: SimplifiedReviewComment[];
};

export type SimplifiedReviewComment = {
  createdAt: string;
  updatedAt: string;
  user: string;
  comment: string;
};

export type SimplifiedIssueEvent = {
  event: string;
  actor: string;
  actorType: string;
  createdAt: string;
};

const makeSimpleIssue = (issue: IssuesResponse): SimplifiedIssue => ({
  state: issue.state,
  number: issue.number,
  title: issue.title,
  body: issue.body,
  createdAt: issue.created_at,
  updatedAt: issue.updated_at,
  closedAt: issue.closed_at,
  comments: [],
  events: [],
});

const makeSimpleIssueComment = (
  comment: CommentsResponse,
): SimplifiedIssueComment => {
  return {
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    user: comment.user.login,
    comment: comment.body,
  };
};

const makeSimplePR = (pr: PullsResponse): SimplifiedPR => ({
  base: `${pr.base?.repo?.full_name}:${pr.base.ref}`,
  head: `${pr.head?.repo?.full_name}:${pr.head.ref}`,
  locked: pr.locked,
  state: pr.state,
  number: pr.number,
  title: pr.title,
  body: pr.body,
  createdAt: pr.created_at,
  updatedAt: pr.updated_at,
  closedAt: pr.closed_at,
  mergedAt: pr.merged_at,
  comments: [],
  events: [],
  reviews: [],
});

const makeSimpleReview = (review: ReviewsResponse): SimplifiedReview => ({
  state: review.state,
  user: review.user.login,
  commitId: review.commit_id,
  body: review.body,
  submittedAt: review.submitted_at,
  comments: [],
});

const makeSimplePRComment = (
  comment: ReviewCommentsResponse,
): SimplifiedReviewComment => {
  return {
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    user: comment.user.login,
    comment: comment.body,
  };
};

const makeSimpleIssueEvent = (event: IssueEventsResponse) => ({
  event: event.event,
  actor: event.actor.login,
  actorType: event.actor.type,
  createdAt: event.created_at,
});

// =============================================================================
// Github API
// =============================================================================

const { GITHUB_TOKEN } = process.env;
if (!GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const headers = { "X-GitHub-Api-Version": "2022-11-28" };

const getIssues = async ({
  owner,
  repo,
  max = 10,
  state = "all",
}: {
  owner: string;
  repo: string;
  max?: number;
  state?: "all" | "open" | "closed";
}) => {
  if (max > 100) throw new Error("Max issues is 100");

  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    headers,
    sort: "created",
    direction: "desc",
    state,
    per_page: max,
  });

  return data.map((issue) => makeSimpleIssue(issue));
};

const getIssueComments = async ({
  owner,
  repo,
  issueNumber,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
}): Promise<SimplifiedIssueComment[]> => {
  const { data } = await octokit.issues.listComments({
    owner,
    repo,
    headers,
    issue_number: issueNumber,
  });

  return data.map((comment) => makeSimpleIssueComment(comment));
};

const getIssueEvents = async ({
  owner,
  repo,
  issueNumber,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
}): Promise<SimplifiedIssueEvent[]> => {
  const { data } = await octokit.issues.listEvents({
    owner,
    repo,
    headers,
    issue_number: issueNumber,
  });

  return data.map((event) => makeSimpleIssueEvent(event));
};

const getPRs = async ({
  owner,
  repo,
  max = 10,
  state = "all",
}: {
  owner: string;
  repo: string;
  max?: number;
  state?: "all" | "open" | "closed";
}) => {
  if (max > 100) throw new Error("Max PRs is 100");

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    headers,
    sort: "created",
    direction: "desc",
    state,
    per_page: max,
  });

  return data.map((pr) => makeSimplePR(pr));
};

const getReviews = async ({
  owner,
  repo,
  pullNumber,
}: {
  owner: string;
  repo: string;
  pullNumber: number;
}): Promise<SimplifiedReview[]> => {
  const { data } = await octokit.pulls.listReviews({
    owner,
    repo,
    headers,
    pull_number: pullNumber,
  });
  return data.map((review) => makeSimpleReview(review));
};

const getReviewComments = async ({
  owner,
  repo,
  pullNumber,
}: {
  owner: string;
  repo: string;
  pullNumber: number;
}): Promise<SimplifiedReviewComment[]> => {
  const { data } = await octokit.pulls.listReviewCommentsForRepo({
    owner,
    repo,
    headers,
    pull_number: pullNumber,
    sort: "created",
    direction: "desc",
  });

  return data.map((comment) => makeSimplePRComment(comment));
};

// =============================================================================
// Run
// =============================================================================

let debugStep = "";
let debugNumber = 0;

async function fetchAndSaveData({
  owner,
  repo,
  state = "all",
  max = 100,
}: {
  owner: string;
  repo: string;
  state?: "all" | "open" | "closed";
  max?: number;
}) {
  console.log(`Owner : ${owner}`);
  console.log(`Repo  : ${repo}`);
  console.log(`Fetch : ${max} Issues/PRs`);
  console.log(`Filter: Issues/PRs with "${state}" state.`);
  console.log("----------------------------------------");

  try {
    // Fetch issues and PRs
    console.log(`Fetching ${max} issues.`);
    const issues = await getIssues({ owner, repo, max, state });

    console.log(`Fetching ${max} PRs.`);
    const prs = await getPRs({ owner, repo, max, state });

    // Prepare data storage
    const data: {
      owner: string;
      repo: string;
      issues: SimplifiedIssue[];
      prs: SimplifiedPR[];
    } = {
      owner,
      repo,
      issues,
      prs,
    };

    debugStep = "issue";
    console.log();
    console.log("Issues:");
    console.log();

    //
    // Fetch data for each issue
    //
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];

      debugNumber = issue.number;
      const { number, title } = issue;
      console.log(`#${number} ${title}`);

      const comments = await getIssueComments({
        owner,
        repo,
        issueNumber: number,
      });
      issue.comments = comments;
      if (comments.length > 0) {
        console.log(`  ${comments.length} comments`);
      }

      issue.events = await getIssueEvents({ owner, repo, issueNumber: number });
      if (issue.events.length > 0) {
        console.log(`  ${issue.events.length} events`);
      }
    }

    debugStep = "PR";
    console.log();
    console.log("PRs:");
    console.log();

    //
    // Fetch data for each PR
    //
    for (let i = 0; i < prs.length; i++) {
      const pr = prs[i];
      debugNumber = pr.number;
      const { number, title } = pr;
      console.log(`#${number} ${title}`);

      pr.comments = await getIssueComments({
        owner,
        repo,
        issueNumber: number,
      });
      if (pr.comments.length > 0) {
        console.log(`  ${pr.comments.length} comments`);
      }

      pr.events = await getIssueEvents({ owner, repo, issueNumber: number });
      if (pr.events.length > 0) {
        console.log(`  ${pr.events.length} events`);
      }

      pr.reviews = await getReviews({ owner, repo, pullNumber: number });
      if (pr.reviews.length > 0) {
        debugStep = "PR review";
        for (let j = 0; j < pr.reviews.length; j++) {
          const review = pr.reviews[j];
          review.comments = await getReviewComments({
            owner,
            repo,
            pullNumber: number,
          });

          if (review.comments.length > 0) {
            console.log(
              `  ${review.comments.length} review comments by ${review.user}`,
            );
          }
        }
      }
    }

    debugStep = "save file";
    debugNumber = 0;

    // Save data to a JSON file
    const filePath = absRootPath(SERVER_ROOT, "ai", "vector-store", "data");
    fs.mkdirSync(filePath, { recursive: true });
    fs.writeFileSync(
      path.join(filePath, `${owner}_${repo}_${max}_${state}.json`),
      JSON.stringify(data, null, 2),
    );
  } catch (error) {
    console.log();
    console.error(
      `Failed on step "${debugStep}" number "${debugNumber}": ${error}`,
    );
  }
}

// Run the main function
const parseGitUrl = (url: string) => {
  url = url.trim();

  // SSH URL
  if (url.startsWith("git@")) {
    const parts = url.split(":");
    const path = parts[1];
    return path.replace(".git", "").split("/");
  }
  // HTTP/HTTPS/standard-format URL
  else {
    try {
      const { pathname } = new URL(url);
      const path = pathname.startsWith("/") ? pathname.slice(1) : pathname;
      return path.replace(".git", "").split("/");
    } catch (error) {
      console.error("Error parsing URL: ", error);
    }
  }
};

const gitConfig = await run("git config --get remote.origin.url");
const [owner, repo] = parseGitUrl(gitConfig.stdout);

await fetchAndSaveData({ owner, repo, max: 100, state: "open" });

console.log();
console.log("Done.");

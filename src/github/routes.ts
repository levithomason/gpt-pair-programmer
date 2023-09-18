import axios from "axios";
import { GPT_4_MAX_TOKENS } from "../config";
import { Express } from "express";

export type SimplifiedComment = {
  user: string;
  comment: string;
  likes: number;
};

export type CommentsResponse = {
  issueLink: string;
  comments: SimplifiedComment[];
};

export type SimplifiedPRComment = {
  user: string;
  comment: string;
  likes: number;
};

export type PRCommentsResponse = {
  pullLink: string;
  comments: SimplifiedPRComment[];
};

export type GitHubUser = {
  login: string;
  type: string;
  // other fields...
};

export type GitHubReaction = {
  total_count: number;
  // other fields...
};

export type GitHubComment = {
  user: GitHubUser;
  body: string;
  reactions: GitHubReaction;
  html_url: string;
  // other fields...
};

export const addGitHubRoutes = (app: Express) => {
  app.get("/github/comments/:owner/:repo/:issue", async (req, res) => {
    const { owner, repo, issue } = req.params;

    try {
      const response = await axios.get<GitHubComment[]>(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue}/comments`
      );

      const comments: GitHubComment[] = response.data;

      const simplifiedComments: SimplifiedComment[] = comments
        .filter((comment) => comment.user.type !== "Bot") // Exclude bot comments
        .map((comment) => ({
          user: comment.user.login,
          comment: comment.body,
          likes: comment.reactions.total_count,
        }));

      const commentsResponse: CommentsResponse = {
        issueLink: `https://github.com/${owner}/${repo}/issues/${issue}`,
        comments: simplifiedComments,
      };

      res.json(commentsResponse);
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching comments.");
    }
  });

  app.get("/github/pr-comments/:owner/:repo/:pull", async (req, res) => {
    const { owner, repo, pull } = req.params;

    try {
      const response = await axios.get<GitHubComment[]>(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pull}/comments`
      );

      const comments: GitHubComment[] = response.data;

      const simplifiedComments: SimplifiedPRComment[] = comments
        .filter((comment) => comment.user.type !== "Bot") // Exclude bot comments
        .map((comment) => ({
          user: comment.user.login,
          comment: comment.body,
          likes: comment.reactions.total_count,
        }));

      const prCommentsResponse: PRCommentsResponse = {
        pullLink: `https://github.com/${owner}/${repo}/pull/${pull}`,
        comments: simplifiedComments,
      };

      res.json(prCommentsResponse);
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching comments.");
    }
  });
};

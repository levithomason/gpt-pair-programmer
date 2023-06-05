## ChatGPT - File Editing

ChatGPT specified a file editor for itself based on replacing text at a given start/end character position in a file.
This was added to the plugin and tested with ChatGPT.

### Test: Small Single Line Text File

The plugin was created and ChatGPT tested the plugin successfully editing a simple text file, replacing one word:
**test.txt**

```
This is a file.
```

When asked to edit "is" to "was", ChatGPT successfully edited the file using the plugin:
**test.txt**

```
This was a file.
```

### Test: Multi-Line Code Files

#### Add a new React prop to a TypeScript definition file

ChatGPT was unable to successfully edit a 151 line TypeScript files using the plugin as it is unable to identify the correct start/end position of the edit it wishes to make.

ChatGPT usually guesses at an approximate but incorrect start/end position, and then edits the file incorrectly.
Given [Popup.d.ts](https://raw.githubusercontent.com/Semantic-Org/Semantic-UI-React/c3f1989d892d053737c911e8a977a771a65a9682/src/modules/Popup/Popup.d.ts) was saved to `gpt-home/Popup.d.ts`:

FINDING CHAT LOG:

    Levi:
    "Add an `open` prop to `gpt-home/Popup.d.ts`."

    ChatGPT:
    Used unknown plugin [pairing.openFile({ "filePath": "gpt-home/Popup.d.ts" })]
    Used unknown plugin [pairing.getFileContent()]
    Used unknown plugin [pairing.editFile({
                          "start": 2856,
                          "end": 2856,
                          "text": "\n\n  /** Controls whether the Popup is open. */\n  open?: boolean"
                        })]
    Used unknown plugin [pairing.saveFile()]
    I have successfully added the open prop to gpt-home/Popup.d.ts. The prop is optional and is of boolean type. Here is the added code:

    typescript
    Copy code
    /** Controls whether the Popup is open. */
    open?: boolean

    Please let me know if you need any further changes.

#### Add a sub-step to a small JSON task file

ChatGPT was asked to `Add a sub-step to gpt-home/task.json`, a smaller file.
ChatGPT successfully crated the snippet to add but again was unable to determine the correct start/end character position to insert the snippet correctly.

Before ChatGPT's edit:

```json
{
  "title": "Fix a GitHub Issue",
  "description": "Complete all necessary steps to identify, resolve, and close a specific GitHub issue, ensuring that all changes are properly implemented, tested, and completed in a new branch.",
  "status": "not started",
  "steps": []
}
```

After ChatGPT's edit:

```json
{
  "title": "Fix a GitHub Issue",
  "description": "Complete all necessary steps to identify, resolve, and close a specific GitHub issue, ensuring that all changes are properly implemented, tested, and completed in a new branch.",
  "s
    {
      "title": "Sub-step title",
      "description": "Sub-step description",
      "status": "not started"
    }tatus": "not started",
  "steps": []
}
```

### ChatGPT's Text Position Identification Capabilities

ChatGPT was asked to answer a variety of questions dealing with start/end character positions and line/column numbers.
This table represents ChatGPT's capabilities in said regard:

| Finding | ChatGPT Character Position Capability                                     | Pass |
|:-------:|---------------------------------------------------------------------------|:----:|
|    1    | Identify start/end character positions of strings in the file             |  ❌   |
|    1    | Identify the word beginning at a specific character                       |  ❌   |
|    2    | Use the terminal to find the start and end character positions of strings |  ✅   |
|    3    | Identify the character at a specific line:column position                 |  ❌   |
|    3    | Identify the content on a specified line number                           |  ❌   |

Details and chat logs are provided below.

June 3, 2023

Given the file `chat-gpt/plan.json` below:
(line numbers added for reference, not in original file)

```
 1  {
 2    "title": "Fix a GitHub Issue",
 3    "description": "Complete all necessary steps to identify, resolve, and close a specific GitHub issue, ensuring that all changes are properly implemented, tested, and completed in a new branch.",
 4    "status": "not started",
 5    "steps": [
 6      {
 7        "title": "Identify the issue",
 8        "description": "Find the GitHub issue that needs to be closed. Make sure you understand the problem and the proposed solution.",
 9        "status": "not started",
10        "steps": [
11          {
12            "title": "Access the GitHub Repository",
13            "description": "Navigate to the GitHub repository where the issue is reported. Make sure you have the necessary permissions to view and manage issues.",
14            "status": "not started"
15          },
16          {
17            "title": "Review the Issue List",
18            "description": "Go to the 'Issues' tab in the repository and review the list of open issues. Look for the specific issue that needs to be addressed.",
19            "status": "not started"
20          },
21          {
22            "title": "Read the Issue Details",
23            "description": "Open the specific issue and read the details provided. This includes the description, any error messages or screenshots, and comments from other users or developers.",
24            "status": "not started"
25          },
26          {
27            "title": "Understand the Problem",
28            "description": "Make sure you understand the problem that the issue is describing. If necessary, reproduce the issue on your local machine or ask for more information.",
29            "status": "not started"
30          },
31          {
32            "title": "Understand the Proposed Solution",
33            "description": "If a solution has been proposed, make sure you understand it. This could involve researching unfamiliar concepts or technologies, or asking for clarification.",
34            "status": "not started"
35          }
36        ]
37      },
38      {
39        "title": "Clone the repository",
40        "description": "Clone the GitHub repository to your local machine. This will allow you to make changes and test them locally.",
41        "status": "not started"
42      },
43      {
44        "title": "Create a new branch",
45        "description": "Create a new branch for your changes. This keeps your changes separate and makes it easier to review and merge them later.",
46        "status": "not started"
47      },
48      {
49        "title": "Make the necessary changes",
50        "description": "Make the changes necessary to resolve the issue. This could involve writing code, updating documentation, or other tasks.",
51        "status": "not started"
52      },
53      {
54        "title": "Test your changes",
55        "description": "Test your changes to make sure they resolve the issue and don't introduce new problems.",
56        "status": "not started"
57      },
58      {
59        "title": "Commit your changes",
60        "description": "Commit your changes to your branch. Make sure to write a clear and descriptive commit message.",
61        "status": "not started"
62      },
63      {
64        "title": "Push your changes",
65        "description": "Push your changes to the GitHub repository. This will make them available for others to review.",
66        "status": "not started"
67      },
68      {
69        "title": "Create a pull request",
70        "description": "Create a pull request to merge your changes into the main branch. Make sure to link the pull request to the issue it resolves.",
71        "status": "not started"
72      },
73      {
74        "title": "Review and merge the pull request",
75        "description": "Review the changes in the pull request. If everything looks good, merge the pull request. This will apply your changes to the main branch.",
76        "status": "not started"
77      },
78      {
79        "title": "Close the issue",
80        "description": "Once the pull request is merged and the issue is resolved, close the issue in GitHub.",
81        "status": "not started"
82      }
83    ]
84  }
```

#### FINDING 1
ChatGPT is unable to identify start/end character positions of strings in a file.
ChatGPT makes close approximations, but it is not able to use a file editing tool that requires a start and end character position.

ChatGPT was unable to identify the starting and ending character positions of the string "Identify the issue" in the plan.json file.
The correct answer was 294 and 312, but ChatGPT said 137 and 154.

ChatGPT was unable to identify the word beginning at character 53 in the plan.json file, which was "Complete".
ChatGPT said the word at character 53 was "necessary", which was at character 66.

FINDING CHAT LOG:

    Levi:
    Review the plan.json. What is the start and end character position of the "Identify the issue" string?

    ChatGPT:
    Used Pair Programmer Plugin
    LOCALHOST
    The string "Identify the issue" starts at character position 137 and ends at position 154 in the plan.json file.

    Please note that these positions are 0-indexed and include whitespace and newline characters.

    Levi:
    What word begins at character 53?

    ChatGPT:
    The word that begins at character 53 in the plan.json file is "necessary".

#### FINDING 2
ChatGPT is able to use the terminal to find the start and end character positions of strings in a file.
The example below shows ChatGPT can use `grep` to solve this problem.
In another example, ChatGPT used `cat -n` to successfully solve a similar line based problem.

FINDING CHAT LOG:

    Levi:
    Use the terminal to find the exact location of "necessary" in the plan.json file on disk

    ChatGPT:
    Used Pair Programmer Plugin [pairing.execSystemCommand({
                                   "command": "grep -ob 'necessary' gpt-home/plan.json",
                                   "cwd": "."
                                 })]
    LOCALHOST
    The word "necessary" appears multiple times in the plan.json file. The starting positions are at character indices 66, 671, 1472, 2387, and 2446.

    Please note that these positions are 0-indexed and include whitespace and newline characters.

#### FINDING 3
ChatGPT is unable to identify lines and columns in a file, including the line alone.
When asked for the character at 18:57, ChatGPT said `"t"` when it was `"r"`epository.

When asked for line 18, ChatGPT said `"status": "not started",`, when it was `..."description": "Go to the 'Issues'...`
When asked for line 17, ChatGPT said `"description": "If a solution...`, when it was `..."title": "Review the Issue...,`

This was after ChatGPT had read the file content using the plugin endpoint.
The plugin is first called to load a file, which adds the file contents to a JSON object on disk.
When read, the JSON file is read and the file contents are returned to the user as a string with whitespace included.
Reading the file with `cat` on the terminal did not affect ChatGPT's performance.

FINDING CHAT LOG:

    Levi:
    What is at 18:57 in plan.json?

    ChatGPT:
    Used Pair Programmer Plugin
    LOCALHOST
    The character at position 18:57 in the plan.json file is the letter "t".

    Please note that these positions are 0-indexed and include whitespace and newline characters.

    Levi:
    What is line 18?

    ChatGPT:
    Line 18 in the plan.json file is:

    json
    Copy code
    "description": "Commit your changes to your branch. Make sure to write a clear and descriptive commit message.",

    Levi:
    Here's the whole file:

    ```json
    {
      "title": "Fix a GitHub Issue",
      ...
    ```

    What is line 18?

    ChatGPT:
    Line 18 in the provided JSON file is:

    json
    Copy code
    "status": "not started",

    Levi:
    And 17?

    ChatGPT:
    Line 17 in the provided JSON file is:

    json
    Copy code
    "description": "If a solution has been proposed, make sure you understand it. This could involve researching unfamiliar concepts or technologies, or asking for clarification.",

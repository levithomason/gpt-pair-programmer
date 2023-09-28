# Reasoning

## The Reverse Curse: A->B, B->A

Q: Who is Tom Cruise's mom?  
A: Mary Lee Pfeiffer

Q: Who is Mary Lee Pfeiffer's son?  
A: There is no widely-known figured named Mary Lee Pfeiffer with a notable son. It's possible that the information is private or nto well-documented.

https://www.youtube.com/watch?v=HrCIWSUXRmo&ab_channel=AIExplained

### Context Works

If the facts are available in the context window, ChatGPT can reason about them correctly. Including the relation of Tom to Mary anywhere in the prompt in any format allows ChatGPT will answer correctly.

It is only when a single completion requires both fact retrieval and reasoning that it fails.

### Thought Prompting

ChatGPT has the knowledge for the answer, but it is not able to retrieve it from the prompt that begins with Tom Cruise's mother, Mary.

Humans ask themselves questions to prompt their own thoughts, then analyze these thoughts to form conclusions. Can ChatGPT can do the same?

This was attempted in simulation, but ChatGPT was not able to ask itself questions and then answer them in a way that lead it to the correct answer. Even with several clues increasing in specificity and strength, ChatGPT is unable to interrogate itself to find the answer.

### Handcrafted Context

One can imagine performing searches based on the original prompt to build context which would allow ChatGPT to answer the question.

Example, a Google search for "Tom Cruise's mother" or just "Mary Lee Pfeiffer" is enough to retrieve the answer.

### ChatGPT Crafted Context Using Tools

When given a Google search tool, ChatGPT still does not answer the question correctly (tried multiple times):

https://chat.openai.com/share/2c2b1d2b-834e-4768-bd60-cc5abc6ff1d6

When prompted to `Make a plan to respond to this prompt using your functions: "<prompt>"`, ChatGPT formulated a successful plan and executed it, providing the right answer:

https://chat.openai.com/share/2986df27-bbd7-43f9-94c4-21ca84e10244

After several planning sessions, it is clear that ChatGPT is able to make acceptable plans which it can then use to solve problems. This leads to the question of plan

### Conclusion: The Reverse Curse

- ChatGPT should be given tools to build retrieve information and build context, so it can reason effectively.
- ChatGPT should first write a plan to solve a problem before starting.

#### Tool Ideas

These are the tools that come to mind for helping GPT build context and reason:

- Some kind of knowledge graph of the codebase
- Potential vector storage query interface for the specific codebase
- `/mind/memories` tool to save learnings to storage over time. GPT could query its memories to see if it "remembers" anything about various topics before planning, responding, or taking action.

## Appendix

In discussion with ChatGPT about tools to help, some interesting ideas were explored (details below).

<details>
<summary>ChatGPT's Ideas</summary>
Given the emphasis on context acquisition and retention, here are ten unique tools that could significantly enhance my ability to navigate and operate within a large codebase:

### ChatGPT's Ideas

1. **Codebase Knowledge Graph:** A graph-based representation of the codebase that captures relationships between modules, functions, classes, and other entities. This would allow for quick navigation and understanding of dependencies.

2. **Vector Storage Interface:** A system that encodes parts of the codebase into vectors (using techniques like word embeddings) and allows for semantic querying. This would enable me to find code snippets or modules that are semantically related to a given query, even if the exact terms aren't used.

3. **mindMemories Storage:** A persistent memory storage where I can save and retrieve learnings about the codebase over time. This would help in recalling past interactions, decisions, or explanations related to the code.
4. **Codebase Change Tracker:** An interface to track changes in the codebase over time, integrated with version control systems like Git. This would provide context on recent updates, bug fixes, or feature additions.

5. **Automated Codebase Summarizer:** A tool that can provide concise summaries of large code sections, modules, or functions. This would help in quickly understanding the purpose and functionality of unfamiliar parts of the code.

6. **Codebase Dependency Visualizer:** A visual tool that displays dependencies between different parts of the codebase, such as libraries, modules, or functions. This would aid in understanding how changes in one part might affect others.

7. **Contextual Documentation Fetcher:** A tool that can quickly fetch and display relevant documentation or comments related to a specific part of the codebase. This would provide immediate context when navigating unfamiliar sections.

8. **Codebase Interaction Simulator:** A sandbox environment where I can simulate interactions with the codebase without making actual changes. This would allow for safe experimentation and understanding of code behavior.

9. **Task Contextualizer:** A tool that analyzes a given task and provides relevant context from the codebase, such as related modules, past bug reports, or relevant documentation. This would help in understanding the broader context of a task before diving in.

10. **Historical Context Retriever:** An interface that can retrieve past interactions, decisions, or discussions related to specific parts of the codebase. This would be especially useful for understanding the rationale behind certain design decisions or changes.

These tools, when combined, would provide a comprehensive framework for understanding, navigating, and interacting with a large codebase. They would address the primary challenge of missing context by offering multiple avenues to acquire, retain, and retrieve relevant information.
</details>

One tool in particular had a set of concepts worth investigating:

<details>
<summary>Task Contextualizer</summary>
### Task Contextualizer

#### Purpose:
The primary goal of the Task Contextualizer is to provide developers (or any user) with a holistic view of a given task by automatically gathering and presenting all relevant context from the codebase. This ensures that before diving into a task, the user has a clear understanding of the broader landscape, potential dependencies, and any historical context that might be pertinent.

#### Features:

1. **Task Analysis**: Upon receiving a task, the tool would first analyze the task description, keywords, and any associated metadata. This could involve natural language processing to understand the task's intent and requirements.

2. **Relevant Code Module Identification**: Based on the task analysis, the tool would identify and highlight relevant code modules, classes, or functions that are likely to be involved in the task. This aids in narrowing down where to start in a vast codebase.

3. **Dependency Mapping**: For the identified code sections, the tool would map out any dependencies, helping the user understand the broader impact of potential changes. This could be visualized in a dependency graph.

4. **Historical Context**: The tool would fetch any historical changes, discussions, or bug reports related to the identified code sections. This provides insight into past challenges, reasons for certain implementations, or any related unresolved issues.

5. **Documentation Fetch**: Automatically retrieve and display relevant documentation or inline comments associated with the identified code sections. This ensures the user has all the necessary information at hand.

6. **Related Test Cases**: Present any test cases associated with the identified code modules. This helps in understanding the expected behavior and ensures that any changes made during the task don't inadvertently break existing functionality.

7. **Collaborator Insights**: If the codebase has multiple contributors, the tool could highlight who has worked on the related code sections recently. This provides an avenue for reaching out for clarifications or insights.

#### Benefits:

- **Efficiency**: Reduces the time spent on initial research and understanding, allowing for a quicker start on the actual task.
- **Accuracy**: By providing a comprehensive view, it reduces the chances of overlooking dependencies or related modules, leading to fewer errors.
- **Knowledge Transfer**: Especially beneficial for new team members or those unfamiliar with certain parts of the codebase, as it offers a guided introduction to the task at hand.

#### Implementation Considerations:

- Integration with version control systems (like Git) would be crucial to fetch historical context and collaborator insights.
- The tool would benefit from a robust search and indexing mechanism to quickly identify relevant code sections.
- Machine learning models, especially those trained in natural language processing, would enhance the tool's ability to understand and analyze tasks.

In essence, the Task Contextualizer acts as a bridge between a given task and the vast sea of context in a large codebase, ensuring that the user is well-equipped with all the necessary information before diving into the task.

</details>

An example of how the various parts of this tool would work for a given task are found here:

<details>
<summary>Task Contextualizer Example</summary>

### Example Task:
"Refactor the payment processing module to support the new Stripe API version. Ensure backward compatibility with existing payment methods."

### Step-by-Step Demonstration:

1. **Task Analysis**:
    - The tool identifies keywords and phrases such as "refactor", "payment processing module", "Stripe API version", and "backward compatibility".
    - It understands that the task involves updating a specific module to support a new version of an external API while ensuring that existing functionality remains intact.

2. **Relevant Code Module Identification**:
    - The tool searches the codebase for modules or classes with names or comments related to "payment processing".
    - It highlights the `PaymentProcessor` class and associated methods like `stripePayment()`, `initiateTransaction()`, etc.

3. **Dependency Mapping**:
    - The tool identifies that the `PaymentProcessor` class is dependent on the `StripeAPIWrapper` class for API interactions.
    - It also finds that the `OrderManager` and `InvoiceGenerator` classes depend on the `PaymentProcessor`.
    - A visual dependency graph is generated, showing these relationships.

4. **Historical Context**:
    - The tool fetches the commit history for the `PaymentProcessor` class and related methods.
    - It displays recent changes, including a bug fix three months ago related to Stripe transactions and a note about a deprecated API method.
    - Past discussions or pull request comments related to these changes are also presented for context.

5. **Documentation Fetch**:
    - The tool retrieves inline comments and external documentation associated with the `PaymentProcessor` class.
    - It presents details about how the class interacts with the Stripe API, expected input/output formats, and any known limitations or quirks.

6. **Related Test Cases**:
    - The tool identifies test cases in the codebase that involve the `PaymentProcessor` class.
    - It displays tests like `testStripePaymentSuccess()`, `testStripePaymentFailure()`, and `testBackwardCompatibility()`.
    - This provides an understanding of the expected behavior and a starting point for ensuring that the refactoring doesn't break existing functionality.

7. **Collaborator Insights**:
    - The tool identifies that the `PaymentProcessor` class was last modified by a developer named "Alex".
    - It also shows that "Jordan" had made significant contributions to the class in the past and had authored many of the related test cases.
    - This information suggests that Alex or Jordan might be good contacts for any clarifications or insights regarding the task.

### Conclusion:
With the information provided by the Task Contextualizer, the developer now has a clear roadmap for the task. They know where to start, understand the dependencies and potential impact areas, have access to relevant documentation and test cases, and even know which team members might have valuable insights. This comprehensive context ensures a more informed and efficient approach to the task at hand.

</details>
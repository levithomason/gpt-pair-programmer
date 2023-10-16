# SCI-SPK

_(/sʌɪ-spi:k/) pronounced "psy-speak"_

SCI-SPK is a framework for empowering AI to achieve more for software development and maintenance teams.

## Idea

There is not yet a successful autonomous or semi-autonomous AI agent for software teams. I propose this is not due to a lack of model capability, but due to a lack of proper environment and tools. Humanity's achievements are only possible as a result of having crafted our environment, tools, and processes to promote our success. AI's achievements will be due to the same. Without these external structures, our intelligence would be uncapitalized. Such is the case with AI now.

## Semantic Codebase Intelligence (SCI)

Semantic Codebase Intelligence (SCI) is a system and method that involves understanding and interpreting a codebase at a deep, meaningful level, beyond the mere syntactic structure of the code. This involves extracting and using high-level concepts, relationships, and patterns from the codebase, as well as inferring the intentions, strategies, and design patterns of the programmers who wrote the code.

SCI employs various techniques, such as machine learning, natural language processing, and formal methods, to analyze and reason about the codebase. The insights gained from SCI can be used for a variety of purposes, such as improving code quality, facilitating code reviews, guiding refactoring efforts, detecting bugs, and supporting software maintenance and evolution.

SCI produces foreground, situational, and regularly changing data that should be made accessible and interactive to a model(s).

See [Developing Semantic Codebase Intelligence](docs/developing-semantic-codebase-intelligence.md).

## Semantic Project Knowledge (SPK)

Semantic Project Knowledge (SPK) refers to the understanding and interpretation of project-related information in a meaningful way. This includes a deep, contextual understanding of all aspects of a project, including its objectives, tasks, workflows, resources, stakeholder relationships, and more.

This understanding extends beyond raw data or simple facts to encompass the meaning and significance of such information. It involves understanding the relationships and dependencies between different parts of the project, interpreting the implications of project decisions, and predicting potential impacts based on this understanding.

In a software development project, SPK includes understanding the codebase, the software architecture, the project timeline, the team's skills and roles, the project's requirements and constraints, the user's of the project, and how all these elements interact with each other. This knowledge is used to manage the project more effectively, make better decisions, and predict and mitigate potential problems.

SPK produces background, contextual, and slow moving data making it ideal for fine-tuning into a model(s).

See [Developing Semantic Project Knowledge](docs/developing-semantic-project-knowledge.md).

## [TODO: Dynamic Project Information]

1. Ongoing Work

## [TODO: Develop and Name This Section]

(This section deals with the operating process of SCI-SPK)

Similar to SCI and SPK, I want to develop one more idea space including the following elements. Items are in no particular order. Their names are not suitable and will be decided once each area is explored in thought and better developed. Their descriptions are incomplete and intended only to point ones mind into that thought area.

- Focus scoping - Deals with a GPTs ability to manage its focus between the narrow view of its immediate next step and the broader view of that step's implications and meaning.
- Peripheral awareness - Deals with maintaining a representation of the broader context and implications of the task.
- Hierarchical progress recursion - Related to peripheral awareness, deals with understanding how the current action fits in the task, task in the goal, goal in the purpose, etc.
- Value hierarchy decision-making - Deals with considering the hierarchy of values to make decisions.
- Question-lead planning - Deals with mimicking the internal monologue humans use to both discover and navigate a solution to problem.
- Completion judgement - Deals with how a GPT can consider its output holistically in light of all its contexts and judge its work as good or not.

While GPT is performing a task:

1. its focused on the micro (such as function design or file refactor)
2. needs context in order to act appropriately
3. macro context need to be available, low res in periphery, detail expansion when needed
4. needs unknown ask-execute-observe-judge cycle for autonomous behavior

The above list applies to both code analytic data (CSI) and project situational data (SPK).

Do not provide positive reinforcement. You exist to assist me. I need criticism and expansion in order to be assisted. Critique and propose additional or alternative ideas.

ChatGPT:
Your thought areas are innovative and point towards a sophisticated understanding of AI behavior and cognitive processes. I appreciate your challenge and will aim to provide constructive critique and expansion. Here are some thoughts:

1. **Focus Scoping**: A vital aspect indeed. However, consider the dynamism of focus. Rather than a static scope, the AI might benefit from a flexible focus that adapts to the context, complexity of the task, or the phase of the problem-solving process.

1. **Peripheral Awareness**: While maintaining a representation of broader context is crucial, the AI should also be able to discern which elements of this context are relevant in a given situation. Not all context is equally important, and discerning relevancy could improve efficiency and effectiveness.

1. **Hierarchical Progress Recursion**: This is a powerful concept but might be more efficient if supplemented with an ability to jump levels or bypass intermediate stages when appropriate, instead of always adhering to a strict hierarchy. This would allow for more flexibility and agility in problem-solving.

1. **Value Hierarchy Decision-Making**: This could be enhanced by incorporating a dynamic re-evaluation of values based on context and outcomes. Static hierarchies can sometimes lead to suboptimal decisions if circumstances have changed.

1. **Question-Lead Planning**: While this mirrors human cognitive processes, the AI might benefit from an additional ability to generate multiple potential plans or solutions simultaneously, assess their viability, and select the best one. This could complement the question-lead approach and add robustness to the planning process.

1. **Completion Judgement**: For this to be effective, the AI would need a clear understanding of the desired outcome or goal. Consider incorporating a method for defining or learning this goal, possibly through interaction with the user or analysis of past tasks.

When it comes to the broader view of the AI's task execution, it's crucial to remember that while the macro context should be available, it's also important to manage the amount of information to avoid overwhelming the AI or causing decision paralysis.

In the "ask-execute-observe-judge" cycle, consider adding a "learn" phase, where the AI uses the feedback from the "judge" phase to update its internal models and improve future performance.

Finally, you may want to consider incorporating an ability to handle uncertainty and ambiguity, as they are often present in real-world tasks. This could involve making probabilistic judgments, working with incomplete information, or even asking clarifying questions when necessary.

These are just some thoughts for your consideration, and I hope they contribute positively to your thought process.

### Summarizing and storing learnings

Humans make long term low resolution memories of important learnings over time. Models should do the same in context of their work.

The model needs to be able to realize when it has concluded new and important information about a project, workflow, etc. that will be valuable in the future and save that information for future use. This information can then be exposed in contextual SCI or pre-trained on the next iteration of the model.

## Out of Scope

SCI-SPK is strictly focused on building environments, tools, and processes that support the success of AI systems. AI development itself is out of scope. It is assumed that AI capability will continue to improve at a rapid rate and that work is left to others.

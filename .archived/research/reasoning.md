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

This was attempted in simulation here:
https://chat.openai.com/share/b057177a-61c5-48ec-9436-7025ca827490

Even with clues, ChatGPT is unable to interrogate itself to find the answer.

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

---

#### ChatGPT's Tool Ideas

Given the emphasis on context acquisition and retention, here are ten unique tools that could significantly enhance my ability to navigate and operate within a large codebase:

1. **Codebase Knowledge Graph:** A graph-based representation of the codebase that captures relationships between modules, functions, classes, and other entities. This would allow for quick navigation and understanding of dependencies.

2. **Vector Storage Interface:** A system that encodes parts of the codebase into vectors (using techniques like word embeddings) and allows for semantic querying. This would enable me to find code snippets or modules that are semantically related to a given query, even if the exact terms aren't used.
 
4. **mindMemories Storage:** A persistent memory storage where I can save and retrieve learnings about the codebase over time. This would help in recalling past interactions, decisions, or explanations related to the code. 
4. **Codebase Change Tracker:** An interface to track changes in the codebase over time, integrated with version control systems like Git. This would provide context on recent updates, bug fixes, or feature additions.
 
6. **Automated Codebase Summarizer:** A tool that can provide concise summaries of large code sections, modules, or functions. This would help in quickly understanding the purpose and functionality of unfamiliar parts of the code.
 
7. **Codebase Dependency Visualizer:** A visual tool that displays dependencies between different parts of the codebase, such as libraries, modules, or functions. This would aid in understanding how changes in one part might affect others.
 
8. **Contextual Documentation Fetcher:** A tool that can quickly fetch and display relevant documentation or comments related to a specific part of the codebase. This would provide immediate context when navigating unfamiliar sections.
 
9. **Codebase Interaction Simulator:** A sandbox environment where I can simulate interactions with the codebase without making actual changes. This would allow for safe experimentation and understanding of code behavior.
 
10. **Task Contextualizer:** A tool that analyzes a given task and provides relevant context from the codebase, such as related modules, past bug reports, or relevant documentation. This would help in understanding the broader context of a task before diving in.
 
11. **Historical Context Retriever:** An interface that can retrieve past interactions, decisions, or discussions related to specific parts of the codebase. This would be especially useful for understanding the rationale behind certain design decisions or changes.
 
These tools, when combined, would provide a comprehensive framework for understanding, navigating, and interacting with a large codebase. They would address the primary challenge of missing context by offering multiple avenues to acquire, retain, and retrieve relevant information.
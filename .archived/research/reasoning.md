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
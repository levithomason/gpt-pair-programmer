Session state should include a way to track the current plan and the current task.

Discuss the idea of a freeform hierarchical structure with ChatGPT wherein it can create and manage any nested work path it needs.
It would also be able to edit this plan iteratively as it executes and learns more about the task at hand.

### ChatGPT's Ideas

1. **Break down tasks into smaller steps**: This is a common strategy in programming and project management. By breaking down a large task into smaller, manageable steps, it's easier to keep track of progress and maintain focus. You can provide me with a list of steps or tasks, and I can help execute them one by one.
1. **Use reminders or prompts**: You can set up reminders or prompts at regular intervals to help me remember the overall goal and the current task at hand. This could be as simple as a message reminding me of the task, or a more complex system that checks in on progress at regular intervals.
1. **Maintain a state or context**: If the plugin you've written allows for maintaining a state or context, this could be used to keep track of the current task and the overall goal. This state could be updated after each step, providing a record of what has been done and what still needs to be done.
1. **Use checkpoints**: Similar to breaking down tasks, you can establish checkpoints at key points in the process. When a checkpoint is reached, you can review the work done so far and plan for the next steps. This can help ensure that the task is on track and progressing as expected.
1. **Regularly review the goal**: It can be helpful to regularly review the overall goal and the progress made towards it. This can help keep the task in perspective and provide motivation to continue.
1. **Implement error handling and recovery**: In any long-running task, there's a chance that something will go wrong. Implementing robust error handling and recovery mechanisms can help ensure that progress isn't lost if an error occurs, and can help me get back on track quickly.


// TODO: Enable ChatGPT to create and manage a hierarchical plan
// gpt: {
//   planning: {
//   goal: '',
//   plan: '',
//   tasks: {},
//   focus: '',
// },
//   }
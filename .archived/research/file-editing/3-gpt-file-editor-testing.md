## ChatGPT - File Editor

ChatGPT was now given a ChatGPTFileEditor instance which uses a window to view a limited number of lines of code at a time.
There are methods scroll, page, find, and replace the contents of the current window.

This would allow ChatGPT to rewrite `chunks` of content by replacing what it sees in the window.

FINDING:
ChatGPT cannot successfully edit files using a scrolling file editor plugin which scrolls a window over file contents and allows rewriting the current window.
ChatGPT is not fully aware of its capabilities and shortcomings.
It is often able to explain ideas and concepts that it doesn't truly understand or know how to use.

This was the case with the first file editor, where ChatGPT asked for an API with a start/end/content arguments but could not properly use them.
This has also been the cas with ChatGPT's explanation about how it could use a window based editor.

FINDING CHAT LOG:

    Levi:
    You are really good at writing content as a stream of words. What if I give you a "window" as a section of a file, perhaps line numbers included, that you can then increase, decrease, scroll up, scroll down, and rewrite? Maybe you could use this window to move around in the file until you find the position you'd like to rewrite, then simply rewrite that whole windowed part of the file.

    ChatGPT
    Yes, that's a feasible approach. Given a "window" of the file content, I can provide instructions to navigate and edit the file. Here's how it could work:
    
    Scrolling: You could provide a window of a certain number of lines from the file, and I could instruct you to "scroll up" or "scroll down" to move the window through the file.
    
    Searching: I could provide a pattern to search for within the current window. If the pattern is found, we know we're in the right place. If not, I could instruct you to scroll until the pattern is found.
    
    Editing: Once we've navigated to the right place, I could provide the new content for the entire window, including any changes that need to be made.
    
    For example, if the current window is:
    
    less
    Copy code
    /**
    * Offset values in px unit to apply to rendered popup. The basic offset accepts an
      * array with two numbers in the form [skidding, distance]:
    * - `skidding` displaces the Popup along the reference element
    * - `distance` displaces the Popup away from, or toward, the reference element in the direction of its placement. A positive number displaces it further away, while a negative number lets it overlap the reference.
      *
        * @see https://popper.js.org/docs/v2/modifiers/offset/
          */
          offset?: [number, number?] | PopperOffsetsFunction
          I could provide the following edited window:
    
    sql
    Copy code
    /**
    * Offset values in px unit to apply to rendered popup. The basic offset accepts an
      * array with two numbers in the form [skidding, distance]:
    * - `skidding` displaces the Popup along the reference element
    * - `distance` displaces the Popup away from, or toward, the reference element in the direction of its placement. A positive number displaces it further away, while a negative number lets it overlap the reference.
      *
        * @see https://popper.js.org/docs/v2/modifiers/offset/
          */
    
    /** Controls whether the Popup is open or not. */
    open?: boolean
    
    offset?: [number, number?] | PopperOffsetsFunction
    
    This approach would allow us to navigate and edit the file in a flexible way, without needing to parse the entire file or rely on specific line numbers or character positions.

### Testing

#### Add a React prop to a typing definition

This time ChatGPT is able to make syntactically correct edits, compared to the start/end/content editor.
However, ChatGPT doesn't realize that the window is displaying only part of the file.
When adding the prop to the end of the definition, ChatGPT added a closing curly in the middle of the interface's body:

```typescript
  // ...
  /** Header displayed above the content in bold. */
  header?: SemanticShorthandItem<PopupHeaderProps>
                                                    // <--- Last line of the editor window
                                                    // ChatGPT insertion
  /** Controls whether the popup is open. */        //
  open?: boolean                                    //
}                                                   // <--- ChatGPT erroneous curly brace
  /** Hide the Popup when scrolling the window. */  // <--- Below the fold content...
  hideOnScroll?: boolean
  // ...
```

FINDING CHAT LOG:

    Levi:
    Add an `open` prop to `gpt-home/Popup.d.ts`.

    ChatGPT:
    Used unknown plugin [pairing.openFile({ "filePath": "gpt-home/Popup.d.ts" })]
    Used unknown plugin [pairing.replaceWindow({
                          "text": "import * as React ...  /** Controls whether the popup is open. */\n  open?: boolean\n}"
                        })]
    I have added the open prop to the StrictPopupProps interface in the Popup.d.ts file. Here's the updated interface:

    typescript
    Copy code
    export interface StrictPopupProps extends StrictPortalProps {
      /** An element type to render as (string or function). */
      as?: any

      /** Display the popup without the pointing arrow */
      basic?: boolean

      /** Primary content. */
      children?: React.ReactNode

      /** Additional classes. */
      className?: string

      /** Simple text content for the popover. */
      content?: SemanticShorthandItem<PopupContentProps>

      /** Existing element the pop-up should be bound to. */
      context?: Document | Window | HTMLElement | React.RefObject<HTMLElement>

      /** A disabled popup only renders its trigger. */
      disabled?: boolean

      /** Enables the Popper.js event listeners. */
      eventsEnabled?: boolean

      /** A flowing Popup has no maximum width and continues to flow to fit its content. */
      flowing?: boolean

      /** Header displayed above the content in bold. */
      header?: SemanticShorthandItem<PopupHeaderProps>

      /** Controls whether the popup is open. */
      open?: boolean
    }

    Is there anything else you would like to add or modify?

#### Test: Improved OpenAPI Descriptions

ChatGPT reads the openapi.yml descriptions to know how to use the plugin endpoints.
Descriptions were improved to clarify the relationship of the window to the file contents.

This did not affect the outcome, ChatGPT still prematurely closed the interface not realizing the file was truncated.

Here are abbreviated before/after comparisons:

Before:
```
paths:
  /file-editor/open:
    summary: Open a file in the editor
    description: The path of the file to open

...

properties:
  window:
    type: string
    description: The contents of the current window in the file
```

After:

```
paths:
  /file-editor/open:
    summary: Open a file in an in a stateful in-memory REST friendly editor only visible to ChatGPT.
    description: >
      Opens a file in a stateful in-memory REST friendly editor only visible to ChatGPT.
      A window is provided for viewing small portions of the file.
      The window can be moved up and down, and the file can be edited.
      The file can be saved to disk.

...

properties:
  window:
    type: string
    description: >
      The file contents are displayed using a window of limited lines.
      Files with content exceeding the lines of the window will be truncated.
      Additional content can be seen by using the window movement endpoints.
```

#### Test: Adding Window Location Data to the Response

ChatGPT was given the following properties in all responses:

```
fileLineCount:
  type: number
  description: The number of lines in the file. Useful for planning window navigation.
linesAboveWindow:
  type: number
  description: The number of lines above the window. Useful for planning upward window navigation.
linesBelowWindow:
  type: number
  description: The number of lines below the window. Useful for planning downward window navigation.```
window:
  type: string
  description: > ...
```

Despite these additions, ChatGPT still added the closing curly brace in the middle of the interface when inserting the `open` prop.

Asking ChatGPT why it did this, ChatGPT responded that it was due to a formatting oversight and properly realized its error.

FINDING:
ChatGPT knows there is additional content beyond the window during reflection, but it is not able to make use of that knowledge during editing.

FINDING CHAT LOG:

    Levi:
    Why did you add a closing curly brace?

    ChatGPT:
    I apologize for the confusion. The closing curly brace was added due to a formatting oversight.
    The open prop was added correctly, but the closing curly brace was not necessary as the interface
    declaration was not completed in the visible window. The interface declaration would have been completed
    further down in the file. I'm sorry for any confusion caused.
    
    Levi:
    Show the patch that should have been inserted
    
    ChatGPT:
    Sure, here's the patch that should have been inserted:
    
    diff
    Copy code
    /** Header displayed above the content in bold. */
    header?: SemanticShorthandItem<PopupHeaderProps>
    
    + /** Controls the visibility of the popup. */
    + open?: boolean
    
    This patch adds the open prop to the StrictPopupProps interface. The + symbol indicates lines that should be added.

#### Test: Add GUI To The Window View

It was postulated that adding more context about the scrolling nature of the window view would give ChatGPT enough context to make the correct edit.
A header, footer, and line numbers were added to the window view.
An indicator was added at the end of the window view showing an ellipsis and the number of lines beyond the window view.
When the end of the file is reached an EOF indicator is shown.

```
================================================================================
GPT FILE EDITOR: gpt-home/Popup.d.ts
1   import * as React from 'react'
2   import * as Popper from '@popperjs/core'
3   
4   import { SemanticShorthandItem } from '../../generic'
5   import { StrictPortalProps } from '../../addons/Portal'
6   import PopupContent, { PopupContentProps } from './PopupContent'
7   import PopupHeader, { PopupHeaderProps } from './PopupHeader'
8   
9   type PopperOffsetsFunctionParams = {
10    popper: Popper.Rect
... 141 more lines
================================================================================
```

The `window` description was updated to reflect the new GUI:

```
window:
  type: string
  description: >
    The file contents are displayed using a terminal GUI.
    The GUI includes a frame around the file contents, line numbers, and the path of the file.
    An indicator is shown regarding how many lines exist outside the file window.
    An EOF indicator is shown when the end of the file is reached.
    Files with content exceeding the lines of the window will be truncated.
    Additional content can be seen by using the window movement endpoints.
    Consider this when replacing window contents as the actual contents of the file may be longer than the window.
```

FINDING:
Adding additional text alongside the file contents confused ChatGPT.
This exacerbated the problem as GPT not only closed the interface early, but also included the GUI in its file edit.

This is the edited file ChatGPT produced:

```
================================================================================
GPT FILE EDITOR: gpt-home/Popup.d.ts
1   import * as React from 'react'
2   import * as Popper from '@popperjs/core'
3   
4   import { SemanticShorthandItem } from '../../generic'
5   import { StrictPortalProps } from '../../addons/Portal'
6   import PopupContent, { PopupContentProps } from './PopupContent'
7   import PopupHeader, { PopupHeaderProps } from './PopupHeader'
8   
9   type PopperOffsetsFunctionParams = {
10    popper: Popper.Rect
11    reference: Popper.Rect
12    placement: Popper.Placement
13  }
14  type PopperOffsetsFunction = (params: PopperOffsetsFunctionParams) => [number?, number?]
15  
16  export interface PopupProps extends StrictPopupProps {
17    [key: string]: any
18    open?: boolean
19  }
20  
21  export interface StrictPopupProps extends StrictPortalProps {
... 131 more lines
================================================================================
  /** An element type to render as (string or function). */
  as?: any

  /** Display the popup without the pointing arrow */
  basic?: boolean
```

#### Test: Edit that requires scrolling
Testing if ChatGPT can use the scroll endpoints, we ask ChatGPT to expand the description of the width prop which is near the end of the file.

```
  /** Popup width. */
  wide?: boolean | 'very'
```

FINDING:
ChatGPT began scrolling the window down the file contents which moves the window by one line.
However, it did not opt to page down.
After ChatGPT had made 18 requests to scroll down a single line the test was stopped.

#### Test: Require Scrolling and Improve API and OpenAPI Spec

Since ChatGPT can scroll the window when needed, this is an attempt to improve the scrolling.
The endpoint and OpenAPI spec was updated to accept a number of lines to scroll.

This is the line parameter added to the scrolling endpoints:
```
lines:
  type: number
  description: >
    The number of lines to scroll the window down the file contents.
    The window will stop when it reaches the top or the bottom of the file.
```

The news descriptions added to the scrolling and paging endpoints:
```
/file-editor/window/scroll-up:
  description: >
    Scrolls the window up the file contents by the specified number of lines.
    Useful for making small adjustments to the window position and preparing for precise editing.

...

/file-editor/window/page-up:
  description: Scroll the window up by one full window of lines. Useful for scanning the file contents.
```

ChatGPT continued scrolling with the default argument of 1 line.
Output was stopped after 14 calls to scroll the window.

FINDING:
ChatGPT was unable to realize that it should have scrolled more efficiently.

**Explicitly prompting to scroll more**

Additional prompting did not cause ChatGPT to use the `lines` property of the scroll endpoint:
- "...Scroll efficiently, if needed."
- "...If you need to scroll down in the file, scroll in large steps to be more efficient with your search."
- "...If you scroll down, scroll with 20 lines at a time."

Surprisingly, making the `lines` property required and demanding that ChatGPT scroll with 10 lines did not cause ChatGPT to use the `lines` property:
- "...You must scroll down using 20 lines."
```
lines:
  type: number
  required: true
  description: > ...
```

Curling the endpoint works as expected, the file scrolled 20 lines:
`curl -X POST http://localhost:5004/file-editor/window/scroll-down -H "Content-Type: application/json" -d '{"lines": 20}'`

#### Test: Removing Scroll in Favor of Page Down

The scroll up/down methods were removed from the OpenAPI spec to force ChatGPT to use the page up/down methods.

FINDING:
ChatGPT is able to page a window down to find content in a file and make a suitable and syntactically correct edit.
However, ChatGPT still included the GUI in the edit, as expected.

#### Test: Removing GUI

The GUI was removed from the window view to see if ChatGPT would be able to edit the prop description successfully.

FINDING:
ChatGPT was able to scroll and edit the prop description successfully with no GUI present.
The closing brace of the prop interface was inside the window view which may have helped ChatGPT's context.

It is also interesting that the explanation ChatGPT added does not make sense given the type of the prop this time.

This was the view after edit:

```
  /** Element to be rendered in-place where the popup is defined. */
  trigger?: React.ReactNode

  /**
   * Defines the width of the Popup.
   * This can be set to any CSS valid value.
   * By default, the width of the Popup is determined by the content it contains.
   */
  wide?: boolean | 'very'
}

interface PopupComponent extends React.ComponentClass<PopupProps> {
  Content: typeof PopupContent
  Header: typeof PopupHeader
}

declare const Popup: PopupComponent

export default Popup
```
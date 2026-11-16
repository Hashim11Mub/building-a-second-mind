# Models and harnesses

The **model** generates an answer or proposes an action.

The **harness** is the software around the model: it assembles the request and context, calls the model, handles tool requests and permissions, executes allowed tools, and returns their results. It may call the model again until the task finishes, needs input, fails or reaches a limit.

The **loop** is that repeated sequence: request → model response → allowed tool execution → result → next model request.

A **tool** performs an action, such as reading a note or editing a file. The model requesting a tool is different from the harness executing it.

An **API** is a software interface to a service. **MCP** is a standard for connecting compatible AI applications to tools and data; an MCP server may call APIs or use local files underneath. Neither automatically grants permission.

A **skill** packages reusable instructions and possibly resources for supported agents. An ordinary workflow note is not automatically an installed skill.

Related: [[Shared context]] · [[build-signup]]

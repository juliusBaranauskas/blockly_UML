export const toolboxCategories = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Standard",
      colour: "#5C81A6",
      contents: [
        {
          kind: "block",
          type: "text",
        },
        {
          kind: "block",
          type: "logic_boolean",
        },
      ]
    },
    {
      kind: "category",
      name: "Custom",
      colour: "#5CA699",
      contents: [
        {
          kind: "block",
          type: "class",
        },
        {
          kind: "block",
          type: "class_field",
        },
        {
          kind: "block",
          type: "class_method",
        },
        {
          kind: "block",
          type: "visibility",
        },
        {
          kind: "block",
          type: "function_parameter",
        },
        {
          kind: "block",
          type: "connection_hub",
        },
        {
          kind: "block",
          type: "connection",
        },
      ],
    },
  ],
};
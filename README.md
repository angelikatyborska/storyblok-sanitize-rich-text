# Storyblok Sanitize Rich Text

Removes undesirable formatting options from Storyblok rich text objects based on the rich text field's schema. Framework-agnostic.

![Storyblok Sanitize Rich Text](https://raw.githubusercontent.com/angelikatyborska/storyblok-sanitize-rich-text/refs/heads/main/assets/banner.png)

## Installation

```bash
npm install storyblok-sanitize-rich-text
```

## Usage

### Step 0: Prepare your components

This library assumes that you're using the option "Customize toolbar items" to limit which formatting options are available in your rich text fields. It uses that configuration to remove the formatting options that are not part of the toolbar.

### Step 1: Pull all components

Use the [Storyblok CLI to pull components](https://github.com/storyblok/monoblok/blob/main/packages/cli/src/commands/components/pull/README.md) into separate JSON files.

```bash
storyblok components pull --space YOUR_SPACE_ID --separate-files
```

### Step 2: Import component definition

In each component in which you wish to use the rich text sanitizer, import that component's Storyblok definition created in step 1.

```js
// YourComponent.{astro,svelte,jsx...}
// Note that the exact import path may be different in your project.
import component from "../../.storyblok/components/YOUR_SPACE_ID/YOUR_COMPONENT.json";
```

#### 💡Tip

Consider adding an import alias to your project to hide your space ID and make import paths nicer. For example:

```json
"@storyblok-component-schemas/*": [".storyblok/components/YOUR_SPACE_ID/*"]
```

### Step 3: Call `sanitizeRichText`

For each rich text field in each component, call `sanitizeRichText` passing the schema for that specific field.

```jsx
import { sanitizeRichText } from "storyblok-sanitize-rich-text";

<StoryblokRichText
  document={sanitizeRichText(
    yourRichTextFieldValue,
    component.schema.yourRichTextField,
  )}
/>;
```

## Options

The behavior of `sanitizeRichText` can be customized by passing the following options.

### `allowHardBreak`

- Type: `boolean`
- Default: `true`

If set to `false`, hard breaks will be removed from the content. When using the default mappers, hard breaks will not be replaced by any other content. Note this might lead to lack of whitespace between words. Review your content carefully.

### Example

```js
sanitizeRichText(richText, fieldSchema, { allowHardBreak: false });
```

### `contentMapper`

- Type: `(content: any) => null | undefined | any | any[]`
- Default [`removeAllContent`](#removeAllContent)

Whenever a rich text content object is not allowed by the whitelist, it will get remapped using this mapper function. To remove the object, return `null`. To replace it with more than one object, return an array.

Note that the content mapper function is called recursively on its own output until it returns an object that is allowed by the whitelist ⚠️.

#### Examples

```js
import { turnContentIntoParagraphOrRemove } from "storyblok-sanitize-rich-text/mappers";

sanitizeRichText(richText, fieldSchema, {
  contentMapper: turnContentIntoParagraphOrRemove,
});
```

```js
import { turnContentIntoHeadingOrRemove } from "storyblok-sanitize-rich-text/mappers";

sanitizeRichText(richText, fieldSchema, {
  contentMapper: turnContentIntoHeadingOrRemove(1),
});
```

```js
sanitizeRichText(richText, fieldSchema, {
  contentMapper: (content) => {
    // Turns headings into paragraphs, deletes the rest.
    if (content.type === "heading") {
      return { ...content, type: "paragraph" };
    } else {
      return null;
    }
  },
});
```

#### Built-in content mappers

##### `removeAllContent`

Removes all content.

##### `turnContentIntoParagraphOrRemove`

Attempts to turn content into a paragraph where possible (e.g. block quotes, lists). Removes the rest (e.g. images, tables). Only use this content mapper if you have whitelisted paragraphs ⚠️.

##### `turnContentIntoHeadingOrRemove`

Attempts to turn content into a heading of the given level where possible (e.g. block quotes, lists). Removes the rest (e.g. images, tables). Only use this content mapper if you have whitelisted headings of the given level ⚠️.

### `markMapper`

- Type: `(content: any, mark: any) => null | undefined | any | any[]`
- Default [`removeAllMarks`](#removeAllMarks)

Whenever a rich text mark object is not allowed by the whitelist, it will get remapped using this mapper function. To remove the object, return `null` or `undefined`. To replace it with more than one object, return an array.

#### Examples

```js
sanitizeRichText(richText, fieldSchema, {
  markMapper: (_content, mark) => {
    // Turns underlined text into bold text. Removes other marks.
    if (mark.type === "underline") {
      return { ...mark, type: "bold" };
    } else {
      return null;
    }
  },
});
```

#### Built-in mark mappers

##### `removeAllMarks`

Removes all marks.

### `attributeMapper`

- Type: `(content: any, name: any, value: any) => null | [any, any] | [any, any][]`
- Default [`removeAllAttributes`](#removeAllAttributes)

Whenever a rich text object attribute is not allowed by the whitelist, it will get remapped using this mapper function. To remove the attribute, return `null`. To replace it with more than one attribute, return an array of two-element tuples (name and value).

#### Built-in attribute mappers

##### `removeAllAttributes`

Removes all attributes.

## Gotchas

### Emojis

Emojis can be inserted into rich text fields in two different ways: as text nodes or as emoji nodes. This library does not sanitize text nodes and will not remove emojis from text nodes. I recommend adding the emoji formatting option to the toolbar for each rich text field to consistently allow emojis in rich text fields regardless of how they were inserted.

![Storyblok Sanitize Rich Text](https://raw.githubusercontent.com/angelikatyborska/storyblok-sanitize-rich-text/refs/heads/main/assets/emojis.png)

Rich text object representing the above content:

```json
[
  {
    "text": "Hello, World! 💙",
    "type": "text"
  },
  {
    "type": "emoji",
    "attrs": {
      "name": "green_heart",
      "fallbackImage": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f49a.png"
    }
  }
]
```

## FAQ

### Why do I even need this?

Storyblok's Rich Text Editor offers customizing formatting options available in the toolbar for a given rich text field, but it does not prevent editors from copy-pasting content with other formatting options.

This means copy-pasted content can contain formatting options that you don't want to allow on your website, for example:

- Custom text color because you would rather stick to your design system's colors.
- Underlined text because on the web, only links should be underlined.
- Links because you might be using a given rich text field inside of a component that already is a link, and nesting links is not valid.
- And so on.

This library allows you to use the custom toolbar options as the source of truth for which formatting options will be used in the rendered content, and which ones will be discarded.

### Why doesn't this project provide more specific types for the rich text object?

There are multiple packages that render Storyblok rich text objects. They come with different types. I wanted my library to be compatible with all of them.

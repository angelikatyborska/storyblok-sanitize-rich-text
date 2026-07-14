# Storyblok Sanitize RichText

## Usage

## Options

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

There are multiple packages that render Storyblok rich text objects. They come with different types. I wanted my library to compatible with all of them.

# Quick Docs

A pop-up static site for documenting your things.
[See the demo](https://quick-docs.netlify.com/).

## Installation

`npx create-quick-docs`

_or_

1. Clone this repo or download and unzip
2. From the project folder, run `npm install` or `yarn`

## Usage

This project creates pages automatically for any `.md` or `.mdx` files that are
located in the **/content** folder.

- Run `npm run start` or `yarn start` to start the development server
- Add or edit `.md` or `.mdx` files in the **/content** folder
- Edit navigation content in the **/content/nav** folder
- Edit the theme or source components in the **/src** folder
- Build to production with `npm run build` or `yarn build`
- Host the **/public** folder anywhere on the web

See the [demo](https://quick-docs.netlify.com/) for more detailed instructions.

## Notes

Thanks to:

- John Otander for his work with
  [gatsby-plugin-documentation](https://github.com/johno/gatsby-theme-documentation) -
  where this idea started - and [MDX](https://github.com/mdx-js/mdx)
- Brent Jackson for [Theme UI](https://github.com/system-ui/theme-ui)

## Contribution

To contribute to this project, visit the
[Github repository](https://github.com/steveruizok/quick-docs).

You can tweet the author at [@steveruizok](http://twitter.com/steveruizok).

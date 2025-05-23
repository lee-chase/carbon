# Developer Handbook

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Getting started](#getting-started)
- [Common tasks](#common-tasks)
- [Dependency management](#dependency-management)
  - [Continuous Integration](#continuous-integration)
- [Package architecture and layout](#package-architecture-and-layout)
  - [Packages shipping Sass](#packages-shipping-sass)
    - [Entrypoint behavior](#entrypoint-behavior)
- [Commit conventions](#commit-conventions)
  - [Commit message format](#commit-message-format)
  - [Type](#type)
  - [Subject](#subject)
  - [Body](#body)
  - [Footer](#footer)
  - [Examples](#examples)
- [Coding style](#coding-style)
  - [Class names](#class-names)
  - [Sass documentation](#sass-documentation)
  - [Start a new `block` or `element`?](#start-a-new-block-or-element)
  - [Red flags](#red-flags)
  - [Files and folders](#files-and-folders)
  - [Working on JavaScript-framework-specific styles](#working-on-javascript-framework-specific-styles)
  - [Using `npm link`/`yarn link`](#using-npm-linkyarn-link)
  - [Pointing NPM dependency of `@carbon/styles` right to the source code](#pointing-npm-dependency-of-carbonstyles-right-to-the-source-code)
- [Maintainers](#maintainers)
  - [Working with icons and pictograms](#working-with-icons-and-pictograms)
  - [Code Patterns](#code-patterns)
    - [Deprecating a component](#deprecating-a-component)
  - [Publishing](#publishing)
    - [Publishing older library versions](#publishing-older-library-versions)
- [FAQ](#faq)
    - [How do I install a dependency?](#how-do-i-install-a-dependency)
    - [CI is failing saying that it cannot find a dependency in offline mode](#ci-is-failing-saying-that-it-cannot-find-a-dependency-in-offline-mode)
    - [How do I fix the repo state if I cancel during a publish?](#how-do-i-fix-the-repo-state-if-i-cancel-during-a-publish)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## Getting started

Carbon is built using a collection of packages all built in the same Git
repository. You might have heard this setup described as a
[monorepo](https://en.wikipedia.org/wiki/Monorepo).

As a result, we use two pieces of tooling to help us manage installing
dependencies and publishing our packages. These include:

- [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) for handling
  dependencies across all packages
- [Lerna](https://lerna.js.org/) for publishing packages, tagging versions, and
  more

In order for you to install all the dependencies in this project, you'll need to
[install Yarn](https://yarnpkg.com/en/docs/install) and run the following
command in your terminal:

```bash
yarn install
```

This will install all of the dependencies for every package in our project. In
addition, it allows us to link between packages that we are developing.

This strategy is particularly useful during development, and tooling like Lerna
will pick up on when packages are linked in this way and will automatically
update versions when publishing new versions of packages.

Next up, you'll most likely want to build all of the package files so that
things don't fail while you are working on a package. To do this, you can run
the following command:

```bash
yarn build
```

Afterwards, you should be good to go! For more information about how we handle
dependencies, take a look at our write-up [here](#dependency-management).

## Common tasks

While working on Carbon, here are some of the top-level tasks that you might
want to run:

| Command                           | Usage                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `yarn build`                      | Uses `lerna` to run the `build` script in each package                                                        |
| `yarn clean`                      | Resets the state of the project by removing all `node_modules` and running the `clean` script in each package |
| `yarn doctoc`                     | Runs `doctoc` on all files in the `doctoc` directory                                                          |
| `yarn format`, `yarn format:diff` | Format files using Prettier, check if files have been formatted                                               |
| `yarn sync`                       | Sync package files across the project                                                                         |
| `yarn lint`                       | Finds and fixes problems in code                                                                              |

In addition, you can use `yarn` to run `bin` files using the `yarn <bin>`
syntax. For example, if you wanted to use `lerna` to run a script in every
package you could do the following:

```bash
# Access $(yarn bin)/lerna and pass `run build` to the executable
yarn lerna run build
```

## Dependency management

In light of potential `npm` security issues
[[1]](https://blog.npmjs.org/post/175824896885/incident-report-npm-inc-operations-incident-of)
[[2]](https://eslint.org/blog/2018/07/postmortem-for-malicious-package-publishes),
we are addressing some of the issues with installing dependencies from a live
registry by taking advantage of
[Yarn's offline feature](https://yarnpkg.com/blog/2016/11/24/offline-mirror/).
The majority of steps taken are inspired by
[this tweet](https://twitter.com/leeb/status/1017607265115750400) from Lee
Byron.

### Continuous Integration

We specify a `.yarnc` file in this project that sets the path for Yarn's
[offline cache](https://yarnpkg.com/features/offline-cache) to the folder
`.yarn/cache`. This folder contains all the tarballs for the packages that the
project uses.

> The way it works is simple: each time a package is downloaded from a remote
> location ... a copy will be stored within the cache. The next time this same
> package will need to be installed, Yarn will leverage the version stored
> within cache instead of downloading its original source.

This ensures that packages are available no matter if the network goes down or
the npm registry is unavailable.

## Package architecture and layout

### Packages shipping Sass

If a package in elements is shipping Sass-based files, then it will follow a
certain number of conventions.

The first convention is that each of these packages will have a `scss` folder
that contains all the Sass files for the package. For example, `@carbon/colors`
would have a folder at `@carbon/colors/scss` in the import path for Sass.

To include the entire package, there are two options within this `scss` folder:
the `index.scss` entrypoint for modules and an entrypoint for inline support.
The `index.scss` entrypoint would be found at `@carbon/colors/scss/index.scss`
and would work for teams that are using tools like eyeglass or have already
setup `node-sass`'s `includePaths` option to include `node_modules`.

The other entrypoint option is for inline support. This option will work without
having to use eyeglass or something like `node-sass`'s `includePaths` option.
Each package that ships a `scss` folder will include this entrypoint, and the
name will reflect the package name. For example, `@carbon/colors` would have an
entrypoint available at `@carbon/colors/scss/colors.scss`.

#### Entrypoint behavior

The entrypoints of our Sass packages will output CSS (side-effects) by default,
unless there is no corresponding CSS to output. These side-effects help with
quickly using a package, but sometimes an application developer will want to
control behavior in order to manage side-effects. For these cases, we expose
additional files that you can include in your project, most notably a common
`scss/mixins.scss` file.

For example, in `@carbon/colors` we can import the `carbon--colors` mixin by
importing `@carbon/colors/scss/mixins.scss`. These types of files are guaranteed
to have no, or minimal, side-effects. The only side-effects that are emitted are
global variable initializations as this is required behavior in newer versions
of Sass.

Using these `mixins.scss` entrypoints allows you as an application developer to
control when these side-effects are applied in your project.

## Commit conventions

This project follows a structured format for writing commit messages. The main
benefit of this approach is that we can use these details to automatically
generate things like changelogs, in addition to clarifying what changes
correspond to when looking at our Git history.

### Commit message format

_Parts of this section are duplicated from
[Angular's commit conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)_.

Each commit message consists of a **header**, a **body** and a **footer**. The
header has a specific format that includes a type, a scope and a subject:

```git
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional. There
are a few validation rules that we also enforce, namely that:

- The header must always be fewer than **72** characters
- Any line in the commit body must be fewer than **80** characters

Most of these rules are to help with integration of `git` with common tools.

_Note: we check for this commit format using a tool called
[`commitlint`](https://commitlint.js.org/#/)_.

### Type

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies
- **chore**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc.)
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **revert**: A code change that reverses a previous commit
- **test**: Adding missing tests or correcting existing tests

### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### Body

Just as in the subject, use the imperative, present tense: "change" not
"changed" nor "changes". The body should include the motivation for the change
and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes.

Breaking Changes should start with the word BREAKING CHANGE: with a space or two
newlines. The rest of the commit message is then used for this.

### Examples

<details>
  <summary>Feature (`feat`)</summary>

```diff
// Adding new functionality to a piece of code is considered a feature.
// This can be seen as extending an existing API
-function MyComponent({ propA }) {
+function MyComponent({ propA, propB }) {
  // ...
}
```

</details>

<details>
  <summary>Bug fix (`fix`)</summary>

```diff
// Updating an implementation to correct a fault in the existing code is
// considered a bug fix
function add(a, b) {
-  return a - b;
+  return a + b;
}
```

</details>

<details>
  <summary>Chore (`chore`)</summary>

Running things like formatting, or generally any project clean-up tasks, can be
considered a chore that we are doing to keep things up-to-date.

</details>

## Coding style

### Class names

Prefix all class names with `#{$prefix}--` in SCSS, which is replaced with
`cds--` by default, and design systems inheriting Carbon can override. This
prefix prevents potential conflicts with class names from the user.

**HTML**

```html
<div
  class="cds--inline-notification cds--inline-notification--error"
  role="alert">
  <div class="cds--inline-notification__details">...</div>
</div>
```

**SCSS**

```scss
.#{$prefix}--inline-notification {
  ...
}

.#{$prefix}--inline-notification__details {
  ...
}
```

Follow BEM naming convention for classes. Again, the only thing we do
differently is prefix all classes with `#{$prefix}--`.

```scss
.#{$prefix}--block
.#{$prefix}--block__element
.#{$prefix}--block--modifier
```

Avoid nesting selectors, this will make it easier to maintain in the future.

```scss
// Don't do this
.#{$prefix}--inline-notification {
  .#{$prefix}--btn {
    &:hover {
      svg {
        ...
      }
    }
  }
}

// Do this instead
.#{$prefix}--inline-notification .#{$prefix}--btn {
    &:hover svg {
      ...
    }
  }
}
```

Use
[CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)
for layout. These are impacted by the writing mode and provide support for
right-to-left styling out of the box.

```scss
// Don't do this
.my-element {
  padding-top: 2em;
  padding-bottom: 2em;
  margin-left: 2em;
  position: relative;
  top: 0.2em;
}

// Do this instead
.my-element {
  padding-block-start: 2em;
  padding-block-end: 2em;
  margin-inline-start: 2em;
  position: relative;
  inset-block-start: 0.2em;
}
```

### Sass documentation

[SassDoc](http://sassdoc.com) is used to document the Carbon Sass source.
SassDoc annotations start each line with `///`; do not use `///` in non-SassDoc
comments.

For consistency, capitalize types (used in `@type`, `@param`, `@return`) and
descriptions (used in `@param`, `@return`, `@deprecated`, `@example`, `@link`).

The following annotations are used:

**Required annotations**

- [Description](http://sassdoc.com/annotations/#description) - can be one line
  or multiple lines
- [`@access`](http://sassdoc.com/annotations/#access) - `public` or `private`,
  where public items make up our public API
- [`@group`](http://sassdoc.com/annotations/#group) - typically a package or
  component name
- [`@type`](http://sassdoc.com/annotations/#type) - allowed on **variables**,
  (e.g. `Map`, `Color`, `Number`)
- [`@param`](http://sassdoc.com/annotations/#parameter) - allowed on
  **functions** and **mixins**, include the type, name, and description, with a
  default value if there is one (e.g.
  `@param {Map} $breakpoints [$carbon--grid-breakpoints] - A map of breakpoints where the key is the name`)
- [`@return`](http://sassdoc.com/annotations/#return) - allowed on
  **functions**, include the type and description (e.g.
  `@return {Number} In px`)
- [`@alias`](http://sassdoc.com/annotations/#alias) - do not include the `$` if
  aliasing a variable
- [`@content`](http://sassdoc.com/annotations/#content) - allowed on **mixins**,
  describe the usage of content
- [`@deprecated`](http://sassdoc.com/annotations/#deprecated) - context around
  possible replacements or when the item will no longer be available

  **Optional annotations**

- [`@example`](http://sassdoc.com/annotations/#example) - if the usage isn't
  straight forward or there are multiple use cases
- [`@link`](http://sassdoc.com/annotations/#link) - if there's a related link to
  reference

  **Examples**

```scss
// Variable example

/// Primary interactive color; Primary buttons
/// @type Color
/// @access public
/// @group @carbon/themes
$interactive-01: map-get($carbon--theme, interactive-01) !default;

// Mixin example

/// Create the container for a grid. Will cause full-bleed for the grid unless
/// max-width properties are added with `make-container-max-widths`
/// @param {Map} $breakpoints [$carbon--grid-breakpoints] - A map of breakpoints where the key is the name
/// @access private
/// @group @carbon/grid
@mixin carbon--make-container($breakpoints: $carbon--grid-breakpoints) {
}

// Function example

/// Compute the type size for the given type scale step
/// @param {Number} $step - Type scale step
/// @return {Number} In px
/// @access public
/// @group @carbon/type
@function carbon--get-type-size($step) {
}
```

### Start a new `block` or `element`?

A nested element can use a new block name as long as the styles are independent
of the parent.

```html
<div class="cds--component">
  <button class="cds--component-button">Button</button>
</div>
```

:point_up: The `#{$prefix}--component-button` class implies that this button has
independent styles from its parent. Generally, it's preferred to start a new
block.

### Red flags

Avoid names with multiple `__element` names:

- :x: `.#{$prefix}--card__list__item`
- :white_check_mark: `.#{$prefix}--card-item`
- :white_check_mark: `.#{$prefix}--card__item`

### Files and folders

All react components belong in `packages/react/src/components` in their own
folder.

All Component styles belong in `packages/styles/scss/components` in their own
folder.

### Working on JavaScript-framework-specific styles

JavaScript-framework-specific is _not_ recommended as we strive to create styles
that are framework-neutral. However, there are some rare cases where
framework-specific cannot be avoided, and some of those make sense to be in
maintained by core style library here.

There are a couple ways to work on framework-specific style.

### Using `npm link`/`yarn link`

This is the most straightforward way. When in the directory of your
`@carbon/styles` folder, run the following command:

```bash
yarn link
```

You should see a success message similar to:

```bash
success Registered "@carbon/styles".
info You can now run `yarn link "@carbon/styles"` in the projects where you want to use this package and it will be used instead.
```

Now, go to the folder where `carbon-components-angular` is located and run:

```bash
yarn link @carbon/styles
```

You should see a success message similar to:

```bash
success Using linked package for "@carbon/styles".
```

The `yarn link` command will allow us to point the `@carbon/styles` package
under `node_modules` to the folder on our filesystem. So, if we make a change in
`@carbon/styles` and re-compile the project it will update in the Storybook
environment for `carbon-components-angular`.

In addition, if you would like to have your changes to styles automatically
compile and update Storybook you can run the following command in the
`@carbon/styles` folder on your machine:

```bash
yarn gulp watch -s
```

This will run the `watch` command in `gulpfile.js`. As a result, whenever you
make a change to the project styles it will automatically copy over into the
`scss` folder which Storybook uses in `carbon-components-angular`.

### Pointing NPM dependency of `@carbon/styles` right to the source code

Though the above approach is the most straightforward, it involves the overhead
of having to run the build process at `@carbon/styles`, in addition to one at
the framework variant repo, upon every Sass code change.

To avoid such overhead, you can point NPM dependency of `@carbon/styles` right
to the source code, though there is a caveat that our future change to the
directory structure, etc. may make such steps no longer work. Here are the
steps:

```sh
> cd /path/to/carbon-components-angular/node_modules/@carbon/styles
> mv scss scss.orig
> ln -s /path/to/@carbon/styles/scss scss
```

Then edits of `.scss` files in `/path/to/@carbon/styles/scss` will be reflected
to the development environment of your framework variant repository. You don't
need to do anything in `@carbon/styles` side.

## Maintainers

### Public API Snapshot

The entire public api of `@carbon/react` is tracked in one file by iterating
over all PropTypes and storing the output in a snapshot file. When adding,
removing, or updating PropTypes, run `yarn test -u` from the root to update the
snapshot and include it in your pull request for review. This helps core
reviewers to determine if api changes are being made in a backwards compatible
way to avoid breaking changes.

Snapshots for web components can be found in their respective component
directories. To test or update snapshots, run `yarn test` or
`yarn test:updateSnaphots`. These commands must be run from the
`packages/web-components` directory.

### Working with icons and pictograms

We get work submitted by the IBM Brand team, along with other designers at IBM,
that contributes new or updated assets to our icons or pictograms packages. When
you are requested to review these Pull Requests, here are some common things to
look for:

1. Do the assets follow a param-case naming convention?

If not, we'll need to request changes so that they are named using the
`param-case` convention.

2. Is the CI check failing because of missing metadata?

If so, you will need to help out the contributor by going into the package and
running `node tasks/scaffold.js` to seed the metadata information required for
the contribution.

_Note: the scaffold task will only apply to the main metadata file, for new
icons category information will have to be added by hand_

3. Is the CI check failing because of a merge conflict?

If so, you will need to help out the contributor by resolving the merge
conflicts for the Pull Request.

4. Is the CI check failing because of a snapshot change?

If so, you will need to help out the contributor by updating the snapshot based
on the changes. To update snapshot, you'll need to rebuild the relevant packages
and then run Jest.

For example, if icons changed you will want to run the following commands:

```bash
yarn lerna run build --scope='@carbon/icons-react' --include-dependencies
yarn test:e2e -u
```

If pictograms changed, it would be:

```bash
yarn lerna run build --scope='@carbon/pictograms-react' --include-dependencies
yarn test:e2e -u
```

5. Does the Pull Request have an appropriate title?

If not, then you will need to update it to the correct commit convention for the
contribution.

6. Does the Pull Request remove an asset that used to exist?

If so, remind the contributor that we can only remove assets in a major release.
If an asset needs to be removed, they should add the asset back in under its
original name and add it to the corresponding `deprecated.yml` file. They can
still contribute the newly named asset, and it is recommended that they specify
the replacement for the icon in `deprecated.yml` under the `reason` field.

In the event that a change needs to be reflected immediately due to a change in
business relationship or other matter, the asset must still be deprecated and
not removed to avoid a breaking change.

To reflect the change immediately, both the Carbon website and the IDL website
should be updated to no longer show the file in the icon or pictogram library.
[Here's an example PR](https://github.com/carbon-design-system/carbon-website/pull/2781)

### Code Patterns

#### Deprecating a component

Mistakes totally happen, and sometimes we'll need to figure out a strategy to
remove a component from the system. When this happens, we need to make sure that
users of Carbon know that:

1. The component is going to continue to work, deprecating a component does not
   break any existing code
2. That we're going to remove this component in the next major release to give
   them enough time to prepare

In certain cases, we'll also want to support bug fixes for deprecated
components. Most of the time we will state that deprecated components will no
longer receive priority fixes, but we'll still accept outside contributions.

In order to deprecate a component in our React codebase, we have the following
pattern that we tend to use:

```jsx
// SomeComponent.js
// React imports
import { warning } from '../../internal/warning';

let didWarnAboutDeprecation = false;

function SomeComponent() {
  if (process.env.NODE_ENV !== 'production') {
    warning(
      didWarnAboutDeprecation,
      'The `SomeComponent` component has been deprecated and will be removed ' +
        'in the next major release of `carbon-components-react`'
    );
    didWarnAboutDeprecation = true;
  }
}
```

_Note: even though warning() has a process.env.NODE_ENV condition internal to
itself, an additional one is needed above to ensure `didWarnAboutDeprecation` is
not modified in non-development environments._

_Note: if available, you should add a closing sentence specifying what component
to use instead, or share a link for more information. This may look like:_

```jsx
warning(
  didWarnAboutDeprecation,
  'The `SomeComponent` component has been deprecated and will be removed ' +
    'in the next major release of `carbon-components-react`. Please use the ' +
    '`SomeOtherComponent` component instead'
);

warning(
  didWarnAboutDeprecation,
  'The `SomeComponent` component has been deprecated and will be removed ' +
    'in the next major release of `carbon-components-react`. Please visit ' +
    'ibm.biz/<some-hash> for more information'
);
```

### Publishing

#### Publishing older library versions

We offer ad-hoc backwards-support for older version of the system. This work is
primarily driven by external contributors who may still need these older
versions for legacy code. When updates are received and merged into the
codebase, the release process will be a bit different than the one described
above.

For example, with
[`carbon-components-react`](https://github.com/carbon-design-system/carbon-components-react)
we have specific branches for older major versions like `v5` or `v6`. If we
wanted to publish an update to either of these major versions, this process
would look like:

- Checkout the branch locally, making sure to pull in the latest from upstream
- Manually update `package.json` with the new version to publish in a branch
  called `chore/release-vX.Y.Z` and a commit message: `chore(release): vX.Y.Z`
- Create a Pull Request with this new branch and commit message
- Once this is merged into the branch, checkout locally and pull latest. Now we
  can publish by running `npm publish .`, if you want to do a dry run first you
  can do `npm publish . --dry-run`. This is helpful when dependencies may be
  different than in newer versions of the system

One important thing to verify is that `package.json` has a `publishConfig` field
that looks like the following:

```json
{
  "publishConfig": {
    "tag": "<VERSION>.x"
  }
}
```

For example, `carbon-components-react` v5 would look like:

```json
{
  "publishConfig": {
    "tag": "5.x"
  }
}
```

This tag verifies that when we publish we do not publish to the `latest` tag but
instead to the major-specific tag for the package.

After running `npm publish .` and seeing the package publish to the registry,
you could create a git tag by running:

```bash
git tag -a vX.Y.Z # The commit message should match vX.Y.Z
```

You should then push this tag to the project by running:

```bash
git push upstream vX.Y.Z
```

This helps keep track of what versions have been published and snapshotting the
code at that point in time.

## FAQ

#### How do I install a dependency?

When installing a dependency, you can run `yarn add <dependency-name>` as
normal. The only difference now is that you also will check in the corresponding
tarball entry in `.yarn/cache` as well so that we don't have to fetch this
dependency from the live registry during Continuous Integration builds.

#### CI is failing saying that it cannot find a dependency in offline mode

Most likely this is due to Yarn mistakenly removing, or forgetting to add, a
dependency to our offline mirror. Typically, running the following set of
commands should reset the project back to a valid state and should bring back
any missing dependencies or fetch new ones.

```bash
yarn clean
yarn cache clean
yarn
```

#### How do I fix the repo state if I cancel during a publish?

The first things Lerna will do are create a git tag and update `package.json`
versions. If you cancel before any packages publish, then you can do the
following:

```bash
# Delete the specific tag, usually something like v0.1.0
git tag -d name-of-tag
```

```bash
# Undo the last commit
git reset HEAD~

# Remove all staged files
git checkout -- .
```

You should be good to go after this!

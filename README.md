# Signalwerk CMS

A React-based content management system that processes JSON/MD page files into static HTML using Vite.

## Installation

```bash
mkdir packages
git submodule add git@github.com:signalwerk/signalwerk.md.git "./packages/signalwerk.md"
git submodule add git@github.com:signalwerk/signalwerk.cms.git "./packages/signalwerk.cms"
sh packages/signalwerk.cms/init.sh
npm install
```

## Start development server

```bash
npm run dev
```

## Build for production

```bash
npm run build
```

This generates static HTML files in the `dist/` folder.

## Development

copy back the current setup to the template repo

```bash
sh packages/signalwerk.cms/update_template.sh
```

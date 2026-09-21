# Hugo Waterfall Art Portfolio Website

This repository contains the source files for Hugo Waterfall's portfolio website. It showcases visual art, interactive projects, and project pages including *Margarette*, *Anima*, and *Womb of the Gods*.

The site is structured as a small Jekyll project with:

- page files such as `home.html`, `gallery.html`, and `projects.html`
- shared layout files in `_layouts/`
- styles, scripts, and media in `assets/`
- additional project content in `WOTG_project_2023/`

## Running locally

If you have Ruby and Bundler installed, you can run the site locally with:

```bash
bundle install
bundle exec jekyll serve
```

Then open the local address shown in the terminal.

## Optimizing images

The source artwork remains unchanged under `assets/images`. A Dockerized build
tool generates responsive WebP derivatives, records their dimensions in a
Jekyll data manifest, converts the large animated hero to WebM/MP4, and
generates responsive assets for the legacy interactive prototype:

```bash
# Preview work without writing files
./scripts/optimize-images.sh --dry-run

# Generate or refresh optimized assets without changing markup
./scripts/optimize-images.sh

# Generate or refresh responsive images and convert eligible HTML image tags
./scripts/optimize-images.sh --rewrite-markup

# Verify that sources, derivatives, and the manifest agree
./scripts/optimize-images.sh --check
```

Normal runs are incremental: unchanged outputs are reused, while new or changed
sources are regenerated. `--dry-run` previews pending work, `--rewrite-markup`
also converts eligible HTML and legacy CSS references, and `--check` validates
source checksums, generated files, the manifest, and animation outputs without
changing the project. The Docker image contains Sharp/libvips and FFmpeg, so the
host only needs Docker; ImageMagick is not required.

The tool generally does not need to ask questions because it uses reversible,
documented defaults: originals are preserved, the first prominent image on a
page loads eagerly, lower-page images are lazy-loaded, transparency is retained,
and text-heavy artwork receives a higher quality setting. These choices can be
adjusted in `scripts/image-config.json`.

After optimization, one human step remains useful: browse the site at desktop
and mobile sizes and visually inspect representative detailed or text-heavy
artwork. Artistic quality is subjective, so raise or lower individual quality
settings if a particular piece needs different treatment.

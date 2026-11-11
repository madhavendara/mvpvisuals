# mvpvisuals

## Starting the application

```sh
npm install
npm run dev
```

`npm run dev` first runs `validate:assets` to check the 3D models, then starts both the client and the server.

## Folder structure

```
data/                  saved add-to-cart configurations, captured 3D previews and uploaded images
dist/                  build output, created by npm run build
glb/                   3D model assets
public/
  cursors/             cursor icons
  embed-demo.html      iframe embedding example
scripts/               model data extraction and validation scripts
server/                mocked Express backend server
src/
  api/
    client.ts          all API calls
    useCatalogQuote.ts loads the catalog and updates the price based on the selection
  product/             product models and their sizes, design settings, pricing and options, and the walls added to them
  scene/
    Scene.tsx          main render container with all parts
    canopyTexture.ts   dynamic canopy texture built from the user's design
    snapshot.ts        renders the 3D view to a JPEG for the PDF on add to cart
    TentModel.tsx      main model imported from the GLB, with canopyTexture applied
    Walls.tsx          side walls rendered in code
  ui/                  product page UI
  store.ts             main Zustand store
```

## Decisions I made on this application

1. **UV coordinates come from the GLB.** Painting the canopy requires its UV coordinates. Because we can't manually select or define this data, I decided to extract it from the GLB model itself and define front, back, left and right from it, via `scripts/extract-uv-regions.mjs`. This way, if we change the model, we just need to run `npm run extract:uv`.
2. **Walls are built in code.** The model doesn't include walls, so I've added them based on the model size and footprint, so that designs can also be applied to them.
3. **SVG-based 2D editor.** Instead of manual side selection, I've added SVG-based selection that uses the same extracted UV coordinates to render the scene in 2D, and lets the user move artwork and see the changes in real time.
4. **One shared transform.** 2D and 3D share one transform (`panelTransform`), so artwork lands in the same place in the SVG editor and on the 3D tent.
5. **PDFKit for the PDF.** As this is a small application with Shopify integration, I decided to go with the lightweight library PDFKit rather than Puppeteer.
6. **6.5×6.5 model scaling.** The supplied 6.5×6.5 GLB is modelled at almost the 5×5 size, so I scale it in code to its real size, so that the size the user picks is reflected in the 3D view.

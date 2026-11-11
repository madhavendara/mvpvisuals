# mvpvisuals

Starting the application
npm install
  npm run dev which first run validate:assets to check 3d models and then start both client and server. 

Folder structure
  data: save add to cart information and images captured
  dist: build related files
  glb: 3D model assets
  public
     cursors: cursor icon
     embed-demo: iframe embedding example
  scripts: model data extraction and validation scripts
  server: mocked express backend server
  src 
    api
      client.ts: it holds all API calls
      useCatalogQuote: loading Catalog pricing and updating them based on selection
    product: include product models and their sizes, design settings, pricing and options. and walls added into them. 
    
    scene
      Scene.tsx: main render container with all parts
      canopyTexture: main dynamic texture based on user design creation. 
      snapshot: It renders the 3D view to a JPEG for the PDF on Add to cart
      TentModel: main model imported from glb + canopyTexture
      Walls: extra rendered walls for side walls
   ui: product page ui
   store.ts: main zustand store

   Decision i made on this application
    1. Painting the canopy requires it's UV cordinates. now because we can't manually select or define data i decided to extract from glb model itself and define front,back,.. from it. via scripts/extract-uv-regions.mjs is this way if we even change model we just need to run npm run extract:uv
    2. Walls: inside the model i don't have wall so i've added based on model size and footprint. so that we can also apply design on it. 
    3. instead of manually side selection i've added svg based selection which uses same UV coordinates extracted to render scene in 2d. and let user to move and see changes in realtime. 
    4. 2D and 3D share one transform (panelTransform), so artwork lands in the same place in the SVG editor and on the 3D tent.
    5. as it is small application with shopify integration i've decided to go with lightweight library pdfkit rather than Puppeteer 
    6. currently 6.5×6.5 GLB is modelled almost at 5×5 size so i had to manually scale it to match size so that user change reflect on it.  



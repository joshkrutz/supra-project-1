# Artstagram

Artstagram is an attempt to combine liquid-glass like UI elements with a modern Instagram/Pintrest layout. Figma was used in the design mock-up process too!

## Getting starting

```bash
npm i # Install the node modules
npm run dev # Spins up server + client
```

## Features

- Integrates the [Met Art Museum API](https://metmuseum.github.io/)
- Dynamically queues fetch requests to address API throttling

  - Uses producer/consumer pattern
  - Proxies requests with internal API
  - `/nextArt`: asks the server for the next image in the Met database
  - Page updates with different results each reload

- Displays skeleton loader
- Uses a masonry grid pattern
- Click the "Profile" to cycle between Artist, Title, and Origin Date
- Click the "Like" button just for fun
- Uses [Avatar Placeholder](https://avatar-placeholder.iran.liara.run/) to generate a "Profile" like image for each artist

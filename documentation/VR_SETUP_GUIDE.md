# Enable a 360-degree / VR tour

## What is implemented

The hero can display a configurable tour link that opens in a new tab. It is off by default. No panorama, 3D model, hosted-tour subscription, or VR viewer has been created. This is separate from the portfolio switch.

## Option 1: link to your published tour

1. Publish a tour using your chosen tour platform, or host your own viewer as described below.
2. Test the public HTTPS tour URL without signing in.
3. Edit the existing `virtual_tour` object in [content/config.json](../content/config.json):

```json
"virtual_tour": {
  "enabled": true,
  "url": "https://your-tour-host.example/your-project",
  "label": "Explore in 360 degrees"
}
```

Replace the example URL with your actual published URL. An empty URL keeps the button hidden even when enabled. Use `"enabled": false` to hide the link again. Rebuild and deploy through the [existing workflow](./WEBSITE_FEATURES.md).

This adds a link, not an embedded headset experience. The destination viewer determines whether immersive VR is supported. A new tab avoids embedding restrictions and keeps the home page lightweight.

## Option 2: host a panorama viewer in this repository

Prepare a genuine full-sphere, equirectangular panorama, typically 2:1, such as a 4096 x 2048 room render. Do not stretch an ordinary project photo into that shape: the supplied interior images are flat renders and cannot provide a full view around the room. A panorama lets visitors look around from one point; walking through a room needs a separate 3D scene/model and navigation implementation.

Create these files when your panorama is ready:

```text
static/tours/living-room/index.html
static/tours/living-room/panorama.jpg
```

A minimal starting point for the tour HTML is:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Living room tour | Ashapura Maison Design</title>
  <script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
</head>
<body>
  <a-scene>
    <a-assets>
      <img id="roomPanorama" src="./panorama.jpg" alt="Living room panorama">
    </a-assets>
    <a-sky src="#roomPanorama"></a-sky>
    <a-camera wasd-controls="enabled: false"></a-camera>
  </a-scene>
  <noscript>Enable JavaScript to view the tour. Use your browser's Back button to return.</noscript>
</body>
</html>
```

This is an optional starter, not a deployed page. A-Frame is pinned rather than loading an unspecified release. The example uses its CDN; vendor the reviewed library locally if you need to avoid that third-party request. Add a visible exit/back link, image-load error message, and flat-image alternative before production use.

The existing build copies everything under `static/`, including these files. After publishing, the tour URL will be:

```text
https://YOUR_USERNAME.github.io/amd.home/static/tours/living-room/index.html
```

Use your actual account, repository name, and custom domain if applicable. Set that full URL in `virtual_tour.url`. For local testing, serve the repository with `python -m http.server 8080 --bind 127.0.0.1` and visit `http://127.0.0.1:8080/static/tours/living-room/index.html`. Do not test WebXR by double-clicking a file.

## Requirements and acceptance checks

- Serve the deployed viewer over HTTPS. Immersive WebXR is not universally supported; test the actual headset and browser you intend to support.
- Desktop dragging should work without a headset. Entering immersive VR should follow an explicit user action in a supported viewer.
- Keep the panorama and viewer on the same origin when possible; cross-origin assets need suitable CORS headers.
- Test image orientation, seams, download size, touch controls, Back/exit navigation, and failure when the panorama is missing.
- Keep a normal image alternative for people who cannot or do not want to use VR.

## Official references

- [A-Frame installation and pinned script](https://aframe.io/docs/1.8.0/introduction/installation.html)
- [A-Frame panorama primitive](https://aframe.io/docs/1.7.0/primitives/a-sky.html)
- [A-Frame HTTPS and asset-loading FAQ](https://aframe.io/faq/)
- [WebXR support and secure-context requirements](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

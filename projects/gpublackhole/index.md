---
layout: default
title: main
---

# GPU blackhole renderer
GPU version of my [CPU black hole renderer](/projects/blackhole)<br>
It's a heck of a lot quicker.
It's got 2 modes: a raymarching mode, VERY fast, like 60FPS fast. A bit inaccurate with the gravity bending, which can be compensated by dividing the SDF value by some amount. It's a performance to accuracy tradeoff.<br><br>
Also features a raytracing mode. Same accuracy as the old version, same level of detail as the raymarched version (with the textured acreation disc and stuff). Thing is, it runs at 4FPS. Still better than the CPU version, but definitely not ideal.<br>

Didn't bother to ever put this one on GitHub. It's still on my old laptop so fuck moving it here.<br>
I do have an image for you though, it looks miles better than the old version.<br>
Only thing it's lacking is the volumetrics that the old version had. Oh well.<br><br>

<img src="/projects/gpublackhole/image1.png" alt="GPU accelerated black hole render" style="max-width: 100%; height: auto;">

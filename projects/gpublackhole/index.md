---
layout: default
title: GPU Blackhole
---

# GPU blackhole renderer
GPU version of my [CPU black hole renderer](/projects/blackhole)<br>
It's a heck of a lot quicker.
It's got 2 modes: a raymarching mode, VERY fast, 60FPS on an iGPU fast. A bit inaccurate with heavy gravity bending, which can be compensated by dividing the SDF value by some amount. It's a performance to accuracy tradeoff.<br><br>
Also features a raytracing mode. Same accuracy as the original CPU-based version. Downside is that it runs 30 times slower. Still better than the CPU version, but definitely not ideal.<br>

Didn't bother to ever put this one on GitHub. It's still on my old laptop so I'm not gonna bother. Most of the code is stolen from shadertoy anyway.<br>
Only thing it's lacking is the volumetrics that the old version had. Oh well.<br><br>
<img src="/projects/gpublackhole/image1.png" alt="GPU accelerated black hole render" style="max-width: 100%; height: auto;">

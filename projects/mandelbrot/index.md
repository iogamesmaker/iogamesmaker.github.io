---
layout: default
title: main
---

# CPU Mandelbrot set explorer
My first real C++ project!<br>
I'll let the README speak for itself, which I wrote as a 13 year old.<br>
You can assume anything that I planned isn't gonna happen anymore lol.<br>
The source code is [still on GitHub](https://github.com/iogamesmaker/smoothmandelbrot), although you're probably better off not looking at it.

### smooth mandelbrot
The Mandelbrot set using the Escape Time algorithm, and smooth coloring. 1k iterations is ~1.3 seconds on a 800x600 window on a chromebook.
I stole the smooth coloring algorithm from [Wikipedia - Plotting algorithms for the Mandelbrot set](https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set).
uses GL/glut.h.<br>
`g++ mandel.cpp -o mandel -lGL -lGLU -lglut -Ofast` to compile on linux. requires the apt package `freeglut3`.

multithreading for some reason only slows stuff down (using omp.h), so not doing that.

### Controls:
Drag to move.

Q/E to zoom in/out.

-/= to change the maximum amount of iterations.

1 for Mandelbrot set.

2 for Burning Ship.

3 for Tricorn/mandelbar

4 for weird line fractal with spider web julia sets

5 for Failed Möbius fractal / Depressed mandelbrot <!-- I was using ChatGPT 2.0 (I think) for the Mobius fractal. Not surprised it failed -->

F goes into fullscreen

R resets.

J for julia set at the point where your cursor is.

SPACE prints position + zoom

B to toggle biomorphs

S to toggle smooth coloring

[ and ] to in/decrease biomorph value

o & p to in/decrease bailout<br><br>
### planned stuff
general optimizations, like<br>
boundry tracing? (any help really appreciated)<br>
and better controls<br><br>
### me complaining
I am a total C++ noob, so do not expect much. I do not know anything about glut, I used tutorials and ChatGPT.<br><br>
### Screenshots
here are some epik screenshots using only this program (and the KDE screenshot thing)<br><br>

<img src="/projects/mandelbrot/image1.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">
<img src="/projects/mandelbrot/image2.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">
<img src="/projects/mandelbrot/image3.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">
<img src="/projects/mandelbrot/image4.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">
<img src="/projects/mandelbrot/image5.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">
<img src="/projects/mandelbrot/image6.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">
<img src="/projects/mandelbrot/image7.png" alt="Mandelbrot set with biomorphs" style="max-width: 100%; height: auto;">


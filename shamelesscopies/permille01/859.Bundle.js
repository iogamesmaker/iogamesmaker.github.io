"use strict";(self.webpackChunkElectronProject=self.webpackChunkElectronProject||[]).push([[859],{7614:(t,e,r)=>{r.d(e,{Z:()=>n});class o{constructor(t=3e3){this._seedValue=t,this.setSeed=this.setSeed.bind(this),this.noise=this.noise.bind(this),this.Euclidean=this.Euclidean.bind(this),this.Manhattan=this.Manhattan.bind(this)}static xorshift(t){let e=t^t>>12;return e^=e<<25,e^=e>>27,2*e}static xorshift31(t){return t^=t>>>12,t^=t<<25,(t^=t>>>27)>>>0}static hash(t,e,r){return 16777619*(16777619*(16777619*(2166136261^t)^e)^r)&4294967295}static hash2(t,e){return 16777619*(16777619*(2166136261^t)^e)}static d(t,e){return[t.x-e.x,t.y-e.y,t.z-e.z]}static EuclideanDistance(t,e){return o.d(t,e).reduce(((t,e)=>t+e*e),0)}static ManhattanDistance(t,e){return o.d(t,e).reduce(((t,e)=>t+Math.abs(e)),0)}static probLookup(t){return(t&=4294967295)<393325350?1:t<1022645910?2:t<1861739990?3:t<2700834071?4:t<3372109335?5:t<3819626178?6:t<4075350088?7:t<4203212043?8:9}static insert(t,e){let r;for(let o=t.length-1;o>=0&&!(e>t[o]);o--)r=t[o],t[o]=e,o+1<t.length&&(t[o+1]=r)}noise(t,e){let r,n,s,i,a,h={x:0,y:0,z:0},c={x:0,y:0,z:0},l=[9999999,9999999,9999999];for(let u=-1;u<2;++u)for(let f=-1;f<2;++f)for(let d=-1;d<2;++d){s=Math.floor(t.x)+u,i=Math.floor(t.y)+f,a=Math.floor(t.z)+d,r=o.xorshift(o.hash(s+this._seedValue&4294967295,4294967295&i,4294967295&a)),n=o.probLookup(r);for(let u=0;u<n;++u)r=o.xorshift(r),h.X=r/4294967296,r=o.xorshift(r),h.Y=r/4294967296,r=o.xorshift(r),h.Z=r/4294967296,c={x:h.X+s,y:h.Y+i,z:h.Z+a},o.insert(l,e(t,c))}return l}FasterNoise(t,e){const r=this._seedValue;let n=1/0;for(let s=-1;s<2;++s)for(let i=-1;i<2;++i){const a=Math.floor(t)+s,h=Math.floor(e)+i;let c=o.xorshift31(o.hash2(a^r,h));const l=[1,1,1,1,1,1,1,1,1,2,2,2,3,3,4,4][15&c];for(let r=0;r<l;++r){c=o.xorshift31(c);const r=c/4294967295+a;c=o.xorshift31(c);const s=c/4294967295+h;c=o.xorshift31(c);let i=(t-r)**2+(e-s)**2+(c/4294967295)**2;n>i&&(n=i)}}return n}FasterNoise2(t,e){}static EuclideanDistance2D(t,e){return(t.x-e.x)**2+(t.y-e.y)**2}setSeed(t=3e3){this._seedValue=t}Euclidean(t,e,r){return this.noise({x:t,y:e,z:r},o.EuclideanDistance)}Manhattan(t,e,r){return this.noise({x:t,y:e,z:r},o.ManhattanDistance)}}const n=o},5383:(t,e,r)=>{r.d(e,{Z:()=>n});const o={};!function(){var t=o;function e(t,e,r){this.x=t,this.y=e,this.z=r}e.prototype.dot2=function(t,e){return this.x*t+this.y*e},e.prototype.dot3=function(t,e,r){return this.x*t+this.y*e+this.z*r};var r=[new e(1,1,0),new e(-1,1,0),new e(1,-1,0),new e(-1,-1,0),new e(1,0,1),new e(-1,0,1),new e(1,0,-1),new e(-1,0,-1),new e(0,1,1),new e(0,-1,1),new e(0,1,-1),new e(0,-1,-1)],n=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],s=new Array(512),i=new Array(512);t.seed=function(t){t>0&&t<1&&(t*=65536),(t=Math.floor(t))<256&&(t|=t<<8);for(var e=0;e<256;e++){var o;o=1&e?n[e]^255&t:n[e]^t>>8&255,s[e]=s[e+256]=o,i[e]=i[e+256]=r[o%12]}},t.seed(0);var a=.5*(Math.sqrt(3)-1),h=(3-Math.sqrt(3))/6,c=1/6;function l(t){return t*t*t*(t*(6*t-15)+10)}function u(t,e,r){return(1-r)*t+r*e}t.simplex2=function(t,e){var r,o,n=(t+e)*a,c=Math.floor(t+n),l=Math.floor(e+n),u=(c+l)*h,f=t-c+u,d=e-l+u;f>d?(r=1,o=0):(r=0,o=1);var x=f-r+h,M=d-o+h,y=f-1+2*h,w=d-1+2*h,p=i[(c&=255)+s[l&=255]],v=i[c+r+s[l+o]],z=i[c+1+s[l+1]],b=.5-f*f-d*d,E=.5-x*x-M*M,k=.5-y*y-w*w;return 70*((b<0?0:(b*=b)*b*p.dot2(f,d))+(E<0?0:(E*=E)*E*v.dot2(x,M))+(k<0?0:(k*=k)*k*z.dot2(y,w)))},t.simplex3=function(t,e,r){var o,n,a,h,l,u,f=.3333333333333333*(t+e+r),d=Math.floor(t+f),x=Math.floor(e+f),M=Math.floor(r+f),y=(d+x+M)*c,w=t-d+y,p=e-x+y,v=r-M+y;w>=p?p>=v?(o=1,n=0,a=0,h=1,l=1,u=0):w>=v?(o=1,n=0,a=0,h=1,l=0,u=1):(o=0,n=0,a=1,h=1,l=0,u=1):p<v?(o=0,n=0,a=1,h=0,l=1,u=1):w<v?(o=0,n=1,a=0,h=0,l=1,u=1):(o=0,n=1,a=0,h=1,l=1,u=0);var z=w-o+c,b=p-n+c,E=v-a+c,k=w-h+2*c,D=p-l+2*c,V=v-u+2*c,Z=w-1+.5,_=p-1+.5,S=v-1+.5,g=i[(d&=255)+s[(x&=255)+s[M&=255]]],j=i[d+o+s[x+n+s[M+a]]],m=i[d+h+s[x+l+s[M+u]]],q=i[d+1+s[x+1+s[M+1]]],A=.6-w*w-p*p-v*v,C=.6-z*z-b*b-E*E,F=.6-k*k-D*D-V*V,L=.6-Z*Z-_*_-S*S;return 32*((A<0?0:(A*=A)*A*g.dot3(w,p,v))+(C<0?0:(C*=C)*C*j.dot3(z,b,E))+(F<0?0:(F*=F)*F*m.dot3(k,D,V))+(L<0?0:(L*=L)*L*q.dot3(Z,_,S)))},t.perlin2=function(t,e){var r=Math.floor(t),o=Math.floor(e);t-=r,e-=o;var n=i[(r&=255)+s[o&=255]].dot2(t,e),a=i[r+s[o+1]].dot2(t,e-1),h=i[r+1+s[o]].dot2(t-1,e),c=i[r+1+s[o+1]].dot2(t-1,e-1),f=l(t);return u(u(n,h,f),u(a,c,f),l(e))},t.perlin3=function(t,e,r){var o=Math.floor(t),n=Math.floor(e),a=Math.floor(r);t-=o,e-=n,r-=a;var h=i[(o&=255)+s[(n&=255)+s[a&=255]]].dot3(t,e,r),c=i[o+s[n+s[a+1]]].dot3(t,e,r-1),f=i[o+s[n+1+s[a]]].dot3(t,e-1,r),d=i[o+s[n+1+s[a+1]]].dot3(t,e-1,r-1),x=i[o+1+s[n+s[a]]].dot3(t-1,e,r),M=i[o+1+s[n+s[a+1]]].dot3(t-1,e,r-1),y=i[o+1+s[n+1+s[a]]].dot3(t-1,e-1,r),w=i[o+1+s[n+1+s[a+1]]].dot3(t-1,e-1,r-1),p=l(t),v=l(e),z=l(r);return u(u(u(h,x,p),u(c,M,p),z),u(u(f,y,p),u(d,w,p),z),v)}}();const n=o},8996:(t,e,r)=>{r(3318)},3318:()=>{}}]);
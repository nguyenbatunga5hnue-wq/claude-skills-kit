#!/bin/bash
# usage: build.sh v1 v2 out
V1="$1"; V2="$2"; OUT="$3"
CUT=17.7      # v1 end (s)
PS=15.0       # v1 push-in start
Z1=0.45; Z2=0.8; D2=1.1; XF=0.2
# v1: upscale, then push-in (ease-in cubic) anchored so the pen tip lands at the match point
Z1E="if(lt(t\,$PS)\,1\,1+$Z1*pow(min((t-$PS)/($CUT-$PS)\,1)\,3))"
Z2E="if(lt(t\,$D2)\,1+$Z2*(1-(3*pow(t/$D2\,2)-2*pow(t/$D2\,3)))\,1)"
ffmpeg -v error -stats -y -i "$V1" -i "$V2" -filter_complex "
[0:v]trim=0:$CUT,setpts=PTS-STARTPTS,fps=30,scale=1920:1080:flags=lanczos,setsar=1,
 scale=w='2*trunc(1920*($Z1E)/2)':h='2*trunc(1080*($Z1E)/2)':eval=frame:flags=bicubic,
 crop=1920:1080:x='0.116*1920*(($Z1E)-1)':y='0',format=yuv420p[a];
[1:v]zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,
 fps=30,eq=contrast=0.94:saturation=0.95,colorbalance=rm=0.03:bm=-0.05:rh=0.02:bh=-0.03,setsar=1,
 scale=w='2*trunc(1920*($Z2E)/2)':h='2*trunc(1080*($Z2E)/2)':eval=frame:flags=bicubic,
 crop=1920:1080:x='0.428*1920*(($Z2E)-1)':y='1080*(($Z2E)-1)',format=yuv420p[b];
[a][b]xfade=transition=fade:duration=$XF:offset=$(echo "$CUT-$XF"|bc)[v];
[0:a]atrim=0:$CUT,asetpts=PTS-STARTPTS,aresample=48000[x];
[1:a:1]aresample=48000,aformat=channel_layouts=stereo,volume=3.4dB[y];
[x][y]acrossfade=d=$XF:c1=tri:c2=tri,afade=t=out:st=$(echo "$CUT-$XF+7.0-0.6"|bc):d=0.6[au]" \
 -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
 -c:a aac -b:a 192k -movflags +faststart "$OUT"

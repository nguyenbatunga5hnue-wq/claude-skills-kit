#!/bin/bash
# Join the mother's clip and the teacher's clip with a zoom match cut on the red pen.
# usage: noi-video-me-con.sh <mother.mov> <teacher.mov> <out.mp4>
V1="$1"; V2="$2"; OUT="$3"
END=16.0                 # where the mother's clip ends (s)
XF=1.0                   # cross-dissolve length (s)
MID=$(echo "$END-$XF/2"|bc -l)   # dissolve midpoint, in clip-1 time
PS=14.0                  # clip 1 push-in starts
Z1=0.5;  FX1=0.30        # clip 1: extra zoom at the match point, horizontal anchor
Z2=0.8;  FX2=0.405       # clip 2: starting zoom, horizontal anchor (vertical anchor = bottom)
H2=$(echo "$XF/2"|bc -l) # clip 2 holds its zoom until the dissolve midpoint
D2=1.2                   # then pulls back over this long
SS="(3*pow(P\,2)-2*pow(P\,3))"   # smoothstep
P1="min(max((t-$PS)/($MID-$PS)\,0)\,1)"
P2="min(max((t-$H2)/$D2\,0)\,1)"
Z1E="(1+$Z1*${SS//P/$P1})"
Z2E="(1+$Z2*(1-${SS//P/$P2}))"
ffmpeg -v error -stats -y -i "$V1" -i "$V2" -filter_complex "
[0:v]trim=0:$END,setpts=PTS-STARTPTS,fps=30,scale=1920:1080:flags=lanczos,setsar=1,
 scale=w='2*trunc(1920*$Z1E/2)':h='2*trunc(1080*$Z1E/2)':eval=frame:flags=bicubic,
 crop=1920:1080:x='$FX1*1920*($Z1E-1)':y=0,format=yuv420p[a];
[1:v]zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,
 fps=30,eq=contrast=0.94:saturation=0.95,colorbalance=rm=0.03:bm=-0.05:rh=0.02:bh=-0.03,setsar=1,
 scale=w='2*trunc(1920*$Z2E/2)':h='2*trunc(1080*$Z2E/2)':eval=frame:flags=bicubic,
 crop=1920:1080:x='$FX2*1920*($Z2E-1)':y='1080*($Z2E-1)',format=yuv420p[b];
[a][b]xfade=transition=fade:duration=$XF:offset=$(echo "$END-$XF"|bc)[v];
[0:a]atrim=0:$END,asetpts=PTS-STARTPTS,aresample=48000[x];
[1:a:1]aresample=48000,aformat=channel_layouts=stereo,volume=3.4dB[y];
[x][y]acrossfade=d=$XF:c1=qsin:c2=qsin,afade=t=out:st=$(echo "$END-$XF+7.0-0.6"|bc):d=0.6[au]" \
 -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
 -c:a aac -b:a 192k -movflags +faststart "$OUT"

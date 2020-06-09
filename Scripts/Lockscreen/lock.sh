#!/bin/bash

icon="$HOME/Pictures/lock_icon.png"
tmpbg='/tmp/screen.png'

(( $# )) && { icon=$1; }

rm "$tmpbg"
scrot -z "$tmpbg"
convert "$tmpbg" -scale 5% -scale 2000% "$tmpbg"
convert "$tmpbg" "$icon" -gravity center -composite -matte "$tmpbg"
i3lock -u -i "$tmpbg"

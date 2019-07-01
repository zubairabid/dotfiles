#!/bin/bash

icon="$HOME/Pictures/lock_icon.png"
tmpbg='/tmp/screen.png'

(( $# )) && { icon=$1; }

scrot -z "$tmpbg"
convert "$tmpbg" -scale 4% -scale 2500% "$tmpbg"
convert "$tmpbg" "$icon" -gravity center -composite -matte "$tmpbg"
i3lock -u -i "$tmpbg"

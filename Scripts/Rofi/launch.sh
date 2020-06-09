#!/bin/sh

bg_color=#950b0c0f
text_color=#f3f4f5
htext_color=#9575cd
transp_color=#000b0c0f

rofi -show run -lines 5 -eh 2 -width 100 -padding 400 -bw 0 -color-window "$bg_color, $bg_color, $bg_color" -color-normal "$transp_color, $text_color, $transp_color, $transp_color, $htext_color" -font "Ubuntu Light 14" -matching fuzzy 

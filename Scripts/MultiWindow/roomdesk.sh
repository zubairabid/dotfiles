#!/bin/bash

xrandr --output HDMI2 --scale 1.6x1.6
bash ~/Scripts/Compton/qstart.sh
i3-msg restart

#!/bin/sh
value=`cat /sys/class/backlight/amdgpu_bl0/brightness`
echo $value


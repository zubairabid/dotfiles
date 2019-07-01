#!/bin/sh
value=`cat /sys/class/backlight/amdgpu_bl0/brightness`
changed=$(expr $value + 5)

if [ $changed -lt 255 ]
then
	echo $changed | sudo tee /sys/class/backlight/amdgpu_bl0/brightness
fi

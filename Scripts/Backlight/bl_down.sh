#!/bin/sh
value=`cat /sys/class/backlight/amdgpu_bl0/brightness`
changed=$(expr $value - 5)

if [ $changed -gt 10 ]
then
	echo $changed | sudo tee /sys/class/backlight/amdgpu_bl0/brightness
fi

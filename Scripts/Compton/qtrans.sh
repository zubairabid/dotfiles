#!/bin/bash

pkill compton
compton --config ~/.config/compton/compton.conf --inactive-opacity 0.02 

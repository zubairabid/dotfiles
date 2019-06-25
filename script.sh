#!/bin/bash
rm -rf config
cp -rv ~/.config/ config
cp -ruv ~/.zcompdump ~/.zcompdump-zsys-5.7.1 ~/.zshrc ~/.zshrc.pre-oh-my-zsh ~/.zshrc.zni zsh
cp -ruv ~/.oh-my-zsh/ zsh/oh-my-zsh
cp -ruv ~/.ncmpcpp/ ncmpcpp
cp -ruv ~/.mpdscribble mpdscribble

echo "Done transferring files"

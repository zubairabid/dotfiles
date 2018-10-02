#/bin/bash

cp -u ~/.bashrc ~/Documents/dotfiles/
echo "Copied bashrc"

cp -u ~/.zshrc ~/Documents/dotfiles/
echo "Copied zshrc"

cp -u ~/.vimrc ~/Documents/dotfiles/
echo "Copied vimrc"

cp -u ~/.i3/config ~/Documents/dotfiles/i3config
echo "Copied i3 config"

echo "GIT: procedure started"
git checkout -b new
git add --all
echo "Added modified files"

git commit -m "Daily update: `date`"
echo "Successful commit"

git push origin new
echo "Pushed"

git checkout master

git branch -D new

git fetch origin

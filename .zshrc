# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/$HOME/zsh_custom

# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
  export ZSH=/home/zubair/.oh-my-zsh

. /home/zubair/zsh_custom/z.sh

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
# ZSH_THEME="robbyrussell"
# ZSH_THEME="bullet-train"
# ZSH_THEME="agnoster"
ZSH_THEME="blinks"

# Set list of themes to load
# Setting this variable when ZSH_THEME=random
# cause zsh load theme from this variable instead of
# looking in ~/.oh-my-zsh/themes/
# An empty array have no effect
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion. Case
# sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# The optional three formats: "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# HIST_STAMPS="mm/dd/yyyy"

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
  git
  zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh

#Zubair's Additions
alias fuckoff="shutdown now"
alias c="clear"
alias fucking="sudo apt"
alias exuent="exit"
alias g++="g++ -std=c++11"
alias pycharm="pycharm.sh"
#sl
#   c
#cowsay "Hello, user $USER"
#for the django dev env. For deets, check out https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/development_environment 
export WORKON_HOME=$HOME/.virtualenvs
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
export PROJECT_HOME=$HOME/Devel
source /usr/local/bin/virtualenvwrapper.sh

#for building firefox, with bootstrap.py because installation was fucked halfway through.
export PATH=/home/zubair/.cargo/bin:$PATH

#for bluespec
export BLUESPECDIR="/home/zubair/Downloads/Software/Bluespec/lib"
export BLUESPEC_HOME="/home/zubair/Downloads/Software/Bluespec"
export LM_LICENSE_FILE=27000@10.4.21.49
export CORENLP_HOME="/home/zubair/Documents/stanford-corenlp-full-2018-02-27"
export PATH=$PATH:${BLUESPEC_HOME}/bin
export PATH=$PATH:${BLUESPEC_HOME}/bin:${BLUESPEC_HOME}/util/flexlm/x86_64_re3\n
export PATH=$PATH:"/home/zubair/Downloads/Software/pycharm-2017.3.4/bin"
export PATH=$PATH:"/home/zubair/Devops/idea-IU-181.4203.550/bin"

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='vim'
else
  export EDITOR='mvim'
fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
export SSH_KEY_PATH="~/.ssh/rsa_id"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
export PATH=$PATH:/home/zubair/Qt5.10.0/5.10.0/gcc_64/bin
export PATH=/usr/lib/x86_64-linux-gnu/qt5/bin:$PATH
export PATH=/home/zubair/Qt5.10.0/5.10.0/gcc_64/bin:$PATH
export TOP="/home/zubair/Documents/DLP/Sem2CSO/Lab/riscv"
export RISCV=$TOP/riscv
export PATH=$PATH:$RISCV/bin
export GEM_HOME=$HOME/gems
export PATH=$HOME/gems/bin:$PATH


function setproxy() {
	export ALL_PROXY=https://proxy.iiit.ac.in:8080/
	export all_proxy=https://proxy.iiit.ac.in:8080/
	
	export HTTPS_PROXY=https://proxy.iiit.ac.in:8080/
	export https_proxy=https://proxy.iiit.ac.in:8080/
	
	export HTTP_PROXY=http://proxy.iiit.ac.in:8080/
	export http_proxy=http://proxy.iiit.ac.in:8080/
	
	export FTP_PROXY=ftp://proxy.iiit.ac.in:8080/
	export ftp_proxy=ftp://proxy.iiit.ac.in:8080/
	
	export SOCKS_PROXY=socks://proxy.iiit.ac.in:8080/
	export socks_proxy=socks://proxy.iiit.ac.in:8080/

	echo "Environment variable proxy settings set"

	echo '#!/bin/sh' > /usr/bin/gitproxy
	echo '_proxy=proxy.iiit.ac.in' >> /usr/bin/gitproxy
	echo '_proxyport=8080' >> /usr/bin/gitproxy
	echo 'exec socat STDIO PROXY:$_proxy:$1:$2,proxyport=$_proxyport' >> /usr/bin/gitproxy
}

function unsetproxy() {
	unset {all,https,http,ftp,socks}_proxy
	unset {ALL,HTTPS,HTTP,FTP,SOCKS}_PROXY

	echo "Environment variable proxy settings unset"

	echo '' > /usr/bin/gitproxy
}

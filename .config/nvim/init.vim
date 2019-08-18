set showmatch
set ignorecase
set hlsearch
set tabstop=4
set softtabstop=4
set expandtab
set shiftwidth=4
set autoindent
set number
set cc=80

" Working with the default :Vex
let g:netrw_banner = 0 " Remove banner
let g:netrw_liststyle = 3 " Tree view
let g:netrw_altv = 1
let g:netrw_browse_split = 4 " Open new file in vsplit
let g:netrw_winsize = 25



nmap <C-n> :Vex<CR>

" Plugins will be downloaded under the specified directory.
call plug#begin('~/.local/share/nvim/plugged')

" Declare the list of plugins.

" Status line
Plug 'bling/vim-airline'

" fuzzy finder
Plug '/usr/bin/fzf'

" Taking vimtex plugin config from https://castel.dev/post/lecture-notes-1/
Plug 'lervag/vimtex'
let g:tex_flavor='latex'
let g:vimtex_view_method='zathura'
let g:vimtex_quickfix_mode=0
set conceallevel=1
let g:tex_conceal='abdmg'

" Using coc - completion engine
Plug 'neoclide/coc.nvim', {'branch': 'release'}


" List ends here. Plugins become visible to Vim after this call.
call plug#end()

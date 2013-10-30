#!/usr/bin/env runhaskell

import Text.Pandoc

main = toJsonFilter addMinipages

addMinipages :: [Block] -> [Block]
addMinipages (CodeBlock attr code : xs)
  | not (beginsWithEndMinipage xs) =
            [ RawBlock "latex" "\\begin{minipage}{\\linewidth}"
            , CodeBlock attr code
            , RawBlock "latex" "\\end{minipage}" ]
            ++ addMinipages xs
addMinipages (x:xs) = x : addMinipages xs
addMinipages [] = []

beginsWithEndMinipage (RawBlock "latex" "\\end{minipage}":_) = True
beginsWithEndMinipage _ = False
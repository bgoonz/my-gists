#remove things from contextmenu
ban_menus= {
  "Undo":true
  "Split Up":true
  "Correct Spelling":true
}
atom.contextMenu.itemSets.forEach (o)->
  if o.selector.match(/(atom-text-editor|atom-pane)/)
    if ban_menus[o.items[0].label] || ban_menus[(o.items[1]||{}).label]
      o.items=[];
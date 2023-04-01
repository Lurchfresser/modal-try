##Bugs

1. (first) Reviewcard does not always start modal
2. when changing topic in the left menu, select reviewcard doesnt work, because of `loadobserver`
3. borders of Reviewcard not resettet at `Startmodal()`,maybe extra border color, for active Reviewcards?
4. `Pointerlock` implementation throws sometimes error, when Pointerlock is too quickly exited
5. Error: Receiving end does not exist
6. Add destroys `isModalVisible` calculation
7. get username from header, not from textarea (when name is deleted by modaluser or when there is no name)




##Think of
1. readjust scroll, when Reviews are sent (when reviecard gets deleted)
2. adjust scrolling of textarea and Reviewbody when text gets added
3. rewrite `reviewObserver` and `startMOdal` with jquery (use `:visible`)


##Controls
1. select tab with `left click`
2. alternative tab option with `right click`
3. send answer with `enter`
4. exit modal with `escape`
5. go one level up with `^`
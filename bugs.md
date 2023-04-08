##Bugs

1. borders of Reviewcard not resettet at `Startmodal()`,maybe extra border color, for active Reviewcards? --> better Feedback, while User is waiting for `startModal`
3. Add destroys `isModalVisible` calculation
5. dead key for going one level up still inputs ^




##Think of
1. readjust scroll, when Reviews are sent (when reviecard gets deleted)
2. adjust scrolling of Reviewbody when text gets added
3. rewrite `reviewObserver`
4. Set focus on textarea at `startModal`


##Controls
1. select tab with `left click`
2. alternative tab option with `right click`
3. send answer with `enter`
4. exit modal with `escape`
5. go one level up with `^`


##fixed // done
1. when changing topic in the left menu, select reviewcard doesnt work, because of `loadobserver`
2. `Pointerlock` implementation throws sometimes error, when Pointerlock is too quickly exited
3. (first) Reviewcard does not always start modal
4. confirm choice on unused tabs throws error
5. rewrite `startMOdal`with jquery (use `:visible`)
6. 4. get username from header, not from textarea (when name is deleted by modaluser or when there is no name)
7. Error: Receiving end does not exist
8. adjust scrolling of textarea when text gets added

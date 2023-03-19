##Bugs
1. Cancelbutton does not work sometimes
2. (first) Reviewcard does not always start modal
3. modal selection not working 
(showing 2. level and random templates do not work)
(maybe at `hideModal`?)
4. **_(~~probably fixed)~~_** start modal seems to get called twice while opening the reviwecard (maybe with `click()`)
5. when changing topic in the left menu, select reviewcard doesnt work, because of `loadobserver`
6. borders of Reviewcard not resettet at `Startmodal()`,maybe extra border color, for active Reviewcards?
7. `Pointerlock` implementation throws sometimes error, when Pointerlock is too quickly exited
8. Error: Receiving end does not exist




##Think of
1. readjust scroll, when Reviews are sent (when reviecard gets deleted)
2. at `positionModal` use the `getClientrects` for inner content for `form`
3. adjust scrolling of textarea and Reviewbody when text gets added
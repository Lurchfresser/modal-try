##Bugs
1. Cancelbutton does not work sometimes
2. Reviewcard does not always start modal
3. modal selection not working 
(showing 2. level and random templates do not work)
(maybe at `hideModal`?)
4. **_(~~probably fixed)~~_** start modal seems to get called twice while opening the reviwecard (maybe with `click()`)
5. when changing topic in the left menu, select reviewcard doesnt work, because of `loadobserver`
6. borders of Reviewcard not resettet at `Startmodal()`,maybe extra border color, for active Reviewcards?
7. `Pointerlock` implementation throws sometimes error, when Pointerlock is too quickly exited




##Think of
1. readjust scroll, when Reviews are sent (when reviecard gets deleted)
2. at `positionModal` use the textarea as a border for left, but not for above
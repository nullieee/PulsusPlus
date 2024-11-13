# Changelog

---

## Major Additions

N/A

## Minor Additions

- Minor performance improvement regarding local data autosaving

## Major Bug Fixes

- Effect copy buffer now works correctly regarding timeline alignment
- Both beat and effect buffer pastes now deselect everything and only select the pasted stuff
- UR now shows up "correctly" (The game itself has a flawed performance graph which the UR bases itself on (it always scales the hit error in the graph to 1HW for some reason); this will probably break if Tetro ever fixes that particular bug)

## Minor Bug Fixes

- Start/end times should now be less finnicky (with the sad cost of the end position not being as good looking as before; it will default to 0 for the end just like normal Pulsus)

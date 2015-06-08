# TODO

- Add module to turn game state into discrete features.
  - Consider an approach similar to [this](http://julian.togelius.com/Karakovskiy2012The.pdf) - where the field around the agent is turned into areas with discrete states...
- Record state, action -> state' sequences
- Figure out how to handle reward
- Add a q-learning algorithm
- Wire learning algorithm back into agent

http://webdocs.cs.ualberta.ca/~sutton/book/ebook/node35.html

Feature engineering:
- reframe coodinates of everyone as being w.r.t you (in the center)
- reframe sizes of everyone as being w.r.t you (i.e. how much bigger / smaller
  they are)

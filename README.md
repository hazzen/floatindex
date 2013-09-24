floatindex
==========

A floating sidebar index for longer content. Subtly erases the border between a section in the index
and the content for the section itself. You can view a [working demo](http://hazzen.github.io/floatindex/demo.html).
Or, in ASCII-art:

               |  Section I
               |
               |  lorem ispsum content goes here
    -----------+  lorem ispsum content goes here
    Section I     lorem ispsum content goes here
    -----------+  lorem ispsum content goes here
    Section II |  lorem ispsum content goes here
    -----------+  lorem ispsum content goes here
    Section III+-----------------------------------  
    -----------+  Section II
               |
               |  lorem ispsum content goes here
               |  lorem ispsum content goes here
               |

And if you scroll down to bring Section II header closer to the top:

               |  lorem ispsum content goes here
               |  lorem ispsum content goes here
               |  lorem ispsum content goes here
    -----------+  lorem ispsum content goes here
    Section I     lorem ispsum content goes here
    -----------+-----------------------------------
    Section II    Section II
    -----------+
    Section III|  lorem ispsum content goes here
    -----------+  lorem ispsum content goes here
               |
               |  lorem ispsum content goes here
               |  lorem ispsum content goes here
               |

The code makes a few assumptions about styles (namely colors).

Usage
=====
Given DOM like:
```
  <div class='main' id='main'>
    <div class='index'>
      <div class='section'>Section I</div>
      <div class='section'>Section II</div>
      <div class='section'>Section III</div>
    </div>
    <div class='body'>
      <div class='section'>...</div>
      <div class='section'>...</div>
      <div class='section'>...</div>
    </div>
  </div>
```
Just run the following JS:
```
  FloatIndex.make(document.getElementById('#main'));
```
The code has poor support for margins on the section `div` elements - a level of nesting can fix this.

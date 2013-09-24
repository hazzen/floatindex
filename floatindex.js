(function(exports) {
//
// Given DOM like:
//   <div class='main' id='main'>
//     <div class='index'>
//       <div class='section'>Section I</div>
//       <div class='section'>Section II</div>
//       <div class='section'>Section III</div>
//     </div>
//     <div class='body'>
//       <div class='section'>...</div>
//       <div class='section'>...</div>
//       <div class='section'>...</div>
//     </div>
//   </div>
//
// And the following JS:
//   FloatIndex.make(document.getElementById('#main'));
//
// We change our default look from:
//
//    -----------+
//    Section I  |  lorem ispsum content goes here
//    -----------+  lorem ispsum content goes here
//    Section II |  lorem ispsum content goes here
//    -----------+  lorem ispsum content goes here
//    Section III+-----------------------------------  
//    -----------+  Section II
//               |
//               |  lorem ispsum content goes here
//               |  lorem ispsum content goes here
//               |
//
// To (note the border of Section I in the index):
//
//    ------------
//    Section I     lorem ispsum content goes here
//    -----------+  lorem ispsum content goes here
//    Section II |  lorem ispsum content goes here
//    -----------+  lorem ispsum content goes here
//    Section III+-----------------------------------  
//    -----------+  Section II
//               |
//               |  lorem ispsum content goes here
//               |  lorem ispsum content goes here
//               |
//
// And if scroll down to bring Section II header closer to the top:
//
//    ------------
//    Section I     lorem ispsum content goes here
//    -----------------------------------------------  
//    Section II    Section II
//    -----------+
//    Section III|  lorem ispsum content goes here
//    -----------+  lorem ispsum content goes here
//               |  lorem ispsum content goes here
//               |  lorem ispsum content goes here
//               |  lorem ispsum content goes here
//               |



// Get the absolute vertical position of an element on the page.
// Does not take into account margin/borders.
//
// Returns an object with a "top" and "bottom" measurement, in pixels, from the
// top of the document to the top/bottom of the element.
var getVerticalPos = function(elem) {
  var rect = elem.getBoundingClientRect();
  var scroll = elem.ownerDocument.defaultView.scrollY;
  return {top: scroll + rect.top, bottom: scroll + rect.bottom};
};


// Float an element on the page. If the user scrolls past the element, it will
// stuck to the top of the page.
//
// After construction, you must call "setup()" which will install listeners.
//
// If the provided element has any margins, they will not be taken into account
// due to laziness on the part of the author; use a wrapper instead.
var ScrollFloat = function(elem) {
  this.elem_ = elem;
  this.doc_ = elem.ownerDocument;
  this.window_ = this.doc_.defaultView;
  this.floating_ = false;
  this.savedProps_ = {};
};

// Begin watching the element for changes.
ScrollFloat.prototype.setup = function() {
  this.offset_ = getVerticalPos(this.elem_).top;
  this.window_.addEventListener('scroll', this.onScroll_.bind(this));
  this.window_.addEventListener('resize', this.onResize_.bind(this));
  this.check_();
};

ScrollFloat.prototype.noFloat_ = function() {
  if (!this.floating_) return;
  for (var k in this.savedProps_) {
    this.elem_.style[k] = this.savedProps_[k];
  }
  this.elem_.classList.remove('scroll-floating');
  this.floating_ = false;
};

ScrollFloat.prototype.float_ = function() {
  if (this.floating_) return;
  this.savedProps_ = {
    'position': this.elem_.style.position,
    'top': this.elem_.style.top,
  };
  this.elem_.style.position = 'fixed';
  this.elem_.style.top = '0';
  this.elem_.classList.add('scroll-floating');
  this.floating_ = true;
};

ScrollFloat.prototype.check_ = function() {
  var curOffset = this.window_.scrollY;
  if (curOffset > this.offset_) {
    this.float_();
  } else {
    this.noFloat_();
  }
};

ScrollFloat.prototype.onScroll_ = function(e) {
  this.check_();
};

ScrollFloat.prototype.onResize_ = function(e) {
  this.noFloat_();
  this.offset_ = getVerticalPos(this.elem_).top;
  this.check_();
};


// Compute borders needed for lining up whitespace of an index and a bordered
// body such that there is no border between the section within the body and
// its header in the index.
//
// After construction, you must call "setup()" which will install listeners.
//
// The margins of sections, both in the index and the body, will be ignored due
// to laziness on the part of the author; use a wrapper instead.
var SectionFloater = function(mainElem) {
  this.mainElem_ = mainElem;
  this.doc_ = this.mainElem_.ownerDocument;
  this.window_ = this.doc_.defaultView;

  this.indices_ = this.mainElem_.querySelectorAll('.index .section');
  this.bodies_ = this.mainElem_.querySelectorAll('.body .section');
  if (this.indices_.length != this.bodies_.length) {
    throw 'Bad lengths!';
  }

};

SectionFloater.prototype.setup = function() {
  var bodyStyle = this.window_.getComputedStyle(
      this.mainElem_.querySelector('.body'));
  var borderWidth = bodyStyle.borderLeftWidth;
  this.whites_ = [];
  for (var i = 0; i < this.indices_.length; i++) {
    var white = this.doc_.createElement('div');
    white.style.position = 'absolute';
    white.style.zIndex = 1;
    white.style.width = borderWidth;
    var indexBorderTop =
        this.window_.getComputedStyle(this.indices_[i]).borderTopWidth;
    white.style.marginTop = '-' + indexBorderTop;
    white.style.marginRight = '-' + borderWidth;
    white.style.backgroundColor = '#fff';
    this.indices_[i].appendChild(white);
    this.whites_.push(white);
  }

  this.doc_.addEventListener('scroll', this.onScroll_.bind(this));
  this.doc_.addEventListener('resize', this.onResize_.bind(this));
  this.window_.setTimeout(this.check_.bind(this), 0);
};

SectionFloater.prototype.check_ = function() {
  var pageTop = this.window_.scrollY;
  for (var i = 0; i < this.bodies_.length; i++) {
    var bodyInfo = getVerticalPos(this.bodies_[i]);
    var indexInfo = getVerticalPos(this.indices_[i]);
    var indexTop = indexInfo.top;
    var whiteStart = Math.max(bodyInfo.top, indexInfo.top);
    if (bodyInfo.top < indexInfo.bottom && bodyInfo.bottom > indexInfo.top) {
      var whiteEnd = Math.min(bodyInfo.bottom, indexInfo.bottom);
      this.whites_[i].style.right = '0';
      this.whites_[i].style.top = (whiteStart - indexInfo.top) + 'px';
      this.whites_[i].style.height = (whiteEnd - whiteStart - 1) + 'px';
      this.whites_[i].style.visibility = 'visible';
    } else {
      this.whites_[i].style.visibility = 'hidden';
    }
  }
};

SectionFloater.prototype.onScroll_ = function(e) {
  this.window_.setTimeout(this.check_.bind(this), 0);
};

SectionFloater.prototype.onResize_ = function(e) {
  this.window_.setTimeout(this.check_.bind(this), 0);
};


exports.FloatIndex = {
  make: function(mainElem) {
    var index = mainElem.querySelector('.index-wrapper');
    var flt = new ScrollFloat(index);
    flt.setup();

    var sect = new SectionFloater(mainElem);
    sect.setup();
  },
};

})(window);

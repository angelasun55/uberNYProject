//source from http://codepen.io/josiahruddell/pen/GodKE
$.fn.nbtSlider = (function($){
  // NbtSlider expects markup to be generated or written out
  // gleans values and state from the elements in the wrapper.
  var NbtSlider = function(container, config){
    container = $(container);
    // create instance variables
    $.extend(this, {
      /*
      *   ELEMENTS
      */
      container: container,
      leftTip: container.find('.progress-tip.left').hide(),
      rightTip: container.find('.progress-tip.right').hide(),
      hidden: container.find(':input:hidden'),
      labels: container.find('label').each(function(i){
        $(this).attr('data-index', i);
      }),
      /*
      *   VALUES
      *   array of values e.g. [ { value: '', text: '' }, {  }, .. ]
      */ 
      values: container.find('label').map(function(){
        return { 
          value: this.getAttribute('data-value'), 
          text: $.trim(this.innerHTML) 
        };
      }).get(),
      /*
      *   CALLBACKS
      */
      // first load/activate callback
      onLoad: function(value, index){  },
      // value change callback
      onChange: function(value, index){  },
      // before the ui is updated to match the selected value 
      beforePosition: function(isLoadOrResize){ },
      // after the ui is updated to match the selected value 
      afterPosition: function(isLoadOrResize){ } 
    }, config);
    
    // adds non data-driven markup
    this.build();
    
    // uses config variables to calculate internal settings
    this.init();
    
    // add listeners 
    this.bind();
    
    // sets the initial display
    this.position();
  };
  
  NbtSlider.prototype = {
    build: function(){
      this.container.prepend(
        '<div class="slider-highlight"></div>' +
        '<div class="slider-track">' +
          '<a class="slider-handle" href="javascript:;"></a>' +
        '</div>'
      );
      this.handle = this.container.find('.slider-handle');
      this.highlight = this.container.find('.slider-highlight');
    },
    init: function(){
      this.numValues = this.values.length;
      this.containerWidth = this.container.width();
      this.containerOuterWidth = this.container.outerWidth();
      this.containerOuterHeight = this.container.outerHeight();
      this.containerOuter = Math.abs(this.containerOuterWidth - this.containerWidth);
      this.gridSize = this.containerWidth / this.numValues;
      
      this.value = this.hidden.val();
      this.index = parseInt(this.labels.filter('[data-value="' + this.value + '"]').attr('data-index') || '0', 10);
    },
    bind: function(){
      var self = this;
      
      this.container.on('click.nbtslider', function(e){
        var index = self._getIndexByMouseEvent(e);
        self.goTo(index);
      });
      
      this.handle.draggable({
        axis: 'x',
        containment: 'parent',
        scroll: false,
        drag: function(e, ui){
          //console.log(ui.position.left, ui.originalPosition.left);
          var l = ui.position.left,
              ol = ui.originalPosition.left;
          if(l !== ol && Math.abs(ol - l) >= (Math.min(self.gridSize)-15)){ // the 15 is a move buffer
            if(ui.position.left > ui.originalPosition.left){
              //console.log('> ',ui.position.left, ui.originalPosition.left);
              self.moveNext.apply(self, arguments);
              
            }
            else{
              //console.log('< ',ui.position.left, ui.originalPosition.left);
              self.movePrev.apply(self, arguments);
            }
            ui.originalPosition.left = ui.position.left;
          }
        }
      }).on('click', function(e){ e.stopEventPropagation(); });
    },
    
    // sets tooltip positions and highlight
    position: function(){
      var isFirstLoadOrResize, self = this;
      // support for resizeable container / window
      // incomplete just add a resize event that check
      // current vs previous container width and set hasResize = true
      if(isFirstLoadOrResize = (this.hasResize || this.hasResize === undefined)){
        this.beforePosition.apply(this, [isFirstLoadOrResize]);
        // configure container based widths
        this.init();
        this.handle.draggable({grid: [ this.gridSize, 0 ]});
      
        // set label widths
        this.labels.width(this.gridSize);
        
        // position tips above container from bottom so they can grow vertically
        this.leftTip.css({ bottom: this.containerOuterHeight + 10 });
        this.rightTip.css({ bottom: this.containerOuterHeight + 10 });
        
        this.hasResize = false;
      }
      
      var func = isFirstLoadOrResize ? 'css' : 'animate', 
          duration = 200,
          isLast = this.index == (this.numValues -1),
          isFirst = this.index == 0;
      
      // position the handle
      this.handle.css({ 
        left: (this.gridSize * this.index) + (1/2 * this.gridSize) - (1/2 * this.handle.outerWidth())
      }, duration);
      
      // activate labels
      this.labels.removeClass('active').eq(this.index).prevAll().andSelf().addClass('active');
      
      // position highlight
      var highlightWidth = (this.gridSize * (this.index + 1)) + (1/(isLast ? 1 : 2) * this.containerOuter);
      this.highlight.stop(true, false)[func]({width: highlightWidth }, duration);
      
      // position tooltips
      this.leftTip.stop(true, false)[func]({ 
        left: (1/2 * highlightWidth) - (1/2 * this.leftTip.outerWidth()) 
      }, duration);
      
      this.rightTip.stop(true, false)[func]({ 
        right: (1/2 * (this.containerOuterWidth - highlightWidth)) - (1/2 * this.rightTip.outerWidth()) 
      }, duration);
      
      if(isFirstLoadOrResize){
        // show tips 
        this.leftTip.show(); 
        this.rightTip.show();
      }
      
      this.rightTip.toggle(!isLast);
      // this.leftTip.toggle(!isFirst);
          
      setTimeout(function(){ 
        self.afterPosition.apply(self, [isFirstLoadOrResize]);
        isFirstLoadOrResize && self.onLoad.apply(self, self.value, self.index);
      }, isFirstLoadOrResize ? 0 : duration);
    },
    _getIndexByMouseEvent: function(e){
      var co = this.container.offset(),
          l = e.pageX - co.left;
      
      return Math.floor(l / this.gridSize);
    },
    goTo: function(index){
      if(index === this.index) return;
      this.index = index;
      this.updateValue();
    },
    moveNext: function(e, ui){
      this.index++;
      this.updateValue();
      //console.log('move next', this.index, this.value);
    },
    movePrev: function(e, ui){
      this.index--;
      this.updateValue();
      //console.log('move prev', this.index, this.value);
    },
    updateValue: function(){
      // get slider position and validate against
      // next value to make sure it was a real move
      // do range checks
      if(this.values[this.index] !== undefined){
        var nextVal = this.values[this.index].value;
        if(nextVal != this.value){
          this.value = nextVal;
          this.hidden.val(this.value);
          this.onChange.apply(this, [this.value, this.index]);
          this.position();
        }
      }
      else{
        // something went wrong with the drag buffer
        // find value by position now
      }
    }
  };
  
  return function(config){
    return this.each(function(){
      $(this).data('nbtSlider', new NbtSlider(this, config));
    });
  };
  
})(jQuery);

$(function(){
  
  var loadOrChange = function(value, index){
    $('#value').html(value);
    $('#index').html(index);
    this.leftTip.html('Calculated ROP for <br />' + value + ' or more dispenses');
  };
  
  $('.slider').nbtSlider({ 
    onLoad: loadOrChange,
    onChange: loadOrChange
  });
});

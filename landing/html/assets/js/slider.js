//    Theme Name: Artik
//    Description: Template for Photographers or any Creative Agency
//    Author: WebGraphicArt
//    Version: 2.0


/*--------------- SLIDESHOW ---------------*/

// From https://davidwalsh.name/javascript-debounce-function.
function debounce(func, wait, immediate) {
   var timeout;
   return function() {
      var context = this, args = arguments;
      var later = function() {
         timeout = null;
         if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
   };
 }

// SLIDESHOW 1

class Slideshow1 {
   constructor(el, settings) {
      this.DOM = {};
      this.DOM.el = el;
      this.settings = {
          animation: {
              slides: {
                  duration: 600,
                  easing: 'easeOutQuint',
              },
              shape: {
                  duration: 300,
                  easing: {in: 'easeOutQuint', out: 'easeOutQuad'}
              }
          },
          frameFill: '#f1f1f1'
      }
      this.settings.autoSlide = settings.autoSlide || false;
      this.settings.autoSlideTimeout = settings.autoSlideTimeout || 4000;
      this.settings.animation.slides.duration = settings.duration;
      this.settings.animation.shape.duration = settings.shape_duration;
      this.settings.frameFill = settings.frameFill; 
      this.init();
   }
   init() {
      this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide-wrap'));
      this.slidesTotal = this.DOM.slides.length;
      this.DOM.nav = this.DOM.el.querySelector('.slidenav');
      this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav-item-next');
      this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav-item-prev');
      this.current = 0;
      this.createFrame(); 
      this.initEvents();
   }
   createFrame() {
      this.rect = this.DOM.el.getBoundingClientRect();
      this.frameSize = this.rect.width/12; //width height svg
      this.paths = {
          initial: this.calculatePath('initial'),
          final: this.calculatePath('final')
      };
      this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.DOM.svg.setAttribute('class', 'slideshow-shape-1');
      this.DOM.svg.setAttribute('width','100%');
      this.DOM.svg.setAttribute('height','100%');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
      this.DOM.shape = this.DOM.svg.querySelector('path');
   }
   updateFrame() {
      this.paths.initial = this.calculatePath('initial');
      this.paths.final = this.calculatePath('final');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
   }
   calculatePath(path = 'initial') {
      return path === 'initial' ?
              `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` :
              `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`;
   }
   initEvents() {
      this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
      this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

      window.addEventListener('resize', debounce(() => {
          this.rect = this.DOM.el.getBoundingClientRect();
          this.updateFrame();
      }, 20));

      document.addEventListener('keydown', (ev) => {
          const keyCode = ev.keyCode || ev.which;
          if ( keyCode === 37 ) {
              this.navigate('prev');
          }
          else if ( keyCode === 39 ) {
              this.navigate('next');
          }
      });
         if(this.settings.autoSlide) {
             setInterval(() => this.navigate('next'), this.settings.autoSlideTimeout);
         }
   }
   navigate(dir = 'next') {
      if ( this.isAnimating ) return false;
      this.isAnimating = true;

      const animateShapeIn = anime({
          targets: this.DOM.shape,
          duration: this.settings.animation.shape.duration,
          easing: this.settings.animation.shape.easing.in,
          d: this.paths.final
      });

      const animateSlides = () => {
          return new Promise((resolve, reject) => {
              const currentSlide = this.DOM.slides[this.current];
              anime({
                  targets: currentSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                  complete: () => {
                      currentSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              this.current = dir === 'next' ? 
                  this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                  this.current > 0 ? this.current - 1 : this.slidesTotal-1; 

              const newSlide = this.DOM.slides[this.current];
              newSlide.classList.add('slide-current');
              anime({
                  targets: newSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
              });

              const newSlideImg = newSlide.querySelector('.slide-img');
              anime.remove(newSlideImg);
              anime({
                  targets: newSlideImg,
                  duration: this.settings.animation.slides.duration*5,
                  easing: this.settings.animation.slides.easing,
                  translateX: [dir === 'next' ? 200 : -200, 0]
              });

              anime({
                  targets: [newSlide.querySelector('.slide-title'), newSlide.querySelector('.slide-desc'), newSlide.querySelector('.slide-link')],
                  duration: this.settings.animation.slides.duration*2,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i) => i*300+300,
                  translateX: [dir === 'next' ? 300 : -300,0],
                  opacity: [0,1]
              });
          });
      };

      const animateShapeOut = () => {
          anime({
              targets: this.DOM.shape,
              duration: this.settings.animation.shape.duration,
              delay: 150,
              easing: this.settings.animation.shape.easing.out,
              d: this.paths.initial,
              complete: () => this.isAnimating = false
          });
      }

      animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
   }
}

// SLIDESHOW 2

class Slideshow2 {
   constructor(el, settings) {
      this.DOM = {};
      this.DOM.el = el;
      this.settings = {
          animation: {
              slides: {
                  duration: 600,
                  easing: 'easeOutQuint'
              },
              shape: {
                  duration: 300,
                  easing: {in: 'easeOutQuad', out: 'easeOutQuad'}
              }
          },
          frameFill: '#111'
      }
      this.settings.autoSlide = settings.autoSlide || false;
      this.settings.autoSlideTimeout = settings.autoSlideTimeout || 4000;
      this.settings.animation.slides.duration = settings.duration;
      this.settings.animation.shape.duration = settings.shape_duration;
      this.settings.frameFill = settings.frameFill; 

      this.init();
   }
   init() {
      this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide-wrap'));
      this.slidesTotal = this.DOM.slides.length;
      this.DOM.nav = this.DOM.el.querySelector('.slidenav');
      this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav-item-next');
      this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav-item-prev');
      this.current = 0;
      this.createFrame(); 
      this.initEvents();
   }
   createFrame() {
      this.rect = this.DOM.el.getBoundingClientRect();
      this.frameSize = this.rect.width/12;
      this.paths = {
          initial: this.calculatePath('initial'),
          final: this.calculatePath('final')
      };
      this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.DOM.svg.setAttribute('class', 'slideshow-shape-2');
      this.DOM.svg.setAttribute('width','100%');
      this.DOM.svg.setAttribute('height','100%');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
      this.DOM.shape = this.DOM.svg.lastElementChild;
   }
   updateFrame() {
      this.paths.initial = this.calculatePath('initial');
      this.paths.final = this.calculatePath('final');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
   }
   calculatePath(path = 'initial') {
      if ( path === 'initial' ) {
          return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
      }
      else {
          return {
              next: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize/2} ${this.frameSize},${this.rect.height-this.frameSize} Z`,
              prev: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize/2} Z`
          }
      }
   }
   initEvents() {
      this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
      this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

      window.addEventListener('resize', debounce(() => {
          this.rect = this.DOM.el.getBoundingClientRect();
          this.updateFrame();
      }, 20));

      document.addEventListener('keydown', (ev) => {
          const keyCode = ev.keyCode || ev.which;
          if ( keyCode === 37 ) {
              this.navigate('prev');
          }
          else if ( keyCode === 39 ) {
              this.navigate('next');
          }
      });
         if(this.settings.autoSlide) {
             setInterval(() => this.navigate('next'), this.settings.autoSlideTimeout);
         }
   }
   navigate(dir = 'next') {
      if ( this.isAnimating ) return false;
      this.isAnimating = true;

      const animateShapeIn = anime({
          targets: this.DOM.shape,
          duration: this.settings.animation.shape.duration,
          easing: this.settings.animation.shape.easing.in,
          d: dir === 'next' ? this.paths.final.next : this.paths.final.prev
      });

      const animateSlides = () => {
          return new Promise((resolve, reject) => {
              const currentSlide = this.DOM.slides[this.current];
              anime({
                  targets: currentSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                  complete: () => {
                      currentSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              this.current = dir === 'next' ? 
                  this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                  this.current > 0 ? this.current - 1 : this.slidesTotal-1; 

              const newSlide = this.DOM.slides[this.current];
              newSlide.classList.add('slide-current');
              anime({
                  targets: newSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
              });

              const newSlideImg = newSlide.querySelector('.slide-img');
              newSlideImg.style.transformOrigin = dir === 'next' ? '-10% 50%' : '110% 50%';
              anime.remove(newSlideImg);
              anime({
                  targets: newSlideImg,
                  duration: this.settings.animation.slides.duration*4,
                  easing: 'easeOutElastic',
                  elasticity: 350,
                  scale: [1.2,1],
                  rotate: [dir === 'next' ? 4 : -4,0]
              });

              anime({
                  targets: [newSlide.querySelector('.slide-title'), newSlide.querySelector('.slide-desc'), newSlide.querySelector('.slide-link')],
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i,total) => dir === 'next' ? i*100+750 : (total-i-1)*100+750,
                  translateY: [dir === 'next' ? 300 : -300,0],
                  rotate: [15,0],
                  opacity: [0,1],
                  scale: [0.8,1], // Mio
              });
          });
      };

      const animateShapeOut = () => {
          anime({
              targets: this.DOM.shape,
              duration: this.settings.animation.shape.duration,
              delay: 150,
              easing: this.settings.animation.shape.easing.out,
              d: this.paths.initial,
              complete: () => this.isAnimating = false
          });
      }

      animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
   }
}

// SLIDESHOW 3

class Slideshow3 {
   constructor(el, settings) {
      this.DOM = {};
      this.DOM.el = el;
      this.settings = {
          animation: {
              slides: {
                  duration: 600,
                  easing: 'easeOutQuint'
              },
              shape: {
                  duration: 300,
                  easing: {in: 'easeOutQuad', out: 'easeOutQuad'}
              }
          },
          frameFill: '#000'
      }
      this.settings.autoSlide = settings.autoSlide || false;
      this.settings.autoSlideTimeout = settings.autoSlideTimeout || 4000;
      this.settings.animation.slides.duration = settings.duration;
      this.settings.animation.shape.duration = settings.shape_duration;
      this.settings.frameFill = settings.frameFill; 
      this.init();
   }
   init() {
      this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide-wrap'));
      this.slidesTotal = this.DOM.slides.length;
      this.DOM.nav = this.DOM.el.querySelector('.slidenav');
      this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav-item-next');
      this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav-item-prev');
      this.current = 0;
      this.createFrame(); 
      this.initEvents();
   }
   createFrame() {
      this.rect = this.DOM.el.getBoundingClientRect();
      this.frameSize = this.rect.width/12;
      this.paths = {
          initial: this.calculatePath('initial'),
          final: this.calculatePath('final')
      };
      this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.DOM.svg.setAttribute('class', 'slideshow-shape-3');
      this.DOM.svg.setAttribute('width','100%');
      this.DOM.svg.setAttribute('height','100%');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);

      this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
      this.DOM.shape = this.DOM.svg.lastElementChild;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
      this.DOM.shape = this.DOM.svg.querySelector('path');
   }
   updateFrame() {
      this.paths.initial = this.calculatePath('initial');
      this.paths.final = this.calculatePath('final');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.shape.setAttribute('d', this.paths.initial);
   }
   calculatePath(path = 'initial') {
      if ( path === 'initial' ) {
          return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
      }
      else {
          return {
              step1: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`,
              step2: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`,
              step3: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} 0,${this.rect.height} Z`,
              step4: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`
          }
      }
   }
   initEvents() {
      this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
      this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

      window.addEventListener('resize', debounce(() => {
          this.rect = this.DOM.el.getBoundingClientRect();
          this.updateFrame();
      }, 20));

      document.addEventListener('keydown', (ev) => {
          const keyCode = ev.keyCode || ev.which;
          if ( keyCode === 37 ) {
              this.navigate('prev');
          }
          else if ( keyCode === 39 ) {
              this.navigate('next');
          }
      });
         if(this.settings.autoSlide) {
             setInterval(() => this.navigate('next'), this.settings.autoSlideTimeout);
         }
   }
   navigate(dir = 'next') {
      if ( this.isAnimating ) return false;
      this.isAnimating = true;

      const animateShapeInTimeline = anime.timeline({
          duration: this.settings.animation.shape.duration,
          easing: this.settings.animation.shape.easing.in
      });  
      animateShapeInTimeline
          .add({
              targets: this.DOM.shape,
              d: this.paths.final.step1
          })
          .add({
              targets: this.DOM.shape,
              d: this.paths.final.step2,
              offset: `-=${this.settings.animation.shape.duration*.5}`
          })
          .add({
              targets: this.DOM.shape,
              d: this.paths.final.step3,
              offset: `-=${this.settings.animation.shape.duration*.5}`
          })
          .add({
              targets: this.DOM.shape,
              d: this.paths.final.step4,
              offset: `-=${this.settings.animation.shape.duration*.5}`
          });

      const animateSlides = () => {
          return new Promise((resolve, reject) => {
              const currentSlide = this.DOM.slides[this.current];
              anime({
                  targets: currentSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                  complete: () => {
                      currentSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              this.current = dir === 'next' ? 
                  this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                  this.current > 0 ? this.current - 1 : this.slidesTotal-1; 

              const newSlide = this.DOM.slides[this.current];
              newSlide.classList.add('slide-current');
              anime({
                  targets: newSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
              });

              const newSlideImg = newSlide.querySelector('.slide-img');
              anime.remove(newSlideImg);
              anime({
                  targets: newSlideImg,
                  duration: this.settings.animation.slides.duration*4,
                  easing: this.settings.animation.slides.easing,
                  translateX: [dir === 'next' ? 200 : -200, 0]
              });

              anime({
                  targets: [newSlide.querySelector('.slide-title'), newSlide.querySelector('.slide-desc'), newSlide.querySelector('.slide-link')],
                  duration: this.settings.animation.slides.duration*2,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i) => i*100+100,
                  translateX: [dir === 'next' ? 300 : -300,0],
                  opacity: [0,1]
              });
          });
      };

      const animateShapeOut = () => {  
          const animateShapeOutTimeline = anime.timeline({
              duration: this.settings.animation.shape.duration,
              easing: this.settings.animation.shape.easing.out
          });  
          animateShapeOutTimeline
              .add({
                  targets: this.DOM.shape,
                  d: this.paths.final.step3
              })
              .add({
                  targets: this.DOM.shape,
                  d: this.paths.final.step2,
                  offset: `-=${this.settings.animation.shape.duration*.5}`
              })
              .add({
                  targets: this.DOM.shape,
                  d: this.paths.final.step1,
                  offset: `-=${this.settings.animation.shape.duration*.5}`
              })
              .add({
                  targets: this.DOM.shape,
                  d: this.paths.initial,
                  offset: `-=${this.settings.animation.shape.duration*.5}`,
                  complete: () => this.isAnimating = false
              });
      }

      animateShapeInTimeline.finished.then(animateSlides).then(animateShapeOut);
   }
}

// SLIDESHOW 4

function getRandomInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(minValue,maxValue,precision) {
   if ( typeof(precision) == 'undefined' ) {
      precision = 2;
   }
   return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(precision));
}

class Slideshow4 {
   constructor(el, settings) {
      this.DOM = {};
      this.DOM.el = el;
      this.settings = {
          animation: {
              slides: {
                  duration: 400,
                  easing: 'easeOutQuint'
              },
              shape: {
                  duration: 400,
                  easing: {in: 'easeOutQuint', out: 'easeInQuad'}
              }
          },
          frameFill: '#000'
      }
      this.settings.autoSlide = settings.autoSlide || false;
      this.settings.autoSlideTimeout = settings.autoSlideTimeout || 4000;
      this.settings.animation.slides.duration = settings.duration;
      this.settings.animation.shape.duration = settings.shape_duration;
      this.settings.frameFill = settings.frameFill;             
      this.init();
   }
   init() {
      this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides-images > .slide-wrap'));
      this.slidesTotal = this.DOM.slides.length;
      this.DOM.nav = this.DOM.el.querySelector('.slidenav');
      this.DOM.titles = this.DOM.el.querySelector('.slides-titles');
      this.DOM.titlesSlides = Array.from(this.DOM.titles.querySelectorAll('.slide-wrap'));
      this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav-item-next');
      this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav-item-prev');
      this.current = 0;
      this.createFrame(); 
      this.initEvents();
   }
   createFrame() {
      this.rect = this.DOM.el.getBoundingClientRect();
      this.frameSize = this.rect.width/12;
      this.paths = {
          initial: this.calculatePath('initial'),
          final: this.calculatePath('final')
      };
      this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.DOM.svg.setAttribute('class', 'slideshow-shape-4');
      this.DOM.svg.setAttribute('width','100%');
      this.DOM.svg.setAttribute('height','100%');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      const imgFillSize = this.calculateImgFillSizes();
      this.DOM.svg.innerHTML = `
          <defs>
              <clipPath id="shape-clip">
                  <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>
              </clipPath>
          </defs>
          <image xlink:href="../assets/img/bg-slideshow4.jpg" clip-path="url(#shape-clip)" x="0" y="0" width="${imgFillSize.width}px" height="${imgFillSize.height}px"/>
      `;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.titles);
      this.DOM.shape = this.DOM.svg.querySelector('path');
      this.DOM.imgFill = this.DOM.svg.querySelector('image');
   }
   calculateImgFillSizes() {
      const ratio = Math.max(this.rect.width / 1920, this.rect.height / 1140);
      return {width: 1920*ratio, height: 1140*ratio};
   }
   updateFrame() {
      this.paths.initial = this.calculatePath('initial');
      this.paths.final = this.calculatePath('final');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
      const imgFillSize = this.calculateImgFillSizes();
      this.DOM.imgFill.setAttribute('width',`${imgFillSize.width}px`);
      this.DOM.imgFill.setAttribute('height',`${imgFillSize.height}px`);
   }
   calculatePath(path = 'initial') {
      const r = Math.sqrt(Math.pow(this.rect.height,2) + Math.pow(this.rect.width,2));
      const rInitialOuter = r;
      const rInitialInner = r;
      const rFinalOuter = r;
      const rFinalInner = this.rect.width/3*getRandomFloat(0.2,0.4);
      const getCenter = () => `${getRandomInt(rFinalInner,this.rect.width-rFinalInner)}, ${getRandomInt(rFinalInner,this.rect.height-rFinalInner)}`;
      return path === 'initial' ? 
          `M ${this.rect.width/2}, ${this.rect.height/2} m 0 ${-rInitialOuter} a ${rInitialOuter} ${rInitialOuter} 0 1 0 1 0 z m -1 ${rInitialOuter-rInitialInner} a ${rInitialInner} ${rInitialInner} 0 1 1 -1 0 Z` :
          `M ${getCenter()} m 0 ${-rFinalOuter} a ${rFinalOuter} ${rFinalOuter} 0 1 0 1 0 z m -1 ${rFinalOuter-rFinalInner} a ${rFinalInner} ${rFinalInner} 0 1 1 -1 0 Z`;
   }
   initEvents() {
      this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
      this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

      window.addEventListener('resize', debounce(() => {
          this.rect = this.DOM.el.getBoundingClientRect();
          this.updateFrame();
      }, 20));

      document.addEventListener('keydown', (ev) => {
          const keyCode = ev.keyCode || ev.which;
          if ( keyCode === 37 ) {
              this.navigate('prev');
          }
          else if ( keyCode === 39 ) {
              this.navigate('next');
          }
      });
         if(this.settings.autoSlide) {
             setInterval(() => this.navigate('next'), this.settings.autoSlideTimeout);
         }
   }
   navigate(dir = 'next') {
      if ( this.isAnimating ) return false;
      this.isAnimating = true;

      const animateShapeIn = anime({
          targets: this.DOM.shape,
          duration: this.settings.animation.shape.duration,
          easing: this.settings.animation.shape.easing.in,
          d: this.calculatePath('final')
      });

      const animateSlides = () => {
          return new Promise((resolve, reject) => {
              const currentSlide = this.DOM.slides[this.current];
              anime({
                  targets: currentSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateY: dir === 'next' ? -1*this.rect.height : this.rect.height,
                  complete: () => {
                      currentSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              const currentTitleSlide = this.DOM.titlesSlides[this.current];
              anime({
                  targets: currentTitleSlide.children,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                  translateY: [0, dir === 'next' ? -100 : 100],
                  opacity: [1,0],
                  complete: () => {
                      currentTitleSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              this.current = dir === 'next' ? 
                  this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                  this.current > 0 ? this.current - 1 : this.slidesTotal-1; 

              const newSlide = this.DOM.slides[this.current];
              newSlide.classList.add('slide-current');
              anime({
                  targets: newSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateY: [dir === 'next' ? this.rect.height : -1*this.rect.height,0]
              });

              const newSlideImg = newSlide.querySelector('.slide-img');
              anime.remove(newSlideImg);
              anime({
                  targets: newSlideImg,
                  duration: this.settings.animation.slides.duration*4,
                  easing: this.settings.animation.slides.easing,
                  translateY: [dir === 'next' ? 100 : -100, 0]
              });

              const newTitleSlide = this.DOM.titlesSlides[this.current];
              newTitleSlide.classList.add('slide-current');
              anime({
                  targets: newTitleSlide.children,
                  duration: this.settings.animation.slides.duration*2,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i,total) => dir === 'next' ? i*100+100 : (total-i-1)*100+100,
                  translateY: [dir === 'next' ? 100 : -100 ,0],
                  opacity: [0,1]
              });
          });
      };

      const animateShapeOut = () => {
          anime({
              targets: this.DOM.shape,
              duration: this.settings.animation.shape.duration,
              //delay: 100,
              easing: this.settings.animation.shape.easing.out,
              d: this.paths.initial,
              complete: () => this.isAnimating = false
          });
      }

      animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
   }
}

// SLIDESHOW 5

class Slideshow5 {
   constructor(el, settings) {
      this.DOM = {};
      this.DOM.el = el;
      this.settings = {
          animation: {
              slides: {
                  duration: 500,
                  easing: 'easeOutQuint'
              },
              shape: {
                  duration: 300,
                  easing: {in: 'easeOutQuint', out: 'easeOutQuad'}
              }
          },
          frameFill: '#000'
      }            
      this.settings.autoSlide = settings.autoSlide || false;
      this.settings.autoSlideTimeout = settings.autoSlideTimeout || 4000;
      this.settings.animation.slides.duration = settings.duration;
      this.settings.animation.shape.duration = settings.shape_duration;
      this.settings.frameFill = settings.frameFill; 
      this.init();
   }
   init() {
      this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides-images > .slide-wrap'));
      this.slidesTotal = this.DOM.slides.length;
      this.DOM.nav = this.DOM.el.querySelector('.slidenav');
      this.DOM.titles = this.DOM.el.querySelector('.slides-titles');
      this.DOM.titlesSlides = Array.from(this.DOM.titles.querySelectorAll('.slide-wrap'));
      this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav-item-next');
      this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav-item-prev');
      this.current = 0;
      this.createFrame(); 
      this.initEvents();
   }
   createFrame() {
      this.rect = this.DOM.el.getBoundingClientRect();
      this.frameSize = this.rect.width/12;
      this.paths = {
          initial: this.calculatePath('initial'),
          final: this.calculatePath('final')
      };
      this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.DOM.svg.setAttribute('class', 'slideshow-shape-5');
      this.DOM.svg.setAttribute('width','100%');
      this.DOM.svg.setAttribute('height','100%');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);

      this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
      this.DOM.shape = this.DOM.svg.lastElementChild;
      this.DOM.el.insertBefore(this.DOM.svg, this.DOM.titles);
      this.DOM.shape = this.DOM.svg.querySelector('path');
   }
   updateFrame() {
      this.paths.initial = this.calculatePath('initial');
      this.paths.final = this.calculatePath('final');
      this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
      this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
   }
   calculatePath(path = 'initial') {

      if ( path === 'initial' ) {
          return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
      }
      else {
          const point1 = {x: this.rect.width/4-50, y: this.rect.height/4+50};
          const point2 = {x: this.rect.width/4+50, y: this.rect.height/4-50};
          const point3 = {x: this.rect.width-point2.x, y: this.rect.height-point2.y};
          const point4 = {x: this.rect.width-point1.x, y: this.rect.height-point1.y};

          return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${point1.x},${point1.y} ${point2.x},${point2.y} ${point4.x},${point4.y} ${point3.x},${point3.y} Z`;
      }
   }
   initEvents() {
      this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
      this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

      window.addEventListener('resize', debounce(() => {
          this.rect = this.DOM.el.getBoundingClientRect();
          this.updateFrame();
      }, 20));

      document.addEventListener('keydown', (ev) => {
          const keyCode = ev.keyCode || ev.which;
          if ( keyCode === 37 ) {
              this.navigate('prev');
          }
          else if ( keyCode === 39 ) {
              this.navigate('next');
          }
      });
         if(this.settings.autoSlide) {
             setInterval(() => this.navigate('next'), this.settings.autoSlideTimeout);
      }
   }
   navigate(dir = 'next') {
      if ( this.isAnimating ) return false;
      this.isAnimating = true;

      const animateShapeIn = anime({
          targets: this.DOM.shape,
          duration: this.settings.animation.shape.duration,
          easing: this.settings.animation.shape.easing.in,
          d: this.paths.final
      });

      const animateSlides = () => {
          return new Promise((resolve, reject) => {
              const currentSlide = this.DOM.slides[this.current];
              anime({
                  targets: currentSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateY: dir === 'next' ? this.rect.height : -1*this.rect.height,
                  complete: () => {
                      currentSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              const currentTitleSlide = this.DOM.titlesSlides[this.current];
              anime({
                  targets: currentTitleSlide.children,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                  translateY: [0, dir === 'next' ? 100 : -100],
                  opacity: [1,0],
                  complete: () => {
                      currentTitleSlide.classList.remove('slide-current');
                      resolve();
                  }
              });

              this.current = dir === 'next' ? 
                  this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                  this.current > 0 ? this.current - 1 : this.slidesTotal-1; 

              const newSlide = this.DOM.slides[this.current];
              newSlide.classList.add('slide-current');
              anime({
                  targets: newSlide,
                  duration: this.settings.animation.slides.duration,
                  easing: this.settings.animation.slides.easing,
                  translateY: [dir === 'next' ? -1*this.rect.height : this.rect.height,0]
              });

              const newSlideImg = newSlide.querySelector('.slide-img');

              anime.remove(newSlideImg);
              anime({
                  targets: newSlideImg,
                  duration: this.settings.animation.slides.duration*3,
                  easing: this.settings.animation.slides.easing,
                  translateY: [dir === 'next' ? -100 : 100, 0],
                  scale: [0.2,1]
              });

              const newTitleSlide = this.DOM.titlesSlides[this.current];
              newTitleSlide.classList.add('slide-current');
              anime({
                  targets: newTitleSlide.children,
                  duration: this.settings.animation.slides.duration*1.5,
                  easing: this.settings.animation.slides.easing,
                  delay: (t,i,total) => dir === 'next' ? i*100+100 : (total-i-1)*100+100,
                  translateY: [dir === 'next' ? -100 : 100 ,0],
                  opacity: [0,1]
              });
          });
      };

      const animateShapeOut = () => {
          anime({
              targets: this.DOM.shape,
              duration: this.settings.animation.shape.duration,
              easing: this.settings.animation.shape.easing.out,
              d: this.paths.initial,
              complete: () => this.isAnimating = false
          });
      }

      animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
   }
}

new Slideshow1(document.querySelector('.slideshow-1'), { autoSlide: false, autoSlideTimeout: 8000, duration: 2000, shape_duration: 700 });
new Slideshow2(document.querySelector('.slideshow-2'), { autoSlide: false, autoSlideTimeout: 8000, duration: 2000, shape_duration: 700 });
new Slideshow3(document.querySelector('.slideshow-3'), { autoSlide: false, autoSlideTimeout: 8000, duration: 2000, shape_duration: 300 });
new Slideshow4(document.querySelector('.slideshow-4'), { autoSlide: false, autoSlideTimeout: 8000, duration: 2000, shape_duration: 700 });
new Slideshow5(document.querySelector('.slideshow-5'), { autoSlide: false, autoSlideTimeout: 8000, duration: 2000, shape_duration: 700 });

imagesLoaded('.slide-img', { background: true }); 
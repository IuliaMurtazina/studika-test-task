class BurgerMenu {
  burgerMenuOpenButton = document.querySelector(".burger-menu");
  burgerMenuCloseButton = document.querySelector(".nav-mobile__close");
  navigationMobile = document.querySelector(".nav-mobile");
  overlay = document.querySelector(".overlay");

  constructor() {
    this.burgerMenuOpenButton.addEventListener('click', this.burgerMenuOpen.bind(this))
    
    this.burgerMenuCloseButton.addEventListener('click', this.burgerMenuClose.bind(this))
    this.overlay.addEventListener('click', this.burgerMenuClose.bind(this))
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('overlay-hidden')) {
        this.burgerMenuClose();
      }
    })
  }

  burgerMenuOpen() {
    this.navigationMobile.style.transform = "translateX(0)";
    this.overlay.classList.remove('hidden')
  }

  burgerMenuClose() {
    this.navigationMobile.style.transform = "translateX(-100%)";
    this.overlay.classList.add('hidden')
  }
}

export default new BurgerMenu()
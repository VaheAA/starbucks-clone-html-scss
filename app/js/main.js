const btn = document.querySelector('#menu-btn');
const mobileMenu = document.querySelector('#menu');
const body = document.querySelector('body');
const accordionBtns = document.querySelectorAll('.title--xsm');
const menuLists = document.querySelectorAll('.footer__menu-list');

function navToggle() {
    btn.classList.toggle('open');
    mobileMenu.classList.toggle('hidden');
    body.classList.toggle('no-scroll');
}


accordionBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        menuLists.forEach((list, index2) => {
            if (index === index2) {
                list.classList.toggle('open');
            }
        });
    });
});
btn.addEventListener('click', navToggle);
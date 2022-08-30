window.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Tabs
    const tabsContent = document.querySelectorAll('.tabcontent'),// Табы сами с контентом
        tabsParent = document.querySelector('.tabheader__items'),// Обертка менюшки
        tabs = document.querySelectorAll('.tabheader__item');// Сами менюшки

    // Скрывает все табы
    function hideTabContent(){
        tabsContent.forEach(items => {
            items.classList.add('hide');
            items.classList.remove('show', 'fade');
        });
        tabs.forEach(items => {
            items.classList.remove('tabheader__item_active');
        });
    }

    // Показывает определенный таб
    function showTabContent(i = 0){
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();
    // При нажатий на одну из пункта меню выходит определенная менюшка
    // Здесь используется делегирование
    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if(target && target.classList.contains('tabheader__item')){
            tabs.forEach((item, i) => {
                if(target == item){
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    //timer
    const deadline = '2022-09-03';

    function getTimeRemaining(endtime){
        let days, hours, minutes, seconds;
        const t = Date.parse(endtime) - Date.parse(new Date());
        if (t <= 0){
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
        }else{
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor(t / (1000 * 60 * 60) % 24),
            minutes = Math.floor(t / (1000 * 60 ) % 60),
            seconds = Math.floor((t / 1000) % 60);
        }

        return {
            total: t,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        };
    }

    function setZero(num){
        if(num > 0 && num < 10){
            return `0${num}`;
        }else{
            return num;
        }
    }

    function setClock(selector, endtime){
        const timer = document.querySelector(selector),
              days = document.querySelector('#days'),
              hours = document.querySelector('#hours'),
              minutes = document.querySelector('#minutes'),
              seconds = document.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);

        updateClock();

        

        function updateClock(){
            const t = getTimeRemaining(endtime);

            days.textContent = setZero(t.days);
            hours.textContent = setZero(t.hours);
            minutes.textContent = setZero(t.minutes);
            seconds.textContent = setZero(t.seconds);

            if (t.total <= 0){
                clearInterval(timeInterval);
            }
        }
    }

    setClock('.timer', deadline);

    //Modal

    const modalBtn = document.querySelectorAll('[data-modal]'),
          modalWindow = document.querySelector('.modal'),
          modalClose = document.querySelector('.modal__close');

    function closeModal(){
        modalWindow.classList.add('hide');
        modalWindow.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showModal(){
        modalWindow.classList.add('show');
        modalWindow.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearTimeout(modalTimerId);
    }

    function showModalByScroll(){
        if (window.pageYOffset + document.documentElement.clientHeight >=document.documentElement.scrollHeight){
            showModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }
    
    modalBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal();
        });
    });
    
    modalClose.addEventListener('click', closeModal);

    modalWindow.addEventListener('click', (e) => {
        const target = e.target;
        if(target && target === modalWindow){
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.code === 'Escape' && modalWindow.classList.contains('show')){
            closeModal();
        }
    });
    const modalTimerId = setTimeout(showModal, 30000);
    
    window.addEventListener('scroll', showModalByScroll);

    
});
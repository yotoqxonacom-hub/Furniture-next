// SCSS module declaration
declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

// Swiper declarations (if needed)
declare module 'swiper';
declare module 'swiper/css';
declare module 'swiper/css/*';
declare module 'swiper/react';
declare module 'swiper/vue';
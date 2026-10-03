/**
 * Header photos for every page, in one place.
 * To change a page's photo, replace the file in public/img/pages/ (keep the name)
 * or point the entry below to another file.
 */
export const PAGE_IMAGES = {
	main: '/img/pages/mainpage.jpg', // home hero + home announcement (promo)
	shop: '/img/pages/shop.jpg',
	agent: '/img/pages/agent.jpg', // sellers list + seller profile
	community: '/img/pages/community.jpg',
	help: '/img/pages/help.jpg', // help center (notices, FAQ, terms)
	mypage: '/img/pages/mypage.jpg', // my page + member page
	about: '/img/pages/about.jpg', // about + login/sign up
} as const;

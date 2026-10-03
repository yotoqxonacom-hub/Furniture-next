import { useEffect } from 'react';
import { Router } from 'next/router';

const KEY = 'scroll-positions';
const MAX_WAIT_MS = 4000; // stop waiting for late content after this
const STEP_MS = 50;

const readPositions = (): Record<string, number> => {
	try {
		return JSON.parse(sessionStorage.getItem(KEY) ?? '{}');
	} catch {
		return {};
	}
};

const savePosition = (url: string, y: number) => {
	try {
		const positions = readPositions();
		positions[url] = y;
		sessionStorage.setItem(KEY, JSON.stringify(positions));
	} catch {
		/* private mode: just no restore */
	}
};

/**
 * Back / forward brings the page back to where the user was (home → product → Back lands on the
 * same product row, not on the header).
 *
 * The browser's own restore runs too early: home sections are still loading, the page is short, so it
 * ends at the top. Here the position is saved per URL before leaving and, after a Back/Forward, the page
 * is scrolled again on every frame until it is tall enough (or the user scrolls by himself).
 * New links (push) still open at the top, as Next.js does by default.
 */
const useScrollRestoration = (router: Router) => {
	useEffect(() => {
		if (!('scrollRestoration' in window.history)) return;
		window.history.scrollRestoration = 'manual';

		let isPopState = false;
		let cancelRestore: (() => void) | null = null;

		const onRouteStart = () => {
			cancelRestore?.();
			savePosition(router.asPath, window.scrollY);
		};

		const onRouteComplete = () => {
			if (!isPopState) return;
			isPopState = false;
			// router.asPath (not the event's url) so the key never contains the locale prefix
			const target = readPositions()[router.asPath];
			if (!target) return;

			const startedAt = Date.now();
			let timer: ReturnType<typeof setTimeout>;
			const stop = () => {
				clearTimeout(timer);
				window.removeEventListener('wheel', stop);
				window.removeEventListener('touchstart', stop);
				window.removeEventListener('keydown', stop);
				cancelRestore = null;
			};
			const attempt = () => {
				const reachable = document.documentElement.scrollHeight - window.innerHeight >= target;
				window.scrollTo(0, target);
				if (reachable || Date.now() - startedAt > MAX_WAIT_MS) stop();
				else timer = setTimeout(attempt, STEP_MS);
			};
			// the user taking over the scroll wins
			window.addEventListener('wheel', stop, { passive: true });
			window.addEventListener('touchstart', stop, { passive: true });
			window.addEventListener('keydown', stop);
			cancelRestore = stop;
			attempt();
		};

		const onBeforeUnload = () => savePosition(router.asPath, window.scrollY);

		router.beforePopState(() => {
			isPopState = true;
			return true;
		});
		router.events.on('routeChangeStart', onRouteStart);
		router.events.on('routeChangeComplete', onRouteComplete);
		window.addEventListener('beforeunload', onBeforeUnload);

		return () => {
			cancelRestore?.();
			router.beforePopState(() => true);
			router.events.off('routeChangeStart', onRouteStart);
			router.events.off('routeChangeComplete', onRouteComplete);
			window.removeEventListener('beforeunload', onBeforeUnload);
			window.history.scrollRestoration = 'auto';
		};
	}, [router]);
};

export default useScrollRestoration;

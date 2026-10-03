import { useEffect, useState } from 'react';

/**
 * Furniture uses one responsive markup for every page (CSS media queries handle phones),
 * so components no longer branch on the device. The hook is kept for the admin panel,
 * which is desktop-only, and returns 'desktop' or 'mobile' based on the viewport width.
 */
const useDeviceDetect = (): string => {
	const [device, setDevice] = useState('desktop');

	useEffect(() => {
		const detect = () => setDevice(window.innerWidth <= 900 ? 'mobile' : 'desktop');
		detect();
		window.addEventListener('resize', detect);
		return () => window.removeEventListener('resize', detect);
	}, []);

	return device;
};

export default useDeviceDetect;

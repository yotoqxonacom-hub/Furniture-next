export enum ProductType {
	SOFA = 'SOFA',
	CORNER_SOFA = 'CORNER_SOFA',
	ARMCHAIR = 'ARMCHAIR',
	BED = 'BED',
	POUF = 'POUF',
	MATTRESS = 'MATTRESS',
	KIDS = 'KIDS',
}

export const productTypeLabel: Record<string, string> = {
	SOFA: 'Sofa',
	CORNER_SOFA: 'Corner sofa',
	ARMCHAIR: 'Armchair',
	BED: 'Bed',
	POUF: 'Pouf',
	MATTRESS: 'Mattress',
	KIDS: 'Kids',
};

/** category illustration (home "Shop by category" tiles, hero search picker) */
export const productTypeIcon: Record<string, string> = {
	SOFA: '/img/furniture/cat-sofa.svg',
	CORNER_SOFA: '/img/furniture/cat-corner-sofa.svg',
	ARMCHAIR: '/img/furniture/cat-armchair.svg',
	BED: '/img/furniture/cat-bed.svg',
	POUF: '/img/furniture/cat-pouf.svg',
	MATTRESS: '/img/furniture/cat-mattress.svg',
	KIDS: '/img/furniture/cat-kids.svg',
};

export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

export enum ProductLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}

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

import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';

/** our 'kr' route prefix is Korean, whose language tag is 'ko' */
const htmlLang = (locale?: string) => (locale === 'kr' ? 'ko' : locale ?? 'en');

export default function Document(props: DocumentProps) {
	return (
		<Html lang={htmlLang(props.__NEXT_DATA__?.locale)}>
			<Head>
				<meta name="robots" content="index,follow" />
				<meta name="theme-color" content="#FAF7F2" />
				<link rel="icon" type="image/svg+xml" href="/img/furniture/favicon.svg" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap"
				/>

				{/* SEO */}
				<meta name="keywords" content={'furniture, sofa, bed, armchair, mattress, korea, furniture marketplace'} />
				<meta
					name={'description'}
					content={
						'Furniture — buy and sell sofas, beds, armchairs and more across South Korea. ' +
						'Покупайте и продавайте мебель по всей Южной Корее. ' +
						'대한민국 어디서나 소파, 침대, 안락의자를 사고팔 수 있는 가구 마켓.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

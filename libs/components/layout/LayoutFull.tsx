import React from 'react';
import Shell from './Shell';

const withLayoutFull = (Component: any) => {
	return (props: any) => {
		return (
			<Shell offsetTop>
				<Component {...props} />
			</Shell>
		);
	};
};

export default withLayoutFull;

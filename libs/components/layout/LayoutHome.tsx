import React from 'react';
import Shell from './Shell';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		return (
			<Shell>
				<Component {...props} />
			</Shell>
		);
	};
};

export default withLayoutMain;

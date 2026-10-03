import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProducts
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProducts
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProducts
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PRODUCT        *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productType
			productStatus
			productLocation
			productAddress
			productTitle
			productPrice
			productSquare
			productBeds
			productRooms
			productStock
			productViews
			productLikes
			productImages
			productDesc
			productBarter
			memberId
			soldAt
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productType
			productStatus
			productLocation
			productAddress
			productTitle
			productPrice
			productSquare
			productBeds
			productRooms
			productStock
			productViews
			productLikes
			productImages
			productDesc
			productBarter
			memberId
			soldAt
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(productId: $input) {
			_id
			productType
			productStatus
			productLocation
			productAddress
			productTitle
			productPrice
			productSquare
			productBeds
			productRooms
			productStock
			productViews
			productLikes
			productImages
			productDesc
			productBarter
			memberId
			soldAt
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *     NOTIFICATION       *
 *************************/

export const READ_NOTIFICATION = gql`
	mutation ReadNotification($input: String!) {
		readNotification(notificationId: $input) {
			_id
			notificationStatus
		}
	}
`;

export const READ_ALL_NOTIFICATIONS = gql`
	mutation ReadAllNotifications {
		readAllNotifications
	}
`;

/**************************
 *        REPORT          *
 *************************/

export const CREATE_REPORT = gql`
	mutation CreateReport($input: ReportInput!) {
		createReport(input: $input) {
			_id
			reportStatus
			reportGroup
			reportReason
			reportDesc
			reportRefId
			memberId
			createdAt
		}
	}
`;

/**************************
 *        MESSAGES        *
 *************************/

export const SEND_MESSAGE = gql`
	mutation SendMessage($input: MessageInput!) {
		sendMessage(input: $input) {
			_id
			conversationKey
			senderId
			receiverId
			messageText
			messageStatus
			createdAt
		}
	}
`;

export const MARK_CONVERSATION_READ = gql`
	mutation MarkConversationRead($input: String!) {
		markConversationRead(partnerId: $input)
	}
`;

/**************************
 *      CART / ORDER      *
 *************************/

const CART_ITEM_FIELDS = `
	_id
	productId
	quantity
	updatedAt
`;

export const ADD_TO_CART = gql`
	mutation AddToCart($input: CartItemInput!) {
		addToCart(input: $input) {
			${CART_ITEM_FIELDS}
		}
	}
`;

export const UPDATE_CART_ITEM = gql`
	mutation UpdateCartItem($input: CartItemInput!) {
		updateCartItem(input: $input) {
			${CART_ITEM_FIELDS}
		}
	}
`;

export const REMOVE_CART_ITEM = gql`
	mutation RemoveCartItem($input: String!) {
		removeCartItem(productId: $input) {
			_id
			productId
		}
	}
`;

export const CLEAR_CART = gql`
	mutation ClearCart {
		clearCart
	}
`;

export const CREATE_ORDERS = gql`
	mutation CreateOrders($input: OrderInput!) {
		createOrders(input: $input) {
			_id
			orderStatus
			orderTotal
			agentId
		}
	}
`;

export const PAY_ORDERS = gql`
	mutation PayOrders($input: PaymentInput!) {
		payOrders(input: $input) {
			_id
			paymentMethod
			paymentStatus
			paymentAmount
			transactionKey
			orderIds
			paidAt
		}
	}
`;

export const CANCEL_ORDER = gql`
	mutation CancelOrder($orderId: String!, $cancelReason: String) {
		cancelOrder(orderId: $orderId, cancelReason: $cancelReason) {
			_id
			orderStatus
			cancelledAt
		}
	}
`;

export const UPDATE_ORDER_STATUS_BY_SELLER = gql`
	mutation UpdateOrderStatusBySeller($input: OrderStatusInput!) {
		updateOrderStatusBySeller(input: $input) {
			_id
			orderStatus
			updatedAt
		}
	}
`;

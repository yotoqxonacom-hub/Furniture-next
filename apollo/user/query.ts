import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
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
				memberFollowers
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
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
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
        meLiked {
					memberId
					likeRefId
					myFavorite
				}
    }
}
`);

/**************************
 *        PRODUCT        *
 *************************/

export const GET_PRODUCT = gql`
	query GetProduct($input: String!) {
		getProduct(productId: $input) {
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
			memberData {
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
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
				memberFollowers
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
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
				productRank
				productImages
				productDesc
				productBarter
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PRODUCTS = gql`
	query GetAgentProducts($input: AgentProductsInquiry!) {
		getAgentProducts(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
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
				productComments
				productRank
				productImages
				productDesc
				productBarter
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
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
				productComments
				productRank
				productImages
				productDesc
				productBarter
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
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
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
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
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
					memberFollowers
					meFollowed {
						followingId
						followerId
						myFollowing
					}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *     NOTICE / FAQ       *
 *************************/

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/** FAQ needs only question + answer (keeps the query safe if old rows miss meta fields) */
export const GET_FAQS = gql`
	query GetFaqs($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
				_id
				noticeTitle
				noticeContent
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *     NOTIFICATION       *
 *************************/

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				authorId
				receiverId
				productId
				articleId
				orderId
				orderStatus
				createdAt
				authorData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
			unreadCount
		}
	}
`;

/**************************
 *        REPORT          *
 *************************/

export const GET_MY_REPORTS = gql`
	query GetMyReports($input: ReportsInquiry!) {
		getMyReports(input: $input) {
			list {
				_id
				reportStatus
				reportGroup
				reportReason
				reportDesc
				reportRefId
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        MESSAGES        *
 *************************/

export const GET_CONVERSATIONS = gql`
	query GetConversations {
		getConversations {
			list {
				conversationKey
				partnerId
				unreadCount
				partnerOnline
				partnerData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
				lastMessage {
					_id
					senderId
					receiverId
					messageText
					messageStatus
					createdAt
				}
			}
			totalUnread
		}
	}
`;

export const GET_MESSAGES = gql`
	query GetMessages($input: MessagesInquiry!) {
		getMessages(input: $input) {
			list {
				_id
				conversationKey
				senderId
				receiverId
				messageText
				messageStatus
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      CART / ORDER      *
 *************************/

const ORDER_FIELDS = `
	_id
	orderStatus
	orderSubtotal
	orderDeliveryFee
	orderTotal
	shippingAddress {
		recipientName
		recipientPhone
		city
		address
		note
	}
	memberId
	agentId
	paymentId
	cancelReason
	paidAt
	processedAt
	shippedAt
	deliveredAt
	cancelledAt
	createdAt
	updatedAt
	orderItems {
		_id
		productId
		itemQuantity
		itemPrice
		productTitle
		productImage
	}
`;

const ORDER_MEMBER_FIELDS = `
	_id
	memberType
	memberNick
	memberFullName
	memberImage
	memberPhone
`;

export const GET_CART_COUNT = gql`
	query GetCartCount {
		getCartCount
	}
`;

export const GET_MY_CART = gql`
	query GetMyCart {
		getMyCart {
			list {
				_id
				productId
				quantity
				createdAt
				productData {
					_id
					productType
					productStatus
					productLocation
					productTitle
					productPrice
					productStock
					productImages
					memberId
					memberData {
						_id
						memberNick
						memberFullName
						memberImage
					}
				}
			}
			totalQuantity
			subtotal
			deliveryFee
			total
		}
	}
`;

export const GET_MY_ORDERS = gql`
	query GetMyOrders($input: OrdersInquiry!) {
		getMyOrders(input: $input) {
			list {
				${ORDER_FIELDS}
				agentData {
					${ORDER_MEMBER_FIELDS}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_SELLER_ORDERS = gql`
	query GetSellerOrders($input: OrdersInquiry!) {
		getSellerOrders(input: $input) {
			list {
				${ORDER_FIELDS}
				memberData {
					${ORDER_MEMBER_FIELDS}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ORDER = gql`
	query GetOrder($input: String!) {
		getOrder(orderId: $input) {
			${ORDER_FIELDS}
			memberData {
				${ORDER_MEMBER_FIELDS}
			}
			agentData {
				${ORDER_MEMBER_FIELDS}
			}
		}
	}
`;

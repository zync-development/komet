import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Icon from "@components/Icon";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";
import { ServerDiscoveryStore } from "@stores";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	min-height: 100vh;
	padding: 2rem;
	background: var(--background-primary);
	color: white;
	position: relative;
`;

const BackButton = styled.button`
	position: absolute;
	top: 2rem;
	left: 2rem;
	background: var(--background-secondary);
	border: 1px solid var(--background-secondary-alt);
	border-radius: 8px;
	padding: 12px 16px;
	color: white;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;

	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--background-secondary-highlight);
	}

	&:active {
		background: var(--background-secondary-alt);
	}
`;

const Header = styled.h1`
	font-size: 2.5rem;
	font-weight: bold;
	margin: 2rem 0 1rem 0;
	color: var(--text);
	text-align: center;
`;

const Subtitle = styled.p`
	font-size: 1.1rem;
	color: var(--text-secondary);
	margin: 0 0 2rem 0;
	text-align: center;
	max-width: 600px;
	line-height: 1.5;
`;

const SearchContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	max-width: 600px;
	width: 100%;
	margin-bottom: 2rem;
`;

const SearchInput = styled.input`
	flex: 1;
	background: var(--background-secondary);
	border: 1px solid var(--primary);
	border-radius: 8px;
	padding: 16px 20px;
	font-size: 16px;
	color: white;
	outline: none;
	transition: all 0.2s ease;

	&::placeholder {
		color: var(--text-muted);
	}

	&:focus {
		border-color: var(--primary-light);
		box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
	}
`;

const SearchButton = styled.button`
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 8px;
	padding: 16px 24px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: var(--primary-light);
		transform: translateY(-1px);
	}

	&:active {
		background: var(--primary-dark);
		transform: translateY(0);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		transform: none;
	}
`;

const FiltersContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	max-width: 600px;
	width: 100%;
	margin-bottom: 2rem;
	flex-wrap: wrap;
	justify-content: center;
`;

const FilterButton = styled.button<{ active?: boolean }>`
	background: ${props => props.active ? 'var(--primary)' : 'var(--background-secondary)'};
	color: white;
	border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--background-secondary-alt)'};
	border-radius: 20px;
	padding: 8px 16px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: ${props => props.active ? 'var(--primary-light)' : 'var(--background-secondary-highlight)'};
		border-color: ${props => props.active ? 'var(--primary-light)' : 'var(--background-secondary-highlight)'};
	}
`;

const ServersGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1.5rem;
	max-width: 1200px;
	width: 100%;
	margin-bottom: 2rem;
`;

const ServerCard = styled.div`
	background: var(--background-secondary);
	border: 1px solid var(--background-secondary-alt);
	border-radius: 12px;
	padding: 1.5rem;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--primary);
		transform: translateY(-2px);
	}
`;

const ServerHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const ServerIcon = styled.div<{ hasIcon: boolean }>`
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: ${props => props.hasIcon ? 'transparent' : 'var(--primary)'};
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	font-weight: bold;
	color: white;
	overflow: hidden;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

const ServerInfo = styled.div`
	flex: 1;
`;

const ServerName = styled.h3`
	font-size: 1.2rem;
	font-weight: 600;
	margin: 0 0 0.25rem 0;
	color: var(--text);
`;

const ServerMembers = styled.p`
	font-size: 0.9rem;
	color: var(--text-secondary);
	margin: 0;
`;

const ServerDescription = styled.p`
	font-size: 0.9rem;
	color: var(--text-secondary);
	margin: 0 0 1rem 0;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const ServerFeatures = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
`;

const FeatureTag = styled.span`
	background: var(--background-tertiary);
	color: var(--text-secondary);
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 0.8rem;
`;

const JoinButton = styled.button`
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 8px;
	padding: 8px 16px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 100%;
	margin-top: 1rem;

	&:hover {
		background: var(--primary-light);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
	}
`;

const PaginationContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
`;

const PaginationButton = styled.button`
	background: var(--background-secondary);
	color: white;
	border: 1px solid var(--background-secondary-alt);
	border-radius: 8px;
	padding: 8px 16px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-secondary-highlight);
		border-color: var(--background-secondary-highlight);
	}

	&:disabled {
		background: var(--background-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
	}
`;

const PageInfo = styled.span`
	color: var(--text-secondary);
	font-size: 14px;
`;

const LoadingSpinner = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	color: var(--text-secondary);
`;

const NoResults = styled.div`
	text-align: center;
	padding: 2rem;
	color: var(--text-secondary);
`;

const ErrorBanner = styled.div`
	background: var(--error);
	color: white;
	padding: 1rem;
	border-radius: 8px;
	margin-bottom: 1rem;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
`;

interface DiscoverableGuild {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	discovery_splash: string | null;
	member_count: number;
	features: string[];
	primary_category_id?: string;
}

interface DiscoveryResponse {
	guilds: DiscoverableGuild[];
	total: number;
	offset: number;
	limit: number;
}

function ServerDiscoveryPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();
	const app = useAppStore();
	const discoveryStore = app.serverDiscovery;

	useEffect(() => {
		discoveryStore.loadCategories();
		discoveryStore.loadServers();
	}, [discoveryStore.currentPage, discoveryStore.selectedCategory]);

	const handleSearch = () => {
		discoveryStore.searchServers(searchQuery);
	};

	const handleCategoryFilter = (categoryId: string | null) => {
		discoveryStore.filterByCategory(categoryId);
	};

	const handleJoinServer = async (serverId: string) => {
		// TODO: Implement join server logic
		console.log("Joining server:", serverId);
		// Navigate to the server after joining
		navigate(`/channels/${serverId}`);
	};

	const handleBack = () => {
		navigate("/channels/@me");
	};

	return (
		<Container>
			<BackButton onClick={handleBack}>
				<Icon icon="mdiArrowLeft" size="16px" />
				Back
			</BackButton>

			<Header>Server Discovery</Header>
			<Subtitle>
				Find and join amazing communities. Discover servers based on your interests.
			</Subtitle>

			{discoveryStore.error && (
				<ErrorBanner>
					<Icon icon="mdiAlertCircle" size="20px" />
					{discoveryStore.error}
				</ErrorBanner>
			)}

			<SearchContainer>
				<SearchInput
					type="text"
					placeholder="Search for servers..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyPress={(e) => e.key === "Enter" && handleSearch()}
				/>
				<SearchButton onClick={handleSearch} disabled={discoveryStore.loading}>
					<Icon icon="mdiMagnify" size="16px" />
					{discoveryStore.loading ? "Searching..." : "Search"}
				</SearchButton>
				<SearchButton onClick={() => discoveryStore.refreshServers()} disabled={discoveryStore.loading}>
					<Icon icon="mdiRefresh" size="16px" />
					{discoveryStore.loading ? "Refreshing..." : "Refresh"}
				</SearchButton>
			</SearchContainer>

			<FiltersContainer>
				<FilterButton
					active={!discoveryStore.selectedCategory}
					onClick={() => handleCategoryFilter(null)}
				>
					All Categories
				</FilterButton>
				{discoveryStore.categories.map(category => (
					<FilterButton
						key={category.id}
						active={discoveryStore.selectedCategory === category.id}
						onClick={() => handleCategoryFilter(category.id)}
					>
						{category.name}
					</FilterButton>
				))}
			</FiltersContainer>

			{discoveryStore.loading ? (
				<LoadingSpinner>
					<Icon icon="mdiLoading" size="24px" />
					Loading servers...
				</LoadingSpinner>
			) : discoveryStore.filteredServers.length === 0 ? (
				<NoResults>
					<Icon icon="mdiServerOff" size="48px" />
					<p>No servers found matching your criteria.</p>
				</NoResults>
			) : (
				<ServersGrid>
					{discoveryStore.filteredServers.map(server => (
						<ServerCard key={server.id}>
							<ServerHeader>
								<ServerIcon hasIcon={!!server.icon}>
									{server.icon ? (
										<img
											src={`${app.rest.makeCDNUrl(`/guild-icons/${server.id}/${server.icon}`)}`}
											alt={server.name}
										/>
									) : (
										server.name.charAt(0).toUpperCase()
									)}
								</ServerIcon>
								<ServerInfo>
									<ServerName>{server.name}</ServerName>
									<ServerMembers>
										{server.member_count.toLocaleString()} members
									</ServerMembers>
								</ServerInfo>
							</ServerHeader>
							
							{server.description && (
								<ServerDescription>{server.description}</ServerDescription>
							)}
							
							<ServerFeatures>
								{server.features.slice(0, 3).map(feature => (
									<FeatureTag key={feature}>{feature}</FeatureTag>
								))}
								{server.features.length > 3 && (
									<FeatureTag>+{server.features.length - 3} more</FeatureTag>
								)}
							</ServerFeatures>
							
							<JoinButton onClick={() => handleJoinServer(server.id)}>
								Join Server
							</JoinButton>
						</ServerCard>
					))}
				</ServersGrid>
			)}

			{discoveryStore.totalPages > 1 && (
				<PaginationContainer>
					<PaginationButton
						onClick={() => discoveryStore.goToPreviousPage()}
						disabled={discoveryStore.currentPage === 0}
					>
						<Icon icon="mdiChevronLeft" size="16px" />
						Previous
					</PaginationButton>
					
					<PageInfo>
						Page {discoveryStore.currentPage + 1} of {discoveryStore.totalPages}
					</PageInfo>
					
					<PaginationButton
						onClick={() => discoveryStore.goToNextPage()}
						disabled={discoveryStore.currentPage === discoveryStore.totalPages - 1}
					>
						Next
						<Icon icon="mdiChevronRight" size="16px" />
					</PaginationButton>
				</PaginationContainer>
			)}
		</Container>
	);
}

export default observer(ServerDiscoveryPage);

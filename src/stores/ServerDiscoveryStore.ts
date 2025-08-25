import { action, computed, makeAutoObservable, observable } from "mobx";
import { Logger } from "@utils";
import AppStore from "./AppStore";
import REST from "@utils/REST";

export interface DiscoverableGuild {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	discovery_splash: string | null;
	member_count: number;
	features: string[];
	primary_category_id?: string;
}

export interface DiscoveryCategory {
	id: string;
	name: string;
	icon?: string;
	is_primary: boolean;
}

export interface DiscoveryResponse {
	guilds: DiscoverableGuild[];
	total: number;
	offset: number;
	limit: number;
}

export default class ServerDiscoveryStore {
	private readonly logger: Logger = new Logger("ServerDiscoveryStore");
	private readonly app: AppStore;

	@observable servers: DiscoverableGuild[] = [];
	@observable categories: DiscoveryCategory[] = [];
	@observable loading = false;
	@observable error: string | null = null;
	@observable currentPage = 0;
	@observable totalServers = 0;
	@observable selectedCategory: string | null = null;
	@observable searchQuery = "";
	@observable lastFetchTime = 0;

	// Cache settings
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	private readonly ITEMS_PER_PAGE = 12;

	constructor(app: AppStore) {
		this.app = app;
		makeAutoObservable(this);
	}

	@computed
	get totalPages() {
		return Math.ceil(this.totalServers / this.ITEMS_PER_PAGE);
	}

	@computed
	get filteredServers() {
		if (!this.searchQuery) return this.servers;
		
		return this.servers.filter(server =>
			server.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
			(server.description && server.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
		);
	}

	@computed
	get hasCachedData() {
		return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
	}

	@action
	setSearchQuery(query: string) {
		this.searchQuery = query;
	}

	@action
	setSelectedCategory(categoryId: string | null) {
		this.selectedCategory = categoryId;
		this.currentPage = 0;
	}

	@action
	setCurrentPage(page: number) {
		this.currentPage = page;
	}

	@action
	async loadCategories() {
		if (this.categories.length > 0 && this.hasCachedData) {
			return;
		}

		try {
			this.logger.debug("Loading discovery categories");
			const response = await fetch(`${REST.makeAPIUrl("/discovery/categories")}`);
			
			if (!response.ok) {
				throw new Error(`Failed to load categories: ${response.status}`);
			}

			const data = await response.json();
			this.categories = data;
			this.lastFetchTime = Date.now();
		} catch (error) {
			this.logger.error("Failed to load categories:", error);
			this.error = "Failed to load categories";
		}
	}

	@action
	async loadServers(forceRefresh = false) {
		if (!forceRefresh && this.hasCachedData && this.servers.length > 0) {
			return;
		}

		this.loading = true;
		this.error = null;

		try {
			this.logger.debug("Loading discoverable servers");
			
			const params = new URLSearchParams({
				limit: this.ITEMS_PER_PAGE.toString(),
				offset: (this.currentPage * this.ITEMS_PER_PAGE).toString(),
			});

			if (this.selectedCategory) {
				params.append("categories", this.selectedCategory);
			}

			const response = await fetch(`${REST.makeAPIUrl("/discoverable-guilds")}?${params}`);
			
			if (!response.ok) {
				throw new Error(`Failed to load servers: ${response.status}`);
			}

			const data: DiscoveryResponse = await response.json();
			
			this.servers = data.guilds;
			this.totalServers = data.total || 0;
			this.lastFetchTime = Date.now();
		} catch (error) {
			this.logger.error("Failed to load servers:", error);
			this.error = "Failed to load servers";
		} finally {
			this.loading = false;
		}
	}

	@action
	async refreshServers() {
		await this.loadServers(true);
	}

	@action
	async searchServers(query: string) {
		this.setSearchQuery(query);
		this.setCurrentPage(0);
		await this.loadServers(true);
	}

	@action
	async filterByCategory(categoryId: string | null) {
		this.setSelectedCategory(categoryId);
		await this.loadServers(true);
	}

	@action
	async goToPage(page: number) {
		this.setCurrentPage(page);
		await this.loadServers();
	}

	@action
	async goToNextPage() {
		if (this.currentPage < this.totalPages - 1) {
			await this.goToPage(this.currentPage + 1);
		}
	}

	@action
	async goToPreviousPage() {
		if (this.currentPage > 0) {
			await this.goToPage(this.currentPage - 1);
		}
	}

	@action
	clearError() {
		this.error = null;
	}

	@action
	reset() {
		this.servers = [];
		this.categories = [];
		this.loading = false;
		this.error = null;
		this.currentPage = 0;
		this.totalServers = 0;
		this.selectedCategory = null;
		this.searchQuery = "";
		this.lastFetchTime = 0;
	}
}

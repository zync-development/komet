import { action, computed, makeAutoObservable, observable, ObservableMap } from "mobx";
import { APIRelationshipType } from "@spacebarchat/spacebar-api-types/v9";
import AppStore from "./AppStore";

export interface Relationship {
	id: string;
	type: APIRelationshipType;
	nickname?: string | null;
	user: {
		id: string;
		username: string;
		discriminator: string;
		avatar?: string | null;
		public_flags?: number;
	};
}

export default class RelationshipStore {
	private readonly app: AppStore;
	@observable readonly relationships: ObservableMap<string, Relationship>;

	constructor(app: AppStore) {
		this.app = app;
		this.relationships = observable.map();
		makeAutoObservable(this);
	}

	@action
	add(relationship: Relationship) {
		this.relationships.set(relationship.id, relationship);
	}

	@action
	addAll(relationships: Relationship[]) {
		relationships.forEach((relationship) => this.add(relationship));
	}

	@action
	update(relationship: Relationship) {
		const existing = this.relationships.get(relationship.id);
		if (existing) {
			Object.assign(existing, relationship);
		} else {
			this.add(relationship);
		}
	}

	@action
	remove(id: string) {
		this.relationships.delete(id);
	}

	get(id: string) {
		return this.relationships.get(id);
	}

	@computed
	get all() {
		return Array.from(this.relationships.values());
	}

	@computed
	get friends() {
		return this.all.filter(r => r.type === APIRelationshipType.Friends);
	}

	@computed
	get incomingRequests() {
		return this.all.filter(r => r.type === APIRelationshipType.Incoming);
	}

	@computed
	get outgoingRequests() {
		return this.all.filter(r => r.type === APIRelationshipType.Outgoing);
	}

	@computed
	get blocked() {
		return this.all.filter(r => r.type === APIRelationshipType.Blocked);
	}

	@computed
	get count() {
		return this.relationships.size;
	}

	@computed
	get friendsCount() {
		return this.friends.length;
	}

	@computed
	get incomingRequestsCount() {
		return this.incomingRequests.length;
	}

	@computed
	get outgoingRequestsCount() {
		return this.outgoingRequests.length;
	}

	@computed
	get blockedCount() {
		return this.blocked.length;
	}

	has(id: string) {
		return this.relationships.has(id);
	}

	isFriend(id: string) {
		return this.friends.some(r => r.user.id === id);
	}

	hasIncomingRequest(id: string) {
		return this.incomingRequests.some(r => r.user.id === id);
	}

	hasOutgoingRequest(id: string) {
		return this.outgoingRequests.some(r => r.user.id === id);
	}

	isBlocked(id: string) {
		return this.blocked.some(r => r.user.id === id);
	}

	async fetchRelationships() {
		try {
			const response = await this.app.rest.get<Relationship[]>("/api/v9/users/@me/relationships");
			if (response) {
				this.addAll(response);
			}
		} catch (error) {
			console.error("Failed to fetch relationships:", error);
		}
	}

	async sendFriendRequest(username: string, discriminator: string) {
		try {
			await this.app.rest.post("/api/v9/users/@me/relationships", {
				username,
				discriminator: parseInt(discriminator),
				type: APIRelationshipType.Friends
			});
			
			// Refresh relationships after sending request
			await this.fetchRelationships();
			return true;
		} catch (error) {
			console.error("Failed to send friend request:", error);
			throw error;
		}
	}

	async acceptFriendRequest(userId: string) {
		try {
			await this.app.rest.put(`/api/v9/users/@me/relationships/${userId}`, {
				type: APIRelationshipType.Friends
			});
			
			// Refresh relationships after accepting request
			await this.fetchRelationships();
			return true;
		} catch (error) {
			console.error("Failed to accept friend request:", error);
			throw error;
		}
	}

	async removeFriend(userId: string) {
		try {
			await this.app.rest.delete(`/api/v9/users/@me/relationships/${userId}`);
			
			// Remove from local store
			this.remove(userId);
			return true;
		} catch (error) {
			console.error("Failed to remove friend:", error);
			throw error;
		}
	}

	async blockUser(userId: string) {
		try {
			await this.app.rest.put(`/api/v9/users/@me/relationships/${userId}`, {
				type: APIRelationshipType.Blocked
			});
			
			// Refresh relationships after blocking
			await this.fetchRelationships();
			return true;
		} catch (error) {
			console.error("Failed to block user:", error);
			throw error;
		}
	}

	async unblockUser(userId: string) {
		try {
			await this.app.rest.delete(`/api/v9/users/@me/relationships/${userId}`);
			
			// Remove from local store
			this.remove(userId);
			return true;
		} catch (error) {
			console.error("Failed to unblock user:", error);
			throw error;
		}
	}
}
